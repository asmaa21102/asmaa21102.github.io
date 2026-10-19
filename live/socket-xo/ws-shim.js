// Browser demo of Socket Tic-Tac-Toe: the page's WebSocket to "/ws" is connected to the
// referee in room-server.js (a SharedWorker shared by all tabs of this site) instead of the
// Python server. Everything else in app.js is unchanged.
(() => {
  const here = document.currentScript.src;
  const shared = typeof SharedWorker !== "undefined";
  const worker = shared ? new SharedWorker(new URL("room-server.js", here), { name: "socket-xo" }) : new Worker(new URL("room-server.js", here));
  const port = shared ? worker.port : worker;
  const sockets = new Map();
  let seq = 0;
  port.onmessage = (e) => {
    const { id, kind, data } = e.data;
    const ws = sockets.get(id);
    if (!ws) return;
    if (kind === "open") { ws.readyState = 1; ws.onopen?.({ type: "open" }); }
    else if (kind === "message") ws.onmessage?.({ type: "message", data });
  };
  if (shared) port.start();
  setInterval(() => port.postMessage({ kind: "ping" }), 4000);
  addEventListener("pagehide", () => sockets.forEach((ws) => ws.close()));

  const RealWebSocket = window.WebSocket;
  class DemoSocket {
    constructor(url) {
      this.url = url;
      this.readyState = 0;
      this.id = ++seq;
      sockets.set(this.id, this);
      port.postMessage({ id: this.id, kind: "open" });
    }
    send(data) {
      if (this.readyState === 1) port.postMessage({ id: this.id, kind: "send", data: String(data) });
    }
    close() {
      if (this.readyState > 1) return;
      this.readyState = 3;
      port.postMessage({ id: this.id, kind: "close" });
      sockets.delete(this.id);
      setTimeout(() => this.onclose?.({ type: "close", code: 1000 }));
    }
  }
  window.WebSocket = function (url, protocols) {
    return /\/ws$/.test(String(url)) ? new DemoSocket(url) : new RealWebSocket(url, protocols);
  };

  // A note at the top, in the page's language.
  const lang = (() => { const p = new URLSearchParams(location.search).get("lang"); try { return p || localStorage.getItem("sx-lang") || "tr"; } catch { return "tr"; } })();
  const NOTE = {
    ar: "نسخة تجريبية: الحَكَم يعمل داخل متصفحك. افتح رابط الغرفة في تبويب أو نافذة ثانية على نفس الجهاز لتلعب ضد نفسك أو صديق بجانبك.",
    en: "Demo: the referee runs inside your browser. Open the room link in a second tab or window on this device to play against yourself or a friend next to you.",
    tr: "Deneme: hakem tarayıcınızda çalışıyor. Oda bağlantısını aynı cihazda ikinci bir sekmede ya da pencerede açın, kendinize veya yanınızdaki arkadaşınıza karşı oynayın.",
  };
  addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.setAttribute("role", "note");
    bar.dir = lang === "ar" ? "rtl" : "ltr";
    bar.textContent = NOTE[lang] || NOTE.en;
    bar.style.cssText = "position:relative;z-index:50;padding:.45rem 1rem;font:500 .8rem/1.4 system-ui,sans-serif;background:#1e1b4b;color:#e0e7ff;text-align:center";
    document.body.prepend(bar);
  });
})();
