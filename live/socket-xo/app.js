(() => {
    'use strict';
    const T = {
        tr: { tag: 'Gerçek zamanlı · WebSocket', lobby_title: 'Arkadaşınla canlı oyna', lobby_p: 'Bir oda aç, bağlantıyı gönder. Hamleler sunucu üzerinden anında iki tarafa iletilir.', your_name: 'Adın', create: 'Yeni oda aç', or: 'ya da', join: 'Odaya katıl', how: 'Nasıl çalışır?', how_p: 'Python sunucusu oyunun hakemidir: tahtayı tutar, sırayı belirler ve her hamleyi kontrol eder. Tarayıcılar WebSocket ile bağlanır; aynı odadaki iki oyuncu her değişikliği aynı anda görür. Denemek için bu sayfayı iki sekmede aç.', room: 'Oda kodu', copy: 'Bağlantıyı kopyala', copied: 'Kopyalandı ✓', you: 'sen', draws: 'Berabere', leave: 'Odadan çık',
            wait: 'Rakip bekleniyor… Bağlantıyı gönder.', your_turn: 'Sıra sende', their_turn: (n) => `${n} oynuyor…`, win: 'Kazandın! 🎉', lose: (n) => `${n} kazandı`, draw: 'Berabere', rematch: 'Rövanş', rematch_wait: 'Rakibin onayı bekleniyor…', rematch_asked: (n) => `${n} rövanş istiyor — kabul et`, left: 'Rakip ayrıldı.',
            no_room: 'Bu kodla bir oda bulunamadı.', full: 'Bu oda dolu (2 oyuncu).', busy: 'Sunucu şu an çok yoğun.', connecting: 'Bağlanıyor…', offline: 'Bağlantı koptu, yeniden deneniyor…', name_default: 'Oyuncu' },
        en: { tag: 'Real time · WebSocket', lobby_title: 'Play live with a friend', lobby_p: 'Open a room and send the link. Moves travel through the server to both players instantly.', your_name: 'Your name', create: 'Create a room', or: 'or', join: 'Join room', how: 'How does it work?', how_p: 'The Python server is the referee: it keeps the board, decides whose turn it is and checks every move. Browsers connect with WebSocket, so both players in a room see every change at the same time. To try it, open this page in two tabs.', room: 'Room code', copy: 'Copy link', copied: 'Copied ✓', you: 'you', draws: 'Draws', leave: 'Leave room',
            wait: 'Waiting for an opponent… Send the link.', your_turn: 'Your turn', their_turn: (n) => `${n} is playing…`, win: 'You won! 🎉', lose: (n) => `${n} won`, draw: "It's a draw", rematch: 'Rematch', rematch_wait: 'Waiting for your opponent…', rematch_asked: (n) => `${n} wants a rematch — accept`, left: 'Your opponent left.',
            no_room: 'No room with this code.', full: 'This room is full (2 players).', busy: 'The server is busy right now.', connecting: 'Connecting…', offline: 'Connection lost, retrying…', name_default: 'Player' },
        ar: { tag: 'لحظي · WebSocket', lobby_title: 'العب مباشرة مع صديق', lobby_p: 'افتح غرفة وأرسل الرابط. تنتقل الحركات عبر الخادم إلى اللاعبَين فورًا.', your_name: 'اسمك', create: 'افتح غرفة جديدة', or: 'أو', join: 'ادخل الغرفة', how: 'كيف تعمل؟', how_p: 'خادم Python هو الحَكَم: يحتفظ باللوحة، ويحدد الدور، ويتحقق من كل حركة. المتصفحات تتصل عبر WebSocket، فيرى اللاعبان في الغرفة كل تغيير في اللحظة نفسها. للتجربة افتح الصفحة في تبويبين.', room: 'رمز الغرفة', copy: 'انسخ الرابط', copied: 'تم النسخ ✓', you: 'أنت', draws: 'تعادل', leave: 'اخرج من الغرفة',
            wait: 'بانتظار لاعب آخر… أرسل الرابط.', your_turn: 'دورك', their_turn: (n) => `${n} يلعب…`, win: 'فزت! 🎉', lose: (n) => `فاز ${n}`, draw: 'تعادل', rematch: 'جولة جديدة', rematch_wait: 'بانتظار موافقة الخصم…', rematch_asked: (n) => `${n} يريد جولة جديدة — وافق`, left: 'غادر الخصم.',
            no_room: 'لا توجد غرفة بهذا الرمز.', full: 'الغرفة ممتلئة (لاعبان).', busy: 'الخادم مشغول الآن.', connecting: 'جارٍ الاتصال…', offline: 'انقطع الاتصال، نعيد المحاولة…', name_default: 'لاعب' },
    };
    const LANGS = ['tr', 'en', 'ar'];
    const $ = (s) => document.querySelector(s);
    const store = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
    const params = new URLSearchParams(location.search);
    let lang = LANGS.includes(params.get('lang')) ? params.get('lang') : store.get('sx-lang', 'tr');
    const t = (k, ...a) => { const v = T[lang][k]; return typeof v === 'function' ? v(...a) : v; };

    let ws, state = null, wantRoom = null, retry = 0;
    const board = $('#board');
    for (let i = 0; i < 9; i++) board.insertAdjacentHTML('beforeend', `<button class="cell" data-i="${i}" role="gridcell" aria-label="${i + 1}"></button>`);
    $('#emojis').innerHTML = ['👋', '👏', '😄', '😮', '🔥', '🤝'].map((e) => `<button class="emoji" data-e="${e}">${e}</button>`).join('');
    $('#name').value = store.get('sx-name', '');
    if (params.get('room')) $('#code').value = params.get('room').toUpperCase();

    function texts() {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
        $('#name').placeholder = t('name_default');
        $('#lang').textContent = lang.toUpperCase();
        if (state) render();
    }

    function connect() {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        ws = new WebSocket(`${proto}://${location.host}/ws`);
        $('#conn').textContent = t('connecting');
        ws.onopen = () => {
            retry = 0;
            $('#conn').textContent = '';
            if (wantRoom !== null) send({ type: 'join', room: wantRoom, name: name() });
        };
        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'error') {
                $('#lobby-error').textContent = t(msg.code) || msg.code;
                wantRoom = null;
                return;
            }
            if (msg.type === 'emoji') return floatEmoji(msg.emoji);
            if (msg.type === 'state') {
                const first = !state;
                state = msg;
                wantRoom = msg.room; // rejoin this room if the connection drops
                if (first) history.replaceState(null, '', `?room=${msg.room}`);
                if (msg.event === 'left') toastStatus(t('left'));
                show('game');
                render();
            }
        };
        ws.onclose = () => {
            $('#conn').textContent = t('offline');
            state = null;
            setTimeout(connect, Math.min(5000, 500 * 2 ** retry++));
        };
    }
    const send = (m) => ws && ws.readyState === 1 && ws.send(JSON.stringify(m));
    const name = () => $('#name').value.trim() || t('name_default');

    function show(id) {
        $('#lobby').hidden = id !== 'lobby';
        $('#game').hidden = id !== 'game';
    }

    let statusOverride = null;
    function toastStatus(text) { statusOverride = text; setTimeout(() => { statusOverride = null; render(); }, 2500); }

    function render() {
        const s = state;
        const other = s.you === 'X' ? 'O' : 'X';
        const otherName = s.players[other] || '…';
        $('#room-code').textContent = s.room;
        for (const sym of ['X', 'O']) {
            const el = $('#p' + sym);
            el.querySelector('.pname').textContent = s.players[sym] || '—';
            el.querySelector('.pyou').hidden = sym !== s.you;
            el.querySelector('.pscore').textContent = s.scores[sym];
            el.classList.toggle('turn', !s.result && s.turn === sym && Object.keys(s.players).length === 2);
            el.classList.toggle('away', !s.players[sym]);
        }
        $('#draws').textContent = s.scores.draw;
        const two = Object.keys(s.players).length === 2;
        board.querySelectorAll('.cell').forEach((c, i) => {
            const v = s.board[i];
            if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v ? `<span class="${v.toLowerCase()}">${v}</span>` : ''; }
            c.classList.toggle('win', s.line.includes(i));
            c.disabled = !!v || !!s.result || s.turn !== s.you || !two;
        });
        board.classList.toggle('done', !!s.result);
        let status;
        if (!two) status = t('wait');
        else if (s.result === 'draw') status = t('draw');
        else if (s.result) status = s.result === s.you ? t('win') : t('lose', otherName);
        else status = s.turn === s.you ? t('your_turn') : t('their_turn', otherName);
        $('#status').textContent = statusOverride || status;
        $('#status').className = 'status ' + (s.result && s.result === s.you ? 'good' : s.turn === s.you && !s.result && two ? 'mine' : '');
        const rb = $('#rematch');
        rb.hidden = !s.result || !two;
        const mine = s.rematch.includes(s.you), theirs = s.rematch.includes(other);
        rb.textContent = mine ? t('rematch_wait') : theirs ? t('rematch_asked', otherName) : t('rematch');
        rb.disabled = mine;
        $('#emojis').hidden = !two;
    }

    function floatEmoji(e) {
        const el = document.createElement('span');
        el.textContent = e;
        el.style.left = 20 + Math.random() * 60 + '%';
        $('#float').appendChild(el);
        setTimeout(() => el.remove(), 2200);
    }

    board.addEventListener('click', (e) => { const c = e.target.closest('.cell'); if (c && !c.disabled) send({ type: 'move', cell: +c.dataset.i }); });
    $('#create').addEventListener('click', () => { $('#lobby-error').textContent = ''; store.set('sx-name', $('#name').value.trim()); wantRoom = ''; send({ type: 'join', room: '', name: name() }); });
    $('#join').addEventListener('click', () => {
        const code = $('#code').value.trim().toUpperCase();
        if (!code) return $('#code').focus();
        $('#lobby-error').textContent = '';
        store.set('sx-name', $('#name').value.trim());
        wantRoom = code;
        send({ type: 'join', room: code, name: name() });
    });
    $('#code').addEventListener('keydown', (e) => e.key === 'Enter' && $('#join').click());
    $('#rematch').addEventListener('click', () => send({ type: 'rematch' }));
    $('#emojis').addEventListener('click', (e) => { const b = e.target.closest('[data-e]'); if (b) { send({ type: 'emoji', emoji: b.dataset.e }); floatEmoji(b.dataset.e); } });
    $('#copy').addEventListener('click', async () => {
        const url = `${location.origin}${location.pathname}?room=${state.room}`;
        try { await navigator.clipboard.writeText(url); } catch { prompt('', url); }
        $('#copy').textContent = t('copied');
        setTimeout(() => ($('#copy').textContent = t('copy')), 1800);
    });
    $('#leave').addEventListener('click', () => { history.replaceState(null, '', location.pathname); wantRoom = null; state = null; ws.close(); show('lobby'); });
    $('#lang').addEventListener('click', () => { lang = LANGS[(LANGS.indexOf(lang) + 1) % 3]; store.set('sx-lang', lang); texts(); });

    texts();
    show('lobby');
    connect();
})();
