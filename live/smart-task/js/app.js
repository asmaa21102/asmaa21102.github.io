(() => {
  const { t, esc, api, errText, applyStatic, toast, store } = ST;
  const $ = (s) => document.querySelector(s);
  const FILTERS = [['all', '📋'], ['today', '☀️'], ['upcoming', '📅'], ['overdue', '⚠️'], ['completed', '✅']];
  const state = { user: null, filter: 'all', category: null, q: '', sort: 'due', tasks: [], cats: [], stats: null, editing: null };

  // ── dates ──────────────────────────────────────────────────────────
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = () => ymd(new Date());
  const tomorrowStr = () => { const d = new Date(); d.setDate(d.getDate() + 1); return ymd(d); };
  const dueOf = (task) => new Date(`${task.due_date.slice(0, 10)}T${task.due_time.slice(0, 5)}:00`);
  const fmtDate = (s) => new Date(s + 'T12:00:00').toLocaleDateString(ST.locale(), { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtTime = (s) => s.slice(0, 5);
  /** 1110 minutes → "18 h 30 min"; 0 or less → "" (due now). */
  const fmtDur = (m) => {
    if (m <= 0) return '';
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    return [d && `${d} ${t('u_day')}`, h && `${h} ${t('u_hour')}`, !d && mm && `${mm} ${t('u_min')}`].filter(Boolean).join(' ');
  };

  // ── loading ────────────────────────────────────────────────────────
  async function boot() {
    try {
      const me = await api('/me');
      if (!me.user) return location.replace('index.html');
      state.user = me.user;
      if (!new URLSearchParams(location.search).get('lang') && !store.get('st-lang', '') && me.user.locale) ST.setLang(me.user.locale);
    } catch { return location.replace('index.html'); }
    applyStatic();
    await Promise.all([loadCats(), refresh()]);
    notifButton();
    setInterval(checkReminders, 20000);
    setInterval(() => renderList(), 60000); // keep "overdue" labels fresh
  }
  async function loadCats() { state.cats = await api('/categories'); renderSide(); }
  async function refresh() {
    const query = { filter: state.filter, sort: state.sort };
    if (state.category) query.category = state.category;
    if (state.q) query.q = state.q;
    const [tasks, stats] = await Promise.all([api('/tasks', { query }), api('/stats')]);
    state.tasks = tasks;
    state.stats = stats;
    renderAll();
    checkReminders();
  }

  // ── rendering ──────────────────────────────────────────────────────
  function renderAll() { renderSide(); renderStats(); renderList(); }

  function renderSide() {
    $('#hello').textContent = t('hello', state.user?.username || '');
    const s = state.stats || {};
    const counts = { all: s.pending, today: s.today, overdue: s.overdue, completed: s.completed };
    $('#filters').innerHTML = FILTERS.map(([f, ic]) => `<button class="nav ${state.filter === f && !state.category ? 'on' : ''}" data-filter="${f}"><span>${ic}</span><b>${t(f)}</b>${counts[f] ? `<em class="${f === 'overdue' ? 'warn' : ''}">${counts[f]}</em>` : ''}</button>`).join('');
    $('#cats').innerHTML = state.cats.map((c) => `<div class="cat ${state.category === c.id ? 'on' : ''}"><button class="nav" data-cat="${c.id}"><i style="background:${esc(c.color)}"></i><b>${esc(c.name)}</b>${c.open ? `<em>${c.open}</em>` : ''}</button><button class="icon tiny" data-del-cat="${c.id}" aria-label="${esc(t('delete'))}">✕</button></div>`).join('');
    $('#cat-select').innerHTML = `<option value="">${esc(t('none'))}</option>` + state.cats.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    const cat = state.cats.find((c) => c.id === state.category);
    $('#view-title').textContent = cat ? cat.name : t(state.filter);
    $('#today-date').textContent = new Date().toLocaleDateString(ST.locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function renderStats() {
    const s = state.stats;
    if (!s) return;
    const max = Math.max(1, ...s.week.map((d) => d.done));
    const pct = s.today ? Math.round((100 * s.today_done) / s.today) : 0;
    $('#stats').innerHTML = `
      <div class="stat ring-stat"><svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="15.9" class="trk"/><circle cx="18" cy="18" r="15.9" class="val" style="stroke-dasharray:${pct} 100"/></svg><div><small>${t('s_today')}</small><b>${t('of', s.today_done, s.today)}</b></div></div>
      <div class="stat"><small>${t('s_rate')}</small><b>${s.rate}%</b></div>
      <div class="stat ${s.overdue ? 'warn' : ''}"><small>${t('s_overdue')}</small><b>${s.overdue}</b></div>
      <div class="stat"><small>${t('s_streak')}</small><b>🔥 ${s.streak}</b></div>
      <div class="stat week"><small>${t('s_week')}</small><div class="bars">${s.week.map((d) => `<i title="${d.date}: ${d.done}" style="height:${8 + (d.done / max) * 36}px" class="${d.date === todayStr() ? 'now' : ''}"></i>`).join('')}</div></div>`;
  }

  function card(task) {
    const done = task.status === 'Completed';
    const late = !done && dueOf(task) < new Date();
    const subs = task.subtasks || [];
    const subDone = subs.filter((s) => s.done).length;
    const prio = { Low: 'low', Medium: 'med', High: 'high' }[task.priority_level];
    const cat = state.cats.find((c) => c.id === task.category_id);
    return `<article class="task ${done ? 'done' : ''} ${late ? 'late' : ''}" data-id="${task.id}">
      <button class="check" data-toggle="${task.id}" aria-label="${esc(t('mark_done'))}" aria-pressed="${done}">${done ? '✓' : ''}</button>
      <div class="body" data-edit="${task.id}">
        <h3>${esc(task.title)}</h3>
        ${task.description ? `<p>${esc(task.description)}</p>` : ''}
        <div class="meta">
          <span class="chip ${late ? 'warn' : ''}">🕒 ${esc(fmtDate(task.due_date.slice(0, 10)))} · ${esc(fmtTime(task.due_time))}${late ? ' · ' + esc(t('late_by')) : ''}</span>
          <span class="chip p-${prio}">${esc(t(task.priority_level))}</span>
          ${cat ? `<span class="chip" style="--c:${esc(cat.color)}"><i class="cdot"></i>${esc(cat.name)}</span>` : ''}
          ${task.repeat_rule !== 'none' ? `<span class="chip">🔁 ${esc(t(task.repeat_rule))}</span>` : ''}
          ${subs.length ? `<span class="chip">☑ ${subDone}/${subs.length}</span>` : ''}
        </div>
        ${subs.length ? `<div class="subbar"><i style="width:${(100 * subDone) / subs.length}%"></i></div>` : ''}
      </div>
    </article>`;
  }

  function renderList() {
    const tasks = state.tasks;
    if (!tasks.length) {
      $('#list').innerHTML = `<div class="empty"><div class="empty-ic">🗒️</div><h3>${t('empty')}</h3><p>${t('empty_p')}</p><button class="btn primary" id="empty-new">＋ ${t('new_task')}</button></div>`;
      return;
    }
    if (state.sort !== 'due' || state.filter === 'completed') {
      $('#list').innerHTML = tasks.map(card).join('');
      return;
    }
    const now = new Date();
    const groups = { g_overdue: [], g_today: [], g_tomorrow: [], g_later: [], g_done: [] };
    for (const task of tasks) {
      const d = task.due_date.slice(0, 10);
      if (task.status === 'Completed') groups.g_done.push(task);
      else if (dueOf(task) < now) groups.g_overdue.push(task);
      else if (d === todayStr()) groups.g_today.push(task);
      else if (d === tomorrowStr()) groups.g_tomorrow.push(task);
      else groups.g_later.push(task);
    }
    $('#list').innerHTML = Object.entries(groups).filter(([, v]) => v.length).map(([k, v]) => `<h2 class="group ${k === 'g_overdue' ? 'warn' : ''}">${t(k)} <em>${v.length}</em></h2>${v.map(card).join('')}`).join('');
  }

  // ── task form ──────────────────────────────────────────────────────
  const form = $('#task-form');
  let newSubs = [];
  function openForm(task) {
    state.editing = task || null;
    form.reset();
    $('#form-error').textContent = '';
    $('#modal-title').textContent = task ? t('edit_task') : t('new_task');
    $('#delete').hidden = !task;
    const soon = new Date(Date.now() + 60 * 60 * 1000);
    form.title.value = task?.title || '';
    form.description.value = task?.description || '';
    form.due_date.value = task ? task.due_date.slice(0, 10) : ymd(soon);
    form.due_time.value = task ? fmtTime(task.due_time) : `${pad(soon.getHours())}:00`;
    form.querySelector(`[name=priority_level][value=${task?.priority_level || 'Medium'}]`).checked = true;
    form.category_id.value = task?.category_id || (state.category || '');
    form.remind_before.value = String(task?.remind_before ?? 10);
    form.repeat_rule.value = task?.repeat_rule || 'none';
    newSubs = [];
    renderSubs();
    $('#modal').hidden = false;
    requestAnimationFrame(() => $('#modal').classList.add('show'));
    form.title.focus();
  }
  function closeForm() { $('#modal').classList.remove('show'); setTimeout(() => ($('#modal').hidden = true), 180); }
  function renderSubs() {
    const subs = state.editing ? state.editing.subtasks || [] : newSubs.map((title, i) => ({ id: 'n' + i, title, done: false }));
    $('#subs').innerHTML = subs.map((s) => `<li class="${s.done ? 'done' : ''}"><button type="button" class="check sm" data-sub="${s.id}" aria-pressed="${s.done}">${s.done ? '✓' : ''}</button><span>${esc(s.title)}</span><button type="button" class="icon tiny" data-del-sub="${s.id}" aria-label="${esc(t('delete'))}">✕</button></li>`).join('');
  }
  $('#sub-input').addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const title = e.target.value.trim();
    if (!title) return;
    e.target.value = '';
    if (state.editing) {
      const s = await api(`/tasks/${state.editing.id}/subtasks`, { method: 'POST', body: { title } });
      (state.editing.subtasks ||= []).push(s);
    } else newSubs.push(title);
    renderSubs();
  });
  $('#subs').addEventListener('click', async (e) => {
    const sub = e.target.closest('[data-sub]')?.dataset.sub;
    const del = e.target.closest('[data-del-sub]')?.dataset.delSub;
    if (del) {
      if (state.editing) { await api(`/subtasks/${del}`, { method: 'DELETE' }); state.editing.subtasks = state.editing.subtasks.filter((s) => String(s.id) !== del); }
      else newSubs.splice(Number(del.slice(1)), 1);
      renderSubs();
    } else if (sub && state.editing) {
      const r = await api(`/subtasks/${sub}`, { method: 'PATCH', body: {} });
      state.editing.subtasks.find((s) => String(s.id) === sub).done = r.done;
      renderSubs();
    }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const body = { ...f, remind_before: Number(f.remind_before), category_id: f.category_id || null };
    if (!body.title.trim()) return ($('#form-error').textContent = t('err_required'));
    try {
      if (state.editing) { await api(`/tasks/${state.editing.id}`, { method: 'PATCH', body }); toast(t('saved')); }
      else { await api('/tasks', { method: 'POST', body: { ...body, subtasks: newSubs } }); toast(t('added')); }
      closeForm();
      await Promise.all([refresh(), loadCats()]);
    } catch (err) { $('#form-error').textContent = errText(err); }
  });
  $('#delete').addEventListener('click', async () => {
    if (!state.editing || !confirm(t('confirm_delete'))) return;
    await api(`/tasks/${state.editing.id}`, { method: 'DELETE' });
    toast(t('deleted'));
    closeForm();
    await Promise.all([refresh(), loadCats()]);
  });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeForm(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeForm(); });

  async function toggle(id) {
    const r = await api(`/tasks/${id}/toggle`, { method: 'POST' });
    if (r.status === 'Completed') toast(r.next ? t('next_toast', fmtDate(r.next.due_date)) : t('done_toast'));
    await Promise.all([refresh(), loadCats()]);
  }

  // ── reminders: in-page card + browser notification ───────────────
  const reminded = new Set(JSON.parse(store.get('st-reminded', '[]')));
  const snoozed = JSON.parse(store.get('st-snoozed', '{}'));
  const saveReminders = () => { store.set('st-reminded', JSON.stringify([...reminded].slice(-300))); store.set('st-snoozed', JSON.stringify(snoozed)); };
  function checkReminders() {
    const now = Date.now();
    for (const task of state.tasks) {
      if (task.status === 'Completed') continue;
      const due = dueOf(task).getTime();
      const key = `${task.id}@${task.due_date.slice(0, 10)}T${task.due_time.slice(0, 5)}`;
      const at = snoozed[key] || due - task.remind_before * 60000;
      if (now >= at && now <= due + 15 * 60000 && !reminded.has(key + '#' + at)) {
        reminded.add(key + '#' + at);
        saveReminders();
        showReminder(task, key, Math.round((due - now) / 60000));
      }
    }
  }
  function showReminder(task, key, minutes) {
    const el = document.createElement('div');
    el.className = 'reminder';
    el.innerHTML = `<b>${t('reminder')}</b><h4>${esc(task.title)}</h4><p>${esc(t('due_in', fmtDur(minutes)))} · ${esc(fmtTime(task.due_time))}</p><div class="row"><button class="btn primary sm" data-r="done">${t('mark_done')}</button><button class="btn ghost sm" data-r="snooze">${t('snooze')}</button><button class="icon tiny" data-r="close">✕</button></div>`;
    el.addEventListener('click', async (e) => {
      const a = e.target.dataset.r;
      if (!a) return;
      if (a === 'done') await toggle(task.id);
      if (a === 'snooze') { snoozed[key] = Date.now() + 10 * 60000; saveReminders(); }
      el.remove();
    });
    $('#reminders').appendChild(el);
    if ('Notification' in window && Notification.permission === 'granted') {
      try { new Notification(`${t('reminder')}: ${task.title}`, { body: t('due_in', fmtDur(minutes)), tag: key }); } catch {}
    }
  }
  function notifButton() {
    const b = $('#notif');
    if (!('Notification' in window)) return (b.hidden = true);
    b.textContent = Notification.permission === 'granted' ? t('notif_ok') : Notification.permission === 'denied' ? t('notif_denied') : t('notif_on');
    b.disabled = Notification.permission !== 'default';
  }

  // ── events ─────────────────────────────────────────────────────────
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('button, [data-edit]');
    if (!el) return;
    const d = el.dataset;
    if (d.filter) { state.filter = d.filter; state.category = null; await refresh(); closeMenu(); }
    else if (d.cat) { state.category = Number(d.cat); state.filter = 'all'; await refresh(); closeMenu(); }
    else if (d.delCat) { if (confirm(t('confirm_cat'))) { await api(`/categories/${d.delCat}`, { method: 'DELETE' }); if (state.category === Number(d.delCat)) state.category = null; await Promise.all([loadCats(), refresh()]); } }
    else if (d.toggle) await toggle(d.toggle);
    else if (d.edit) openForm(state.tasks.find((x) => String(x.id) === d.edit));
    else if (el.id === 'new' || el.id === 'empty-new') openForm();
    else if (el.id === 'add-cat') {
      const name = prompt(t('category_name'));
      if (name?.trim()) {
        const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#8b5cf6', '#ec4899'];
        try { await api('/categories', { method: 'POST', body: { name, color: colors[state.cats.length % colors.length] } }); await loadCats(); } catch (err) { toast(errText(err), 'bad'); }
      }
    }
    else if (el.id === 'logout') { await api('/logout', { method: 'POST' }); location.replace('index.html'); }
    else if (el.id === 'lang') { ST.nextLang(); api('/me', { method: 'PATCH', body: { locale: ST.lang } }).catch(() => {}); renderAll(); notifButton(); }
    else if (el.id === 'theme') ST.toggleTheme();
    else if (el.id === 'notif') { await Notification.requestPermission(); notifButton(); }
    else if (el.id === 'menu') $('#side').classList.toggle('open');
  });
  const closeMenu = () => $('#side').classList.remove('open');
  let st;
  $('#search').addEventListener('input', (e) => { clearTimeout(st); st = setTimeout(() => { state.q = e.target.value.trim(); refresh(); }, 250); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; refresh(); });

  boot();
})();
