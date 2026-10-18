(() => {
    'use strict';

    const I18N = {
        tr: {
            skip: 'Ürünlere geç', search: 'Çanta ara… (ör. hasır, bordo, zincirli)', theme: 'Açık / koyu', favorites: 'Favoriler', cart: 'Sepet', close: 'Kapat', top: 'Yukarı',
            eyebrow: 'Yeni sezon · 2026', title: 'Her güne <em>bir çanta</em> hikâyesi',
            lead: 'El, omuz, hasır ve mini çantalar. Beğendiğini sepete ekle, favorilerine kaydet, birkaç saniyede sipariş ver.',
            shop: 'Alışverişe başla', free_ship: '1.500 ₺ üzeri ücretsiz kargo', models: 'model',
            cat_all: 'Tümü', cat_shoulder: 'Omuz', cat_hand: 'El çantası', cat_canvas: 'Hasır & kanvas', cat_mini: 'Mini & zincirli',
            max_price: 'En fazla', sort_featured: 'Öne çıkanlar', sort_low: 'Fiyat: düşükten yükseğe', sort_high: 'Fiyat: yüksekten düşüğe', sort_name: 'İsme göre',
            count: (n) => `${n} ürün`, empty: 'Aramana uygun çanta bulamadık.', reset: 'Filtreleri temizle',
            add: 'Sepete ekle', added: 'Sepete eklendi', in_cart: 'Sepette', new: 'Yeni', sale: 'İndirim', quick: 'Hızlı bakış',
            fav_add: 'Favorilere eklendi', fav_remove: 'Favorilerden çıkarıldı',
            cart_title: 'Sepetim', fav_title: 'Favorilerim', cart_empty: 'Sepetin boş.', fav_empty: 'Henüz favorin yok.', remove: 'Kaldır',
            subtotal: 'Ara toplam', shipping: 'Kargo', free: 'Ücretsiz', total: 'Toplam', to_free: (x) => `Ücretsiz kargo için ${x} kaldı`, checkout: 'Siparişi tamamla',
            co_title: 'Sipariş bilgileri', name: 'Ad soyad', phone: 'Telefon', address: 'Adres', city: 'Şehir', pay: 'Ödeme', pay_card: 'Kartla (demo)', pay_door: 'Kapıda ödeme',
            place: 'Siparişi ver', required: 'Bu alan gerekli', bad_phone: 'Geçerli bir telefon girin',
            done_title: 'Siparişin alındı!', done_p: (n) => `Sipariş numaran: ${n}. Bu bir demo mağazadır; gerçek ödeme veya teslimat yapılmaz.`, ok: 'Tamam',
            f1: 'Güvenli alışveriş', f1p: 'Demo ödeme, gerçek kart bilgisi istenmez', f2: '14 gün iade', f2p: 'Beğenmezsen kolayca iade', f3: 'Hızlı kargo', f3p: '1–3 iş gününde kapında',
            demo: 'Demo mağaza — satış yapılmaz.', reviews: 'değerlendirme',
        },
        en: {
            skip: 'Skip to products', search: 'Search bags… (e.g. straw, burgundy, chain)', theme: 'Light / dark', favorites: 'Favourites', cart: 'Cart', close: 'Close', top: 'Back to top',
            eyebrow: 'New season · 2026', title: 'A bag <em>for every</em> day',
            lead: 'Hand, shoulder, straw and mini bags. Add what you like to the cart, save favourites and order in seconds.',
            shop: 'Start shopping', free_ship: 'Free shipping over ₺1,500', models: 'styles',
            cat_all: 'All', cat_shoulder: 'Shoulder', cat_hand: 'Handbags', cat_canvas: 'Straw & canvas', cat_mini: 'Mini & chain',
            max_price: 'Up to', sort_featured: 'Featured', sort_low: 'Price: low to high', sort_high: 'Price: high to low', sort_name: 'Name',
            count: (n) => `${n} products`, empty: 'No bags match your search.', reset: 'Clear filters',
            add: 'Add to cart', added: 'Added to cart', in_cart: 'In cart', new: 'New', sale: 'Sale', quick: 'Quick view',
            fav_add: 'Added to favourites', fav_remove: 'Removed from favourites',
            cart_title: 'My cart', fav_title: 'My favourites', cart_empty: 'Your cart is empty.', fav_empty: 'No favourites yet.', remove: 'Remove',
            subtotal: 'Subtotal', shipping: 'Shipping', free: 'Free', total: 'Total', to_free: (x) => `${x} more for free shipping`, checkout: 'Checkout',
            co_title: 'Delivery details', name: 'Full name', phone: 'Phone', address: 'Address', city: 'City', pay: 'Payment', pay_card: 'Card (demo)', pay_door: 'Pay on delivery',
            place: 'Place order', required: 'This field is required', bad_phone: 'Enter a valid phone number',
            done_title: 'Order received!', done_p: (n) => `Your order number: ${n}. This is a demo store; no real payment or delivery happens.`, ok: 'OK',
            f1: 'Safe shopping', f1p: 'Demo payment, no real card needed', f2: '14-day returns', f2p: 'Easy returns if you change your mind', f3: 'Fast delivery', f3p: 'At your door in 1–3 working days',
            demo: 'Demo store — nothing is sold.', reviews: 'reviews',
        },
        ar: {
            skip: 'انتقل إلى المنتجات', search: 'ابحث عن حقيبة… (مثل: قش، عنابي، سلسلة)', theme: 'فاتح / داكن', favorites: 'المفضلة', cart: 'السلة', close: 'إغلاق', top: 'للأعلى',
            eyebrow: 'موسم جديد · 2026', title: 'لكل يوم <em>حقيبة</em> وحكاية',
            lead: 'حقائب يد وكتف وقش وحقائب صغيرة. أضيفي ما يعجبك إلى السلة، احفظي المفضلة، واطلبي خلال ثوانٍ.',
            shop: 'ابدئي التسوق', free_ship: 'شحن مجاني فوق 1,500 ₺', models: 'موديل',
            cat_all: 'الكل', cat_shoulder: 'حقائب كتف', cat_hand: 'حقائب يد', cat_canvas: 'قش وكانفاس', cat_mini: 'صغيرة وبسلسلة',
            max_price: 'حتى', sort_featured: 'المميزة', sort_low: 'السعر: من الأقل', sort_high: 'السعر: من الأعلى', sort_name: 'حسب الاسم',
            count: (n) => `${n} منتج`, empty: 'لم نجد حقيبة تطابق بحثك.', reset: 'مسح الفلاتر',
            add: 'أضيفي للسلة', added: 'أُضيفت إلى السلة', in_cart: 'في السلة', new: 'جديد', sale: 'خصم', quick: 'نظرة سريعة',
            fav_add: 'أُضيفت إلى المفضلة', fav_remove: 'أُزيلت من المفضلة',
            cart_title: 'سلتي', fav_title: 'مفضلتي', cart_empty: 'سلتك فارغة.', fav_empty: 'لا توجد مفضلة بعد.', remove: 'إزالة',
            subtotal: 'المجموع الفرعي', shipping: 'الشحن', free: 'مجاني', total: 'الإجمالي', to_free: (x) => `باقي ${x} للشحن المجاني`, checkout: 'إتمام الطلب',
            co_title: 'بيانات التوصيل', name: 'الاسم الكامل', phone: 'الهاتف', address: 'العنوان', city: 'المدينة', pay: 'الدفع', pay_card: 'بطاقة (تجريبي)', pay_door: 'الدفع عند الاستلام',
            place: 'تأكيد الطلب', required: 'هذا الحقل مطلوب', bad_phone: 'أدخلي رقم هاتف صحيح',
            done_title: 'تم استلام طلبك!', done_p: (n) => `رقم طلبك: ${n}. هذا متجر تجريبي، لا يتم دفع أو توصيل حقيقي.`, ok: 'حسنًا',
            f1: 'تسوق آمن', f1p: 'دفع تجريبي بدون بيانات بطاقة حقيقية', f2: 'إرجاع خلال 14 يومًا', f2p: 'إرجاع سهل إذا غيّرتِ رأيك', f3: 'شحن سريع', f3p: 'يصلك خلال 1–3 أيام عمل',
            demo: 'متجر تجريبي — لا يتم بيع أي شيء.', reviews: 'تقييم',
        },
    };
    const LANGS = ['tr', 'en', 'ar'];
    const CATS = ['all', 'shoulder', 'hand', 'canvas', 'mini'];
    const FREE_SHIPPING = 1500;
    const SHIPPING = 79;

    const store = {
        get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    };
    const $ = (s) => document.querySelector(s);
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    const urlLang = new URLSearchParams(location.search).get('lang');
    const state = {
        lang: LANGS.includes(urlLang) ? urlLang : store.get('cm-lang', 'tr'),
        q: '', cat: 'all', max: 2000, sort: 'featured',
        cart: store.get('cm-cart', {}), // id -> qty
        favs: new Set(store.get('cm-favs', [])),
        drawer: null,
    };
    const t = (k, ...a) => { const v = I18N[state.lang][k] ?? I18N.tr[k]; return typeof v === 'function' ? v(...a) : v; };
    const money = (n) => new Intl.NumberFormat(state.lang === 'ar' ? 'ar-u-nu-latn' : state.lang === 'en' ? 'en-GB' : 'tr-TR', { style: 'currency', currency: 'TRY', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n);
    const byId = (id) => PRODUCTS.find((p) => p.id === id);
    const norm = (s) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');

    // Search also understands a few English/Arabic words for colours and materials.
    const ALIASES = { black: 'siyah', red: 'kirmizi', burgundy: 'bordo', brown: 'kahverengi', yellow: 'sari', straw: 'hasir', chain: 'zincir', canvas: 'kanvas', orange: 'turuncu', gold: 'altin',
        'أسود': 'siyah', 'احمر': 'kirmizi', 'أحمر': 'kirmizi', 'عنابي': 'bordo', 'بني': 'kahverengi', 'اصفر': 'sari', 'أصفر': 'sari', 'قش': 'hasir', 'سلسلة': 'zincir', 'برتقالي': 'turuncu', 'ذهبي': 'altin' };

    function filtered() {
        const words = state.q.trim().toLocaleLowerCase('tr').split(/\s+/).filter(Boolean).map((w) => norm(ALIASES[w] ?? w));
        let list = PRODUCTS.filter((p) => (state.cat === 'all' || p.cat === state.cat) && p.price <= state.max && words.every((w) => norm(`${p.name} ${p.desc}`).includes(w)));
        if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
        if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
        if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        if (state.sort === 'featured') list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.rating - a.rating);
        return list;
    }

    const heart = (on) => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    const stars = (r) => `<span class="stars" aria-label="${r}/5">★ ${r.toFixed(1)}</span>`;

    function card(p, i) {
        const inCart = state.cart[p.id];
        return `<article class="card" style="--d:${Math.min(i, 12) * 40}ms">
            <div class="card-img">
                <img src="img/${p.img}" alt="${esc(p.name)}" loading="lazy" />
                <div class="tags">${p.isNew ? `<span class="tag">${t('new')}</span>` : ''}${p.old ? `<span class="tag sale">${t('sale')} −${Math.round((1 - p.price / p.old) * 100)}%</span>` : ''}</div>
                <button class="fav" data-fav="${p.id}" aria-pressed="${state.favs.has(p.id)}" aria-label="${t('favorites')}">${heart(state.favs.has(p.id))}</button>
                <button class="quick" data-quick="${p.id}">${t('quick')}</button>
            </div>
            <div class="card-body">
                <div class="row"><h3>${esc(p.name)}</h3><span class="swatch" style="background:${p.color}"></span></div>
                <p class="desc">${esc(p.desc)}</p>
                <div class="row">
                    <span class="price">${money(p.price)}${p.old ? ` <s>${money(p.old)}</s>` : ''}</span>
                    ${stars(p.rating)}
                </div>
                <button class="btn ${inCart ? 'btn-ghost' : 'btn-dark'} add" data-add="${p.id}">${inCart ? `✓ ${t('in_cart')} · ${inCart}` : t('add')}</button>
            </div>
        </article>`;
    }

    function renderGrid() {
        const list = filtered();
        $('#grid').innerHTML = list.map(card).join('');
        $('#count').textContent = t('count', list.length);
        $('#empty').hidden = list.length > 0;
    }

    function renderChips() {
        $('#chips').innerHTML = CATS.map((c) => `<button role="tab" aria-selected="${state.cat === c}" class="chip ${state.cat === c ? 'on' : ''}" data-cat="${c}">${t('cat_' + c)}</button>`).join('');
    }

    function renderStatic() {
        const html = document.documentElement;
        html.lang = state.lang;
        html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
        document.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
        document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
        $('#lang-label').textContent = state.lang.toUpperCase();
        $('#price-out').textContent = money(state.max);
    }

    function counts() {
        const n = Object.values(state.cart).reduce((a, b) => a + b, 0);
        $('#cart-count').textContent = n;
        $('#cart-count').hidden = n === 0;
        $('#fav-count').textContent = state.favs.size;
        $('#fav-count').hidden = state.favs.size === 0;
    }

    function totals() {
        const sub = Object.entries(state.cart).reduce((s, [id, q]) => s + byId(+id).price * q, 0);
        const ship = sub === 0 || sub >= FREE_SHIPPING ? 0 : SHIPPING;
        return { sub, ship, total: sub + ship };
    }

    function save() {
        store.set('cm-cart', state.cart);
        store.set('cm-favs', [...state.favs]);
        counts();
    }

    function renderAll() {
        renderStatic();
        renderChips();
        renderGrid();
        counts();
        if (state.drawer) renderDrawer();
    }

    let toastTimer;
    function toast(msg) {
        const el = $('#toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    }

    function addToCart(id, qty = 1) {
        state.cart[id] = (state.cart[id] || 0) + qty;
        save();
        renderGrid();
        if (state.drawer === 'cart') renderDrawer();
        toast(t('added'));
        const btn = $('#cart-open');
        btn.classList.remove('bump');
        void btn.offsetWidth;
        btn.classList.add('bump');
    }

    function toggleFav(id) {
        state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
        toast(state.favs.has(id) ? t('fav_add') : t('fav_remove'));
        save();
        renderGrid();
        if (state.drawer === 'fav') renderDrawer();
    }

    // ── Drawer (cart & favourites) ─────────────────────────────────────
    function line(p, qty) {
        return `<div class="line">
            <img src="img/${p.img}" alt="" />
            <div class="line-info">
                <b>${esc(p.name)}</b>
                <span>${money(p.price)}</span>
                ${qty ? `<div class="qty" role="group">
                    <button data-dec="${p.id}" aria-label="−">−</button><span>${qty}</span><button data-inc="${p.id}" aria-label="+">+</button>
                </div>` : `<button class="link" data-add="${p.id}">${t('add')}</button>`}
            </div>
            <button class="icon-btn sm" data-${qty ? 'del' : 'fav'}="${p.id}" aria-label="${t('remove')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        </div>`;
    }

    function renderDrawer() {
        const body = $('#drawer-body');
        const foot = $('#drawer-foot');
        if (state.drawer === 'fav') {
            $('#drawer-title').textContent = t('fav_title');
            const favs = [...state.favs].map(byId).filter(Boolean);
            body.innerHTML = favs.length ? favs.map((p) => line(p, 0)).join('') : `<p class="muted center">${t('fav_empty')}</p>`;
            foot.innerHTML = '';
            return;
        }
        $('#drawer-title').textContent = t('cart_title');
        const items = Object.entries(state.cart).map(([id, q]) => [byId(+id), q]).filter(([p]) => p);
        body.innerHTML = items.length ? items.map(([p, q]) => line(p, q)).join('') : `<p class="muted center">${t('cart_empty')}</p>`;
        if (!items.length) { foot.innerHTML = ''; return; }
        const { sub, ship, total } = totals();
        const left = FREE_SHIPPING - sub;
        foot.innerHTML = `
            ${left > 0 ? `<div class="ship-bar"><span>${t('to_free', money(left))}</span><i style="--w:${Math.min(100, (sub / FREE_SHIPPING) * 100)}%"></i></div>` : ''}
            <dl><dt>${t('subtotal')}</dt><dd>${money(sub)}</dd><dt>${t('shipping')}</dt><dd>${ship ? money(ship) : t('free')}</dd><dt class="big">${t('total')}</dt><dd class="big">${money(total)}</dd></dl>
            <button class="btn btn-dark wide" id="checkout">${t('checkout')}</button>`;
    }

    function openDrawer(kind) {
        state.drawer = kind;
        renderDrawer();
        $('#drawer').classList.add('open');
        $('#drawer').setAttribute('aria-hidden', 'false');
        $('#scrim').hidden = false;
        $('#drawer-close').focus();
    }
    function closeDrawer() {
        state.drawer = null;
        $('#drawer').classList.remove('open');
        $('#drawer').setAttribute('aria-hidden', 'true');
        $('#scrim').hidden = true;
    }

    // ── Modal (quick view, checkout, done) ─────────────────────────────
    let lastFocus = null;
    function openModal(html) {
        lastFocus = document.activeElement;
        $('#modal-card').innerHTML = `<button class="icon-btn modal-x" data-close aria-label="${t('close')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>${html}`;
        $('#modal').hidden = false;
        requestAnimationFrame(() => $('#modal').classList.add('show'));
        ($('#modal-card').querySelector('input, button.btn') || $('#modal-card').querySelector('button')).focus();
    }
    function closeModal() {
        $('#modal').classList.remove('show');
        setTimeout(() => ($('#modal').hidden = true), 200);
        lastFocus?.focus();
    }

    function quickView(id) {
        const p = byId(id);
        openModal(`<div class="qv">
            <img src="img/${p.img}" alt="${esc(p.name)}" />
            <div>
                <p class="eyebrow">${t('cat_' + p.cat)}</p>
                <h2>${esc(p.name)}</h2>
                <p class="muted">${esc(p.desc)}</p>
                <p>${stars(p.rating)} <span class="muted">· ${Math.round(p.rating * 23)} ${t('reviews')}</span></p>
                <p class="price big">${money(p.price)}${p.old ? ` <s>${money(p.old)}</s>` : ''}</p>
                <div class="qv-actions">
                    <div class="qty lg"><button data-qv="-1">−</button><span id="qv-n">1</span><button data-qv="1">+</button></div>
                    <button class="btn btn-dark" data-qv-add="${p.id}">${t('add')}</button>
                    <button class="icon-btn" data-fav="${p.id}" aria-label="${t('favorites')}">${heart(state.favs.has(p.id))}</button>
                </div>
                <ul class="perks"><li>${t('f3p')}</li><li>${t('f2p')}</li></ul>
            </div>
        </div>`);
    }

    function checkout() {
        closeDrawer();
        const { total } = totals();
        openModal(`<form class="co" id="co" novalidate>
            <h2>${t('co_title')}</h2>
            <label>${t('name')}<input name="name" autocomplete="name" required /></label>
            <label>${t('phone')}<input name="phone" type="tel" dir="ltr" autocomplete="tel" placeholder="+90 5xx xxx xx xx" required /></label>
            <label class="full">${t('address')}<textarea name="address" autocomplete="street-address" rows="2" required></textarea></label>
            <label>${t('city')}<input name="city" autocomplete="address-level2" value="Karabük" required /></label>
            <fieldset><legend>${t('pay')}</legend>
                <label class="radio"><input type="radio" name="pay" value="card" checked /> ${t('pay_card')}</label>
                <label class="radio"><input type="radio" name="pay" value="door" /> ${t('pay_door')}</label>
            </fieldset>
            <button class="btn btn-dark wide full">${t('place')} · ${money(total)}</button>
        </form>`);
        $('#co').addEventListener('submit', (e) => {
            e.preventDefault();
            const f = e.target;
            let ok = true;
            f.querySelectorAll('.err').forEach((x) => x.remove());
            f.querySelectorAll('[required]').forEach((el) => {
                const bad = !el.value.trim() || (el.name === 'phone' && !/^\+?[0-9 ()-]{10,18}$/.test(el.value.trim()));
                if (bad) {
                    ok = false;
                    el.insertAdjacentHTML('afterend', `<small class="err">${el.value.trim() ? t('bad_phone') : t('required')}</small>`);
                }
            });
            if (!ok) return f.querySelector('.err')?.previousElementSibling.focus();
            const no = 'CM-' + Date.now().toString().slice(-6);
            state.cart = {};
            save();
            renderGrid();
            openModal(`<div class="done"><div class="check">✓</div><h2>${t('done_title')}</h2><p class="muted">${t('done_p', no)}</p><button class="btn btn-dark" data-close>${t('ok')}</button></div>`);
        });
    }

    // ── Events ─────────────────────────────────────────────────────────
    let searchTimer;
    $('#q').addEventListener('input', (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.q = e.target.value; renderGrid(); }, 120); });
    $('#price').addEventListener('input', (e) => { state.max = +e.target.value; $('#price-out').textContent = money(state.max); renderGrid(); });
    $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });
    $('#reset').addEventListener('click', () => {
        Object.assign(state, { q: '', cat: 'all', max: 2000, sort: 'featured' });
        $('#q').value = ''; $('#price').value = 2000; $('#sort').value = 'featured';
        renderAll();
    });
    $('#lang').addEventListener('click', () => {
        state.lang = LANGS[(LANGS.indexOf(state.lang) + 1) % LANGS.length];
        store.set('cm-lang', state.lang);
        renderAll();
    });
    $('#theme').addEventListener('click', () => {
        const dark = document.documentElement.classList.toggle('dark');
        store.set('cm-theme', dark ? 'dark' : 'light');
    });
    $('#cart-open').addEventListener('click', () => openDrawer('cart'));
    $('#fav-open').addEventListener('click', () => openDrawer('fav'));
    $('#drawer-close').addEventListener('click', closeDrawer);
    $('#scrim').addEventListener('click', closeDrawer);
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!$('#modal').hidden) closeModal(); else if (state.drawer) closeDrawer(); } });

    document.addEventListener('click', (e) => {
        const el = e.target.closest('button, [data-close]');
        if (!el) return;
        const d = el.dataset;
        if (d.cat) { state.cat = d.cat; renderChips(); renderGrid(); }
        else if (d.add) addToCart(+d.add);
        else if (d.fav) { toggleFav(+d.fav); if (!$('#modal').hidden && el.closest('#modal')) el.innerHTML = heart(state.favs.has(+d.fav)); }
        else if (d.quick) quickView(+d.quick);
        else if (d.inc) { state.cart[d.inc]++; save(); renderDrawer(); renderGrid(); }
        else if (d.dec) { if (--state.cart[d.dec] <= 0) delete state.cart[d.dec]; save(); renderDrawer(); renderGrid(); }
        else if (d.del) { delete state.cart[d.del]; save(); renderDrawer(); renderGrid(); }
        else if (d.qv) { const n = $('#qv-n'); n.textContent = Math.max(1, Math.min(9, +n.textContent + +d.qv)); }
        else if (d.qvAdd) { addToCart(+d.qvAdd, +$('#qv-n').textContent); closeModal(); }
        else if ('close' in d) closeModal();
        else if (el.id === 'checkout') checkout();
    });

    const toTop = $('#to-top');
    addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

    renderAll();
})();
