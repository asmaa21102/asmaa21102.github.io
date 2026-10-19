// Service worker of the Smart Lab browser demo. The app runs in a frame under ./app/; its PHP
// pages, uploaded reports and the analyzer upload are answered by the shell page (index.html,
// which runs PHP in a worker) instead of a server. Other files (CSS, images, JS) load normally.
const SCOPE = new URL("./", self.location.href).pathname; // e.g. /live/smart-lab/
const APP = SCOPE + "app/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const isDynamic = (path) => path === APP || path.endsWith(".php") || path.startsWith(APP + "uploads/") || path === APP + "upload-analyzer";

async function shellClient() {
  const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  return all.find((c) => c.frameType === "top-level" && new URL(c.url).pathname.replace(/index\.html$/, "") === SCOPE);
}

async function forward(request) {
  const url = new URL(request.url);
  const shell = await shellClient();
  if (!shell) {
    // opened directly: go through the shell, which starts PHP and loads this page in its frame
    return Response.redirect(`${SCOPE}?go=${encodeURIComponent(url.pathname.slice(APP.length) + url.search)}`, 302);
  }
  const headers = {};
  request.headers.forEach((v, k) => { headers[k] = v; });
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : new Uint8Array(await request.arrayBuffer());
  const channel = new MessageChannel();
  const reply = new Promise((resolve) => { channel.port1.onmessage = (e) => resolve(e.data); });
  shell.postMessage({ type: "request", request: { method: request.method, url: url.pathname.slice(APP.length - 1) + url.search, headers, body } }, [channel.port2]);
  const res = await reply;
  if (res.error) return new Response(res.error, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const h = new Headers();
  for (const [k, vals] of Object.entries(res.headers || {})) if (k.toLowerCase() !== "set-cookie") for (const v of [].concat(vals)) h.append(k, v);
  const status = res.status || 200;
  return new Response([204, 205, 304].includes(status) ? null : res.body, { status, headers: h });
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || !isDynamic(url.pathname)) return; // network as usual
  e.respondWith(forward(e.request));
});
