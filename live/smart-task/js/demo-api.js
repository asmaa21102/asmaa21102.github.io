// Browser-only version of the Smart Task API (src/app.js), for the static portfolio site.
// It answers the page's fetch('/api/...') calls with the same rules as the real server, and keeps
// the data in this browser's localStorage. Load it before core.js.
(() => {
  const KEY = 'st-demo-db';
  const PRIORITIES = ['Low', 'Medium', 'High'];
  const REPEATS = ['none', 'daily', 'weekly', 'monthly'];
  const FILTERS = ['all', 'today', 'upcoming', 'overdue', 'completed'];
  const COLORS = /^#[0-9a-f]{6}$/i;
  const DEMO = { email: 'demo@smarttask.test', password: 'Demo12345' };

  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return ymd(d); };
  const hm = (h, m = 0) => `${pad(h)}:${pad(m)}:00`;
  const stamp = () => { const d = new Date(); return `${ymd(d)} ${hm(d.getHours(), d.getMinutes())}`; };

  class HttpError { constructor(status, code, fields) { Object.assign(this, { status, code, fields }); } }
  const bad = (code, fields) => new HttpError(422, code, fields);
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z'));
  const isTime = (v) => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(v);
  const normTime = (v) => (v.length === 5 ? v + ':00' : v);

  async function hash(password) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('st-demo:' + password));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // ── storage ───────────────────────────────────────────────────────
  let db;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  const nextId = (table) => (db.seq[table] = (db.seq[table] || 0) + 1);

  async function seed() {
    db = { seq: {}, users: [], categories: [], tasks: [], subtasks: [], session: null };
    const uid = nextId('users');
    db.users.push({ id: uid, username: 'Asmaa', email: DEMO.email, password_hash: await hash(DEMO.password), locale: 'ar' });
    const cat = {};
    for (const [name, color] of [['دراسة', '#6366f1'], ['عمل', '#f59e0b'], ['شخصي', '#10b981'], ['صحة', '#ec4899']]) {
      cat[name] = nextId('categories');
      db.categories.push({ id: cat[name], user_id: uid, name, color });
    }
    const soonD = new Date(Date.now() + 12 * 60000);
    const tasks = [
      { title: 'تسليم تقرير مشروع التخرج', description: 'مراجعة الفصل الرابع وإضافة النتائج والمراجع.', due_date: day(-1), due_time: hm(23, 0), priority_level: 'High', category_id: cat['دراسة'], subs: [['مراجعة الفصل الرابع', 1], ['إضافة جدول النتائج', 0], ['تنسيق المراجع', 0]] },
      { title: 'اجتماع فريق العمل', description: 'عرض تقدم الأسبوع على المشرف.', due_date: ymd(soonD), due_time: hm(soonD.getHours(), soonD.getMinutes()), priority_level: 'High', category_id: cat['عمل'], remind_before: 10 },
      { title: 'شرب الماء وتمرين خفيف', due_date: day(0), due_time: hm(18, 30), priority_level: 'Low', category_id: cat['صحة'], repeat_rule: 'daily', remind_before: 5 },
      { title: 'مذاكرة قواعد البيانات', description: 'JOIN وGROUP BY وتمارين الفصل السادس.', due_date: day(0), due_time: hm(21, 0), priority_level: 'Medium', category_id: cat['دراسة'], subs: [['حل 10 أسئلة JOIN', 0], ['مراجعة الفهارس', 0]] },
      { title: 'دفع فاتورة الإنترنت', due_date: day(1), due_time: hm(12, 0), priority_level: 'Medium', category_id: cat['شخصي'], repeat_rule: 'monthly', remind_before: 1440 },
      { title: 'مقابلة عمل (أونلاين)', description: 'تجهيز أسئلة عن المشاريع وتجربة الكاميرا قبلها.', due_date: day(2), due_time: hm(10, 30), priority_level: 'High', category_id: cat['عمل'], remind_before: 60 },
      { title: 'تحديث ملف الأعمال', due_date: day(4), due_time: hm(16, 0), priority_level: 'Medium', category_id: cat['عمل'], repeat_rule: 'weekly' },
    ];
    for (const { subs = [], ...row } of tasks) {
      const t = insertTask({ remind_before: 10, repeat_rule: 'none', ...row, user_id: uid });
      subs.forEach(([title, done], i) => db.subtasks.push({ id: nextId('subtasks'), task_id: t.id, title, done: !!done, position: i }));
    }
    const done = [[0, 'مراجعة البريد', 'عمل'], [-1, 'شراء أغراض البيت', 'شخصي'], [-1, 'حل واجب الإحصاء', 'دراسة'], [-2, 'تمرين 30 دقيقة', 'صحة'], [-3, 'قراءة فصل من كتاب', 'شخصي'], [-3, 'رفع الكود على GitHub', 'عمل'], [-5, 'حجز موعد طبيب', 'صحة']];
    for (const [d, title, c] of done) insertTask({ user_id: uid, title, due_date: day(d), due_time: hm(17), priority_level: 'Medium', status: 'Completed', completed_at: `${day(d)} 17:30:00`, category_id: cat[c] });
    save();
  }

  function insertTask(row) {
    const t = { id: nextId('tasks'), category_id: null, description: null, priority_level: 'Medium', status: 'Pending', remind_before: 10, repeat_rule: 'none', completed_at: null, created_at: stamp(), updated_at: stamp(), ...row };
    db.tasks.push(t);
    return t;
  }

  async function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
    if (!db || !db.users) await seed();
  }

  // ── same rules as src/app.js ──────────────────────────────────────
  function clientNow(query) {
    const m = String(query.get('now') || '').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (m) return { date: m[1], time: m[2] + ':00' };
    const d = new Date();
    return { date: ymd(d), time: hm(d.getHours(), d.getMinutes()) };
  }

  function nextDate(date, rule) {
    const d = new Date(date + 'T00:00:00Z');
    if (rule === 'daily') d.setUTCDate(d.getUTCDate() + 1);
    if (rule === 'weekly') d.setUTCDate(d.getUTCDate() + 7);
    if (rule === 'monthly') {
      const dd = d.getUTCDate();
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() + 1);
      const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
      d.setUTCDate(Math.min(dd, last));
    }
    return d.toISOString().slice(0, 10);
  }

  function taskInput(body, partial = false) {
    const out = {};
    const errors = {};
    const has = (k) => Object.prototype.hasOwnProperty.call(body, k);
    if (!partial || has('title')) { out.title = str(body.title, 160); if (!out.title) errors.title = 'required'; }
    if (has('description')) out.description = str(body.description, 4000) || null;
    if (!partial || has('due_date')) { out.due_date = String(body.due_date || ''); if (!isDate(out.due_date)) errors.due_date = 'invalid'; }
    if (!partial || has('due_time')) { out.due_time = String(body.due_time || ''); if (!isTime(out.due_time)) errors.due_time = 'invalid'; else out.due_time = normTime(out.due_time); }
    if (has('priority_level') || !partial) out.priority_level = PRIORITIES.includes(body.priority_level) ? body.priority_level : 'Medium';
    if (has('remind_before')) {
      const n = Number(body.remind_before);
      if (!Number.isInteger(n) || n < 0 || n > 10080) errors.remind_before = 'invalid';
      else out.remind_before = n;
    }
    if (has('repeat_rule')) { if (!REPEATS.includes(body.repeat_rule)) errors.repeat_rule = 'invalid'; else out.repeat_rule = body.repeat_rule; }
    if (has('category_id')) out.category_id = body.category_id ? Number(body.category_id) : null;
    if (Object.keys(errors).length) throw bad('validation', errors);
    return out;
  }

  const uid = () => { if (!db.session) throw new HttpError(401, 'unauthenticated'); return db.session; };
  const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email, locale: u.locale });
  const ownTask = (id, u) => { const t = db.tasks.find((x) => x.id === Number(id) && x.user_id === u); if (!t) throw new HttpError(404, 'not_found'); return t; };
  const ownCategory = (id, u) => { if (id != null && !db.categories.some((c) => c.id === id && c.user_id === u)) throw bad('validation', { category_id: 'invalid' }); };
  const ownSubtask = (id, u) => { const s = db.subtasks.find((x) => x.id === Number(id)); if (!s || !db.tasks.some((t) => t.id === s.task_id && t.user_id === u)) throw new HttpError(404, 'not_found'); return s; };
  const withSubtasks = (t) => {
    const c = db.categories.find((x) => x.id === t.category_id);
    return {
      ...t, category_name: c?.name ?? null, category_color: c?.color ?? null,
      subtasks: db.subtasks.filter((s) => s.task_id === t.id).sort((a, b) => a.position - b.position || a.id - b.id).map(({ id, title, done }) => ({ id, title, done: !!done })),
    };
  };
  const dueKey = (t) => `${t.due_date} ${t.due_time}`;
  const removeTask = (id) => { db.tasks = db.tasks.filter((t) => t.id !== id); db.subtasks = db.subtasks.filter((s) => s.task_id !== id); };

  const routes = [
    ['POST', /^\/register$/, async (_, b) => {
      const username = str(b.username, 40);
      const email = str(b.email, 190).toLowerCase();
      const password = typeof b.password === 'string' ? b.password : '';
      const errors = {};
      if (username.length < 2) errors.username = 'too_short';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'invalid';
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) errors.password = 'weak';
      if (Object.keys(errors).length) throw bad('validation', errors);
      if (db.users.some((u) => u.email === email)) throw bad('validation', { email: 'taken' });
      const locale = ['ar', 'en', 'tr'].includes(b.locale) ? b.locale : 'ar';
      const id = nextId('users');
      db.users.push({ id, username, email, password_hash: await hash(password), locale });
      const names = { ar: ['دراسة', 'عمل', 'شخصي'], tr: ['Okul', 'İş', 'Kişisel'], en: ['Study', 'Work', 'Personal'] }[locale];
      names.forEach((name, i) => db.categories.push({ id: nextId('categories'), user_id: id, name, color: ['#6366f1', '#f59e0b', '#10b981'][i] }));
      db.session = id;
      return [201, { user: { id, username, email, locale } }];
    }],
    ['POST', /^\/login$/, async (_, b) => {
      const email = str(b.email, 190).toLowerCase();
      const user = db.users.find((u) => u.email === email);
      if (!user || user.password_hash !== (await hash(typeof b.password === 'string' ? b.password : ''))) throw new HttpError(401, 'invalid_login');
      db.session = user.id;
      return { user: publicUser(user) };
    }],
    ['POST', /^\/logout$/, () => { db.session = null; return { ok: true }; }],
    ['GET', /^\/me$/, () => { const u = db.users.find((x) => x.id === db.session); return { user: u ? publicUser(u) : null }; }],
    ['PATCH', /^\/me$/, (_, b) => { const u = db.users.find((x) => x.id === uid()); if (['ar', 'en', 'tr'].includes(b.locale)) u.locale = b.locale; return { ok: true }; }],

    ['GET', /^\/categories$/, () => {
      const u = uid();
      return db.categories.filter((c) => c.user_id === u).map((c) => ({ id: c.id, name: c.name, color: c.color, open: db.tasks.filter((t) => t.category_id === c.id && t.status === 'Pending').length }));
    }],
    ['POST', /^\/categories$/, (_, b) => {
      const u = uid();
      const name = str(b.name, 40);
      const color = COLORS.test(b.color) ? b.color : '#6366f1';
      if (!name) throw bad('validation', { name: 'required' });
      if (db.categories.some((c) => c.user_id === u && c.name.toLowerCase() === name.toLowerCase())) throw bad('validation', { name: 'taken' });
      const id = nextId('categories');
      db.categories.push({ id, user_id: u, name, color });
      return [201, { id, name, color, open: 0 }];
    }],
    ['DELETE', /^\/categories\/(\d+)$/, ([id]) => {
      const u = uid();
      const c = db.categories.find((x) => x.id === Number(id) && x.user_id === u);
      if (!c) throw new HttpError(404, 'not_found');
      db.categories = db.categories.filter((x) => x !== c);
      db.tasks.forEach((t) => { if (t.category_id === c.id) t.category_id = null; });
      return { ok: true };
    }],

    ['GET', /^\/tasks$/, (_, __, query) => {
      const u = uid();
      const now = clientNow(query);
      const nowDT = `${now.date} ${now.time}`;
      const filter = FILTERS.includes(query.get('filter')) ? query.get('filter') : 'all';
      const search = str(query.get('q') || '', 100).toLowerCase();
      let list = db.tasks.filter((t) => t.user_id === u);
      if (filter === 'today') list = list.filter((t) => t.due_date === now.date);
      if (filter === 'upcoming') list = list.filter((t) => t.status === 'Pending' && dueKey(t) >= nowDT);
      if (filter === 'overdue') list = list.filter((t) => t.status === 'Pending' && dueKey(t) < nowDT);
      if (filter === 'completed') list = list.filter((t) => t.status === 'Completed');
      if (query.get('category')) list = list.filter((t) => t.category_id === Number(query.get('category')));
      if (PRIORITIES.includes(query.get('priority'))) list = list.filter((t) => t.priority_level === query.get('priority'));
      if (search) list = list.filter((t) => t.title.toLowerCase().includes(search) || (t.description || '').toLowerCase().includes(search));
      const rank = { High: 0, Medium: 1, Low: 2 };
      const sort = query.get('sort');
      list.sort(sort === 'priority' ? (a, b) => rank[a.priority_level] - rank[b.priority_level] || dueKey(a).localeCompare(dueKey(b))
        : sort === 'created' ? (a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id
        : (a, b) => (a.status === 'Completed') - (b.status === 'Completed') || dueKey(a).localeCompare(dueKey(b)));
      return list.slice(0, 500).map(withSubtasks);
    }],
    ['POST', /^\/tasks$/, (_, b) => {
      const u = uid();
      const input = taskInput(b);
      ownCategory(input.category_id, u);
      const t = insertTask({ ...input, user_id: u });
      const subs = Array.isArray(b.subtasks) ? b.subtasks.map((s) => str(s, 160)).filter(Boolean).slice(0, 30) : [];
      subs.forEach((title, i) => db.subtasks.push({ id: nextId('subtasks'), task_id: t.id, title, done: false, position: i }));
      return [201, withSubtasks(t)];
    }],
    ['PATCH', /^\/tasks\/(\d+)$/, ([id], b) => {
      const u = uid();
      const t = ownTask(id, u);
      const input = taskInput(b, true);
      if ('category_id' in input) ownCategory(input.category_id, u);
      Object.assign(t, input, { updated_at: stamp() });
      return withSubtasks(t);
    }],
    ['POST', /^\/tasks\/(\d+)\/toggle$/, ([id]) => {
      const t = ownTask(id, uid());
      let next = null;
      const was = t.status;
      if (was === 'Pending') {
        Object.assign(t, { status: 'Completed', completed_at: stamp() });
        if (t.repeat_rule !== 'none') {
          const { id: _id, created_at, updated_at, completed_at, status, ...copy } = t;
          const n = insertTask({ ...copy, due_date: nextDate(t.due_date, t.repeat_rule) });
          db.subtasks.filter((s) => s.task_id === t.id).forEach((s) => db.subtasks.push({ id: nextId('subtasks'), task_id: n.id, title: s.title, done: false, position: s.position }));
          next = { id: n.id, due_date: n.due_date };
        }
      } else {
        Object.assign(t, { status: 'Pending', completed_at: null });
      }
      return { ok: true, status: was === 'Pending' ? 'Completed' : 'Pending', next };
    }],
    ['DELETE', /^\/tasks\/(\d+)$/, ([id]) => { removeTask(ownTask(id, uid()).id); return { ok: true }; }],

    ['POST', /^\/tasks\/(\d+)\/subtasks$/, ([id], b) => {
      const t = ownTask(id, uid());
      const title = str(b.title, 160);
      if (!title) throw bad('validation', { title: 'required' });
      const pos = Math.max(-1, ...db.subtasks.filter((s) => s.task_id === t.id).map((s) => s.position)) + 1;
      const s = { id: nextId('subtasks'), task_id: t.id, title, done: false, position: pos };
      db.subtasks.push(s);
      return [201, { id: s.id, title, done: false }];
    }],
    ['PATCH', /^\/subtasks\/(\d+)$/, ([id], b) => { const s = ownSubtask(id, uid()); s.done = b.done === undefined ? !s.done : !!b.done; return { id: s.id, done: s.done }; }],
    ['DELETE', /^\/subtasks\/(\d+)$/, ([id]) => { const s = ownSubtask(id, uid()); db.subtasks = db.subtasks.filter((x) => x !== s); return { ok: true }; }],

    ['GET', /^\/stats$/, (_, __, query) => {
      const u = uid();
      const now = clientNow(query);
      const nowDT = `${now.date} ${now.time}`;
      const mine = db.tasks.filter((t) => t.user_id === u);
      const count = (f) => mine.filter(f).length;
      const doneOn = (d) => count((t) => t.completed_at && t.completed_at.slice(0, 10) === d);
      const week = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.date + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - i);
        const key = d.toISOString().slice(0, 10);
        week.push({ date: key, done: doneOn(key) });
      }
      const doneDays = new Set(mine.filter((t) => t.completed_at).map((t) => t.completed_at.slice(0, 10)));
      let streak = 0;
      const d = new Date(now.date + 'T00:00:00Z');
      if (!doneDays.has(now.date)) d.setUTCDate(d.getUTCDate() - 1);
      while (doneDays.has(d.toISOString().slice(0, 10))) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
      const total = mine.length;
      const completed = count((t) => t.status === 'Completed');
      return {
        total, completed, pending: count((t) => t.status === 'Pending'), overdue: count((t) => t.status === 'Pending' && dueKey(t) < nowDT),
        today: count((t) => t.due_date === now.date), today_done: count((t) => t.due_date === now.date && t.status === 'Completed'),
        rate: total ? Math.round((100 * completed) / total) : 0,
        week, streak,
        by_priority: Object.fromEntries(PRIORITIES.map((p) => [p, count((t) => t.status === 'Pending' && t.priority_level === p)])),
      };
    }],
  ];

  const ready = load();
  const realFetch = window.fetch.bind(window);
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return realFetch(input, init);
    await ready;
    const method = (init.method || 'GET').toUpperCase();
    const path = url.pathname.slice(4);
    let body = {};
    try { body = init.body ? JSON.parse(init.body) : {}; } catch { return json(400, { error: 'bad_request' }); }
    for (const [m, re, handler] of routes) {
      const match = method === m && path.match(re);
      if (!match) continue;
      try {
        const out = await handler(match.slice(1), body, url.searchParams);
        save();
        return Array.isArray(out) && typeof out[0] === 'number' ? json(out[0], out[1]) : json(200, out);
      } catch (e) {
        if (e instanceof HttpError) return json(e.status, { error: e.code, fields: e.fields });
        console.error(e);
        return json(500, { error: 'server_error' });
      }
    }
    return json(404, { error: 'not_found' });
  };

  // A small strip so visitors know this copy runs only in their browser.
  const NOTE = {
    ar: 'نسخة تجريبية تعمل في متصفحك — البيانات تُحفظ على جهازك فقط.',
    en: 'Demo version running in your browser — data is saved on this device only.',
    tr: 'Tarayıcınızda çalışan deneme sürümü — veriler yalnızca bu cihazda saklanır.',
  };
  const RESET = { ar: 'إعادة ضبط', en: 'Reset', tr: 'Sıfırla' };
  addEventListener('DOMContentLoaded', () => {
    const lang = (() => { try { return localStorage.getItem('st-lang') || 'ar'; } catch { return 'ar'; } })();
    const bar = document.createElement('div');
    bar.className = 'demo-strip';
    bar.setAttribute('role', 'note');
    bar.innerHTML = `<span></span> <button type="button"></button>`;
    bar.querySelector('span').textContent = NOTE[lang] || NOTE.en;
    bar.querySelector('button').textContent = RESET[lang] || RESET.en;
    bar.querySelector('button').onclick = () => { try { localStorage.removeItem(KEY); } catch {} location.replace('index.html'); };
    const css = document.createElement('style');
    css.textContent = '.demo-strip{position:relative;z-index:50;display:flex;gap:.6rem;align-items:center;justify-content:center;flex-wrap:wrap;padding:.45rem 1rem;font:500 .8rem/1.4 system-ui,sans-serif;background:#3b1d3a;color:#fde7f3;text-align:center}.demo-strip button{border:1px solid #fde7f366;background:transparent;color:inherit;border-radius:999px;padding:.15rem .7rem;font:inherit;cursor:pointer}.demo-strip button:hover{background:#fde7f322}';
    document.head.append(css);
    document.body.prepend(bar);
  });
})();
