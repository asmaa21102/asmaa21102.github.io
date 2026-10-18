(() => {
  const { t, api, errText, applyStatic } = ST;
  const $ = (s) => document.querySelector(s);
  const form = $('#form');
  let mode = 'login';

  api('/me').then((r) => r.user && location.replace('app.html')).catch(() => {});

  function render() {
    applyStatic();
    const reg = mode === 'register';
    document.querySelectorAll('.reg-only').forEach((el) => (el.hidden = !reg));
    $('#auth-title').textContent = reg ? t('signup') : t('signin');
    $('#submit-label').textContent = reg ? t('signup') : t('signin');
    $('#switch-q').textContent = reg ? t('have_account') : t('no_account');
    $('#switch').textContent = reg ? t('signin') : t('signup');
    form.password.autocomplete = reg ? 'new-password' : 'current-password';
  }
  function setMode(m) { mode = m; $('#error').textContent = ''; render(); (m === 'register' ? form.username : form.email).focus(); }

  async function go(body) {
    const btn = $('#submit');
    btn.classList.add('loading');
    $('#error').textContent = '';
    try {
      await api(mode === 'login' ? '/login' : '/register', { method: 'POST', body: { ...body, locale: ST.lang } });
      location.replace('app.html');
    } catch (e) {
      $('#error').textContent = errText(e);
      form.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    } finally {
      btn.classList.remove('loading');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(form));
    if (!body.email || !body.password || (mode === 'register' && !body.username)) return ($('#error').textContent = t('err_required'));
    go(body);
  });
  $('#switch').addEventListener('click', (e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); });
  $('#pw-toggle').addEventListener('click', () => { form.password.type = form.password.type === 'password' ? 'text' : 'password'; });
  $('#demo').addEventListener('click', () => { mode = 'login'; render(); go({ email: 'demo@smarttask.test', password: 'Demo12345' }); });
  $('#lang').addEventListener('click', () => { ST.nextLang(); render(); });
  $('#theme').addEventListener('click', () => ST.toggleTheme());
  render();
})();
