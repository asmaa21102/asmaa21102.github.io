// Shared helpers: language, theme, API calls and safe HTML.
(() => {
  const LANGS = ['ar', 'en', 'tr'];
  const store = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const urlLang = new URLSearchParams(location.search).get('lang');
  let lang = LANGS.includes(urlLang) ? urlLang : store.get('st-lang', 'ar');
  if (!LANGS.includes(lang)) lang = 'ar';
  if (store.get('st-theme', '') === 'dark') document.documentElement.classList.add('dark');

  const t = (k, ...a) => { const v = I18N[lang][k] ?? I18N.en[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const localNow = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

  async function api(path, { method = 'GET', body, query } = {}) {
    const qs = new URLSearchParams({ ...(query || {}), now: localNow() }).toString();
    let res;
    try {
      res = await fetch(`/api${path}?${qs}`, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: body ? JSON.stringify(body) : undefined });
    } catch {
      throw { error: 'network' };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  }
  const errKey = (code) => (I18N[lang]['err_' + code] ? t('err_' + code) : t('err_generic'));
  const errText = (e) => (e?.fields ? Object.values(e.fields).map(errKey).join(' · ') : errKey(e?.error));

  function applyStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-t]').forEach((el) => (el.textContent = t(el.dataset.t)));
    document.querySelectorAll('[data-t-ph]').forEach((el) => (el.placeholder = t(el.dataset.tPh)));
    document.querySelectorAll('[data-t-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.tAria)));
    document.querySelectorAll('.lang-btn').forEach((b) => (b.textContent = LANGS[(LANGS.indexOf(lang) + 1) % 3].toUpperCase()));
  }

  let toastTimer;
  function toast(msg, kind = 'ok') {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.className = 'toast show ' + kind;
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  window.ST = {
    get lang() { return lang; },
    setLang(l) { lang = l; store.set('st-lang', l); applyStatic(); },
    nextLang() { this.setLang(LANGS[(LANGS.indexOf(lang) + 1) % 3]); },
    toggleTheme() { store.set('st-theme', document.documentElement.classList.toggle('dark') ? 'dark' : 'light'); },
    t, esc, api, errText, applyStatic, toast, store, localNow,
    locale: () => ({ ar: 'ar-u-nu-latn', en: 'en-GB', tr: 'tr-TR' })[lang],
  };
})();
