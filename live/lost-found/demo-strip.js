// The strip at the top of the browser demo: says the copy runs in this browser, offers a
// reset, and shows the progress while the photo AI model downloads on first use.
(() => {
  const lang = (() => {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    try { return fromUrl || localStorage.getItem("lf-lang") || (navigator.language || "en").slice(0, 2); } catch { return "en"; }
  })();
  const T = {
    ar: { note: "نسخة تجريبية تعمل كاملة في متصفحك — البيانات تُحفظ على جهازك فقط.", reset: "إعادة ضبط", loading: "تحميل نموذج الصور (مرة واحدة، نحو 90 ميغابايت)…", ready: "نموذج الصور جاهز", error: "تعذّر تحميل نموذج الصور" },
    en: { note: "Demo version running fully in your browser — data is saved on this device only.", reset: "Reset", loading: "Downloading the photo model (once, about 90 MB)…", ready: "Photo model ready", error: "The photo model could not be loaded" },
    tr: { note: "Tamamen tarayıcınızda çalışan deneme sürümü — veriler yalnızca bu cihazda saklanır.", reset: "Sıfırla", loading: "Fotoğraf modeli indiriliyor (bir kez, yaklaşık 90 MB)…", ready: "Fotoğraf modeli hazır", error: "Fotoğraf modeli yüklenemedi" },
  }[["ar", "en", "tr"].includes(lang) ? lang : "en"];

  const css = document.createElement("style");
  css.textContent = `.demo-strip{position:relative;z-index:2000;display:flex;gap:.6rem;align-items:center;justify-content:center;flex-wrap:wrap;padding:.45rem 1rem;font:500 .8rem/1.4 system-ui,sans-serif;background:#0f2a43;color:#e6f1fb;text-align:center}
.demo-strip button{border:1px solid #e6f1fb66;background:transparent;color:inherit;border-radius:999px;padding:.15rem .7rem;font:inherit;cursor:pointer}
.demo-strip button:hover{background:#e6f1fb22}.demo-strip .ai{opacity:.85}`;
  document.head.append(css);

  const bar = document.createElement("div");
  bar.className = "demo-strip";
  bar.setAttribute("role", "note");
  bar.dir = lang === "ar" ? "rtl" : "ltr";
  const note = document.createElement("span");
  note.textContent = T.note;
  const ai = document.createElement("span");
  ai.className = "ai";
  ai.setAttribute("aria-live", "polite");
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = T.reset;
  reset.onclick = () => window.LF_DEMO?.reset();
  bar.append(note, ai, reset);
  document.body.prepend(bar);

  addEventListener("lf-ai-progress", (e) => {
    const s = e.detail;
    ai.textContent = s.status === "loading" ? `· ${T.loading} ${s.progress ? s.progress + "%" : ""}` : s.status === "ready" ? `· ${T.ready} ✓` : s.status === "error" ? `· ${T.error}` : "";
  });
})();
