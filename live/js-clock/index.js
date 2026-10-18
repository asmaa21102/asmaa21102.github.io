(() => {
    'use strict';
    const $ = (s) => document.querySelector(s);
    const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

    const T = {
        tr: { clock: 'Saat', world: 'Dünya saatleri', stopwatch: 'Kronometre', timer: 'Zamanlayıcı', h24: '24 saat', h12: '12 saat', day_progress: 'Günün', lap: 'Tur', start: 'Başlat', pause: 'Duraklat', resume: 'Devam', reset: 'Sıfırla', min: 'dk', sec: 'sn', done: 'Süre doldu!', add: '+ Şehir ekle', remove: 'Kaldır', ahead: (h) => `${h} sa ileri`, behind: (h) => `${h} sa geri`, same: 'Aynı saat', morning: 'Günaydın', afternoon: 'Tünaydın', evening: 'İyi akşamlar', night: 'İyi geceler', fastest: 'en hızlı', slowest: 'en yavaş' },
        en: { clock: 'Clock', world: 'World clock', stopwatch: 'Stopwatch', timer: 'Timer', h24: '24-hour', h12: '12-hour', day_progress: 'Day', lap: 'Lap', start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset', min: 'min', sec: 'sec', done: "Time's up!", add: '+ Add city', remove: 'Remove', ahead: (h) => `${h} h ahead`, behind: (h) => `${h} h behind`, same: 'Same time', morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Good night', fastest: 'fastest', slowest: 'slowest' },
        ar: { clock: 'الساعة', world: 'ساعات العالم', stopwatch: 'ساعة إيقاف', timer: 'مؤقّت', h24: '24 ساعة', h12: '12 ساعة', day_progress: 'مضى من اليوم', lap: 'لفّة', start: 'ابدأ', pause: 'إيقاف مؤقت', resume: 'استئناف', reset: 'تصفير', min: 'دقيقة', sec: 'ثانية', done: 'انتهى الوقت!', add: '+ أضف مدينة', remove: 'إزالة', ahead: (h) => `متقدمة ${h} س`, behind: (h) => `متأخرة ${h} س`, same: 'نفس التوقيت', morning: 'صباح الخير', afternoon: 'نهارك سعيد', evening: 'مساء الخير', night: 'تصبح على خير', fastest: 'الأسرع', slowest: 'الأبطأ' },
    };
    const LANGS = ['tr', 'en', 'ar'];
    const LOCALE = { tr: 'tr-TR', en: 'en-GB', ar: 'ar-u-nu-latn' };
    const CITIES = {
        'Europe/Istanbul': { tr: 'İstanbul', en: 'Istanbul', ar: 'إسطنبول' },
        'Asia/Gaza': { tr: 'Gazze', en: 'Gaza', ar: 'غزة' },
        'Europe/London': { tr: 'Londra', en: 'London', ar: 'لندن' },
        'America/New_York': { tr: 'New York', en: 'New York', ar: 'نيويورك' },
        'Asia/Dubai': { tr: 'Dubai', en: 'Dubai', ar: 'دبي' },
        'Asia/Tokyo': { tr: 'Tokyo', en: 'Tokyo', ar: 'طوكيو' },
        'Europe/Berlin': { tr: 'Berlin', en: 'Berlin', ar: 'برلين' },
        'Asia/Riyadh': { tr: 'Riyad', en: 'Riyadh', ar: 'الرياض' },
        'America/Los_Angeles': { tr: 'Los Angeles', en: 'Los Angeles', ar: 'لوس أنجلوس' },
        'Australia/Sydney': { tr: 'Sidney', en: 'Sydney', ar: 'سيدني' },
        'Africa/Cairo': { tr: 'Kahire', en: 'Cairo', ar: 'القاهرة' },
    };

    const urlLang = new URLSearchParams(location.search).get('lang');
    let lang = LANGS.includes(urlLang) ? urlLang : store.get('clk-lang', 'tr');
    let h24 = store.get('clk-24', true);
    let cities = store.get('clk-cities', ['Europe/Istanbul', 'Europe/London', 'America/New_York', 'Asia/Tokyo']);
    const t = (k, ...a) => { const v = T[lang][k]; return typeof v === 'function' ? v(...a) : v; };
    const pad = (n, l = 2) => String(n).padStart(l, '0');

    // ── Static text ──
    function texts() {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
        $('#lang-label').textContent = lang.toUpperCase();
        $('#fmt').textContent = h24 ? t('h24') : t('h12');
        swButtons();
        tmButtons();
        renderCities();
    }

    // ── Analog ticks ──
    const ticks = $('#ticks');
    for (let i = 0; i < 60; i++) {
        const long = i % 5 === 0;
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', 100); l.setAttribute('y1', long ? 14 : 12); l.setAttribute('x2', 100); l.setAttribute('y2', long ? 26 : 18);
        l.setAttribute('class', long ? 'tick big' : 'tick');
        l.setAttribute('transform', `rotate(${i * 6} 100 100)`);
        ticks.appendChild(l);
    }

    function tickClock() {
        const now = new Date();
        const ms = now.getMilliseconds();
        const s = now.getSeconds() + ms / 1000, m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
        $('#s').setAttribute('transform', `rotate(${s * 6} 100 100)`);
        $('#m').setAttribute('transform', `rotate(${m * 6} 100 100)`);
        $('#h').setAttribute('transform', `rotate(${h * 30} 100 100)`);
        const H = now.getHours();
        const shown = h24 ? H : H % 12 || 12;
        $('#time').innerHTML = `${pad(shown)}<span class="colon">:</span>${pad(now.getMinutes())}<span class="colon">:</span><small>${pad(now.getSeconds())}</small>${h24 ? '' : `<sup>${H < 12 ? 'AM' : 'PM'}</sup>`}`;
        $('#date').textContent = now.toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        $('#greet').textContent = t(H < 5 ? 'night' : H < 12 ? 'morning' : H < 18 ? 'afternoon' : H < 22 ? 'evening' : 'night');
        const p = ((H * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;
        $('#dayp').style.width = p.toFixed(2) + '%';
        $('#dayp-n').textContent = Math.floor(p) + '%';
    }

    // ── World clocks ──
    const offsetMin = (tz) => {
        const d = new Date();
        const local = new Date(d.toLocaleString('en-US', { timeZone: tz }));
        const here = new Date(d.toLocaleString('en-US'));
        return Math.round((local - here) / 60000);
    };
    function renderCities() {
        const now = new Date();
        $('#cities').innerHTML = cities.map((tz) => {
            const diff = offsetMin(tz) / 60;
            const rel = diff === 0 ? t('same') : diff > 0 ? t('ahead', +diff.toFixed(1)) : t('behind', +Math.abs(diff).toFixed(1));
            const hour = +now.toLocaleString('en-GB', { timeZone: tz, hour: '2-digit', hour12: false });
            const night = hour < 6 || hour >= 20;
            return `<article class="city ${night ? 'night' : ''}">
                <div><h3>${CITIES[tz]?.[lang] ?? tz}</h3><p>${now.toLocaleDateString(LOCALE[lang], { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' })} · ${rel}</p></div>
                <div class="c-time">${now.toLocaleTimeString(LOCALE[lang], { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: !h24 })}<span>${night ? '☾' : '☀'}</span></div>
                <button class="x" data-rm="${tz}" aria-label="${t('remove')}">×</button>
            </article>`;
        }).join('');
        $('#add-city').innerHTML = `<option value="">${t('add')}</option>` + Object.keys(CITIES).filter((c) => !cities.includes(c)).map((c) => `<option value="${c}">${CITIES[c][lang]}</option>`).join('');
    }
    $('#add-city').addEventListener('change', (e) => { if (e.target.value) { cities.push(e.target.value); store.set('clk-cities', cities); renderCities(); } });
    $('#cities').addEventListener('click', (e) => { const tz = e.target.dataset.rm; if (tz) { cities = cities.filter((c) => c !== tz); store.set('clk-cities', cities); renderCities(); } });

    // ── Stopwatch ──
    let swStart = 0, swAcc = 0, swRun = false, laps = [];
    const swNow = () => swAcc + (swRun ? performance.now() - swStart : 0);
    const fmtMs = (ms) => { const cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000); return `${pad(m)}:${pad(s)}.${pad(cs)}`; };
    function swButtons() {
        $('#sw-go').textContent = swRun ? t('pause') : swAcc ? t('resume') : t('start');
        $('#sw-go').classList.toggle('stop', swRun);
        $('#sw-lap').disabled = !swRun;
        $('#sw-reset').disabled = swRun || !swAcc;
        $('#sw-lap').textContent = t('lap');
        renderLaps();
    }
    function renderLaps() {
        const splits = laps.map((l, i) => l - (laps[i - 1] ?? 0));
        const min = Math.min(...splits), max = Math.max(...splits);
        $('#laps').innerHTML = splits.map((d, i) => ({ d, i })).reverse().map(({ d, i }) =>
            `<li class="${splits.length > 2 && d === min ? 'best' : ''} ${splits.length > 2 && d === max ? 'worst' : ''}"><span>${t('lap')} ${i + 1}${splits.length > 2 && d === min ? ` · ${t('fastest')}` : ''}${splits.length > 2 && d === max ? ` · ${t('slowest')}` : ''}</span><b>${fmtMs(d)}</b><em>${fmtMs(laps[i])}</em></li>`).join('');
    }
    $('#sw-go').addEventListener('click', () => { if (swRun) { swAcc += performance.now() - swStart; swRun = false; } else { swStart = performance.now(); swRun = true; } swButtons(); });
    $('#sw-lap').addEventListener('click', () => { laps.push(swNow()); renderLaps(); });
    $('#sw-reset').addEventListener('click', () => { swAcc = 0; laps = []; $('#sw').textContent = fmtMs(0); swButtons(); });

    // ── Timer ──
    let tmTotal = 300000, tmLeft = 300000, tmEnd = 0, tmRun = false;
    const CIRC = 2 * Math.PI * 88;
    $('#ring').style.strokeDasharray = CIRC;
    const fmtT = (ms) => { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' : '') + `${pad(h ? m : Math.floor(s / 60))}:${pad(s % 60)}`; };
    function tmDraw() {
        $('#tm').textContent = fmtT(tmLeft);
        $('#ring').style.strokeDashoffset = CIRC * (1 - tmLeft / tmTotal);
        document.title = tmRun ? `⏱ ${fmtT(tmLeft)} · Saat` : 'Saat';
    }
    function tmButtons() { $('#tm-go').textContent = tmRun ? t('pause') : tmLeft < tmTotal && tmLeft > 0 ? t('resume') : t('start'); $('#tm-go').classList.toggle('stop', tmRun); }
    function tmSet(ms, fromInputs = false) {
        tmRun = false;
        tmTotal = tmLeft = Math.max(1000, ms);
        // Don't rewrite the fields while the user is typing in them.
        if (!fromInputs) { $('#tm-min').value = Math.floor(tmTotal / 60000); $('#tm-sec').value = Math.floor(tmTotal / 1000) % 60; }
        tmDraw(); tmButtons();
    }
    $('#presets').innerHTML = [1, 3, 5, 10, 25].map((m) => `<button class="pill" data-p="${m}">${m}:00</button>`).join('');
    $('#presets').addEventListener('click', (e) => e.target.dataset.p && tmSet(+e.target.dataset.p * 60000));
    ['#tm-min', '#tm-sec'].forEach((s) => $(s).addEventListener('input', () => tmSet((+$('#tm-min').value || 0) * 60000 + Math.min(59, +$('#tm-sec').value || 0) * 1000, true)));
    $('#tm-go').addEventListener('click', () => { if (tmRun) { tmLeft = tmEnd - Date.now(); tmRun = false; } else { if (tmLeft <= 0) tmLeft = tmTotal; tmEnd = Date.now() + tmLeft; tmRun = true; beep(0); } tmButtons(); });
    $('#tm-reset').addEventListener('click', () => tmSet(tmTotal));

    let audio;
    function beep(vol = 0.25) {
        try {
            audio ??= new (window.AudioContext || window.webkitAudioContext)();
            [0, 0.25, 0.5].forEach((d) => {
                const o = audio.createOscillator(), g = audio.createGain();
                o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
                g.gain.setValueAtTime(vol, audio.currentTime + d); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d + 0.2);
                o.start(audio.currentTime + d); o.stop(audio.currentTime + d + 0.22);
            });
        } catch {}
    }
    $('#alert-ok').addEventListener('click', () => ($('#alert').hidden = true));

    // ── Loop ──
    function loop() {
        tickClock();
        if (swRun) $('#sw').textContent = fmtMs(swNow());
        if (tmRun) {
            tmLeft = Math.max(0, tmEnd - Date.now());
            if (tmLeft === 0) { tmRun = false; tmButtons(); beep(); $('#alert').hidden = false; $('#alert-ok').focus(); }
            tmDraw();
        }
        requestAnimationFrame(loop);
    }
    setInterval(() => { if (document.querySelector('#world.on')) renderCities(); }, 15000);

    // ── Tabs & settings ──
    document.querySelector('.tabs').addEventListener('click', (e) => {
        const tab = e.target.dataset.tab; if (!tab) return;
        document.querySelectorAll('.tabs button').forEach((b) => { b.classList.toggle('on', b.dataset.tab === tab); b.setAttribute('aria-selected', b.dataset.tab === tab); });
        document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === tab));
        if (tab === 'world') renderCities();
    });
    $('#fmt').addEventListener('click', () => { h24 = !h24; store.set('clk-24', h24); texts(); });
    $('#lang').addEventListener('click', () => { lang = LANGS[(LANGS.indexOf(lang) + 1) % 3]; store.set('clk-lang', lang); texts(); });
    $('#theme').addEventListener('click', () => store.set('clk-theme', document.documentElement.classList.toggle('light') ? 'light' : 'dark'));
    addEventListener('keydown', (e) => {
        if (e.target.matches('input, select')) return;
        const active = document.querySelector('.panel.on').id;
        if (e.code === 'Space' && (active === 'stopwatch' || active === 'timer')) { e.preventDefault(); $(active === 'stopwatch' ? '#sw-go' : '#tm-go').click(); }
    });

    texts();
    tmDraw();
    loop();
})();
