/* Fast Food House — public site renderer + interactions.
   Reads content from data.js (getSiteData), renders every section,
   then wires up filtering, reveal animations, and small UX polish. */

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const FEATURE_ICONS = [
  '<path d="M4 12h16M4 12a8 8 0 0116 0M3 12h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zM6 8c1-3 4-5 6-5s5 2 6 5"/>',
  '<path d="M6 3l1 15a2 2 0 002 2h6a2 2 0 002-2l1-15M4 3h16"/>',
  '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>',
  '<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/>'
];

const data = getSiteData();

function renderHeader() {
  const el = document.getElementById('headerBrandText');
  if (!el) return;
  el.innerHTML = `<strong>${esc(data.site.brandName)}</strong><span>${esc(data.site.brandTagline)}</span>`;
}

function renderHero() {
  const h = data.hero;
  const copy = document.getElementById('heroCopy');
  copy.innerHTML = `
    <span class="eyebrow reveal" style="--d:0s">${esc(h.eyebrow)}</span>
    <h1 class="reveal" style="--d:.08s">${esc(h.titleTop)}<br>${esc(h.titleMid)} <span class="gold">${esc(h.titleGold)}</span><br>${esc(h.titleBottom)}</h1>
    <p class="reveal" style="--d:.18s">${esc(h.description)}</p>
    <div class="hero-actions reveal" style="--d:.28s">
      <a href="#menu" class="btn btn-gold">${esc(h.primaryBtn)} 🍔</a>
      <a href="#locations" class="btn btn-outline-light">${esc(h.secondaryBtn)} 📍</a>
    </div>
    <div class="hero-rating reveal" style="--d:.36s">
      <span class="stars">★★★★★</span>
      <span>${esc(h.ratingScore)} (<span id="ratingCounter" data-target="${Number(h.ratingCount) || 0}">0</span>+ ${esc(h.ratingLabel)})</span>
    </div>
  `;

  const media = document.getElementById('heroMedia');
  media.innerHTML = `
    <div class="frame"><img src="image/${esc(h.image)}" alt="${esc(h.titleTop)} ${esc(h.titleBottom)}"></div>
    <div class="badge-circle">
      <span>${esc(h.badgeLine1)}</span>
      <small>${esc(h.badgeLine2)}</small>
    </div>
  `;
}

function renderFeatures() {
  const wrap = document.getElementById('featureStrip');
  wrap.innerHTML = data.features.map((f, i) => `
    <div class="feature reveal" style="--d:${(i * 0.1).toFixed(2)}s">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${FEATURE_ICONS[i] || FEATURE_ICONS[0]}</svg>
      <div>
        <h4>${esc(f.title)}</h4>
        <p>${esc(f.desc)}</p>
      </div>
    </div>
  `).join('');
}

function renderCategoryPills() {
  const wrap = document.getElementById('categoryPills');
  wrap.innerHTML = data.categories.map(c =>
    `<button class="pill" data-filter="${esc(c.key)}">${esc(c.label)}</button>`
  ).join('');
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = data.menu.map(item => `
    <div class="menu-card" data-category="${esc(item.category)}">
      <div class="thumb"><img src="image/${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></div>
      <div class="info">
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.desc)}</p>
        <div class="row">
          <span class="price">${formatPrice(item.price)}</span>
          <button class="add-btn" data-id="${item.id}" data-name="${esc(item.name)}">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPromo() {
  const p = data.promo;
  const combo = document.getElementById('promoCombo');
  combo.style.backgroundImage = `url('image/${esc(p.comboImage)}')`;
  combo.innerHTML = `
    <span class="eyebrow">${esc(p.comboEyebrow)}</span>
    <h3>${esc(p.comboTitleTop)}<br>${esc(p.comboTitleBottom)}</h3>
    <p>${esc(p.comboText)}</p>
    <div class="price-chip">
      <span class="amount">${esc(p.comboPrice)}</span>
      <span class="label">${esc(p.comboPriceLabel)}</span>
    </div>
    <button class="btn btn-gold open-cart-btn" style="width:fit-content;">${esc(p.comboBtn)}</button>
  `;

  const about = document.getElementById('about');
  about.innerHTML = `
    <span class="eyebrow">${esc(p.aboutEyebrow)}</span>
    <h3>${esc(p.aboutTitleTop)}<br>${esc(p.aboutTitleBottom)}</h3>
    <p>${esc(p.aboutText)}</p>
    <a href="#footer" class="btn btn-outline-dark">${esc(p.aboutBtn)}</a>
    <div class="stamp">${esc(p.aboutStampLine1)}<br>${esc(p.aboutStampLine2)}</div>
  `;
}

function renderFooter() {
  const f = data.footer;
  const grid = document.getElementById('footerGrid');
  grid.innerHTML = `
    <div class="footer-brand reveal" style="--d:0s">
      <a href="#" class="brand">
        <img src="image/pic.png" alt="Fast Food House logo">
        <div class="brand-text">
          <strong style="color:#fff;">${esc(data.site.brandName)}</strong>
          <span>${esc(data.site.brandTagline)}</span>
        </div>
      </a>
      <p>${esc(f.tagline)}</p>
      <div class="social-row">
        <a href="${esc(f.social.facebook)}" aria-label="Facebook">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="${esc(f.social.instagram)}" aria-label="Instagram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
        </a>
        <a href="${esc(f.social.telegram)}" aria-label="Telegram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </a>
      </div>
    </div>

    <div class="reveal" style="--d:.1s">
      <h5>Tezkor havolalar</h5>
      <ul>
        <li><a href="#">Bosh sahifa</a></li>
        <li><a href="#menu">Menyu</a></li>
        <li><a href="#about">Biz haqimizda</a></li>
        <li><a href="#locations">Manzillar</a></li>
      </ul>
    </div>

    <div id="locations" class="reveal" style="--d:.2s">
      <h5>Ish vaqti</h5>
      ${f.hours.map(h => `<div class="hours-row"><span>${esc(h.label)}</span><span>${esc(h.value)}</span></div>`).join('')}
    </div>

    <div class="reveal" style="--d:.3s">
      <h5>Buyurtma bering</h5>
      <div class="order-box open-cart-btn">
        <img src="image/Доставка.png" alt="Yetkazib berish">
        <div>
          <div class="t1">${esc(f.orderLabel)}</div>
          <div class="t2">${esc(f.orderCta)}</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('footerBottom').textContent = data.site.copyright;
}

function renderAll() {
  renderHeader();
  renderHero();
  renderFeatures();
  renderCategoryPills();
  renderMenu();
  renderPromo();
  renderFooter();
}

renderAll();

/* ===== Mobile nav ===== */
const burgerToggle = document.getElementById('burgerToggle');
const mainNav = document.getElementById('mainNav');

burgerToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* ===== Category filter ===== */
const menuGrid = document.getElementById('menuGrid');
const categoryPills = document.getElementById('categoryPills');

function withFade(work) {
  menuGrid.classList.add('grid-fade');
  setTimeout(() => {
    work();
    menuGrid.classList.remove('grid-fade');
  }, 180);
}

function showAllCards() {
  menuGrid.querySelectorAll('.menu-card').forEach(card => { card.style.display = ''; });
}

function applyFilter(filter) {
  menuGrid.querySelectorAll('.menu-card').forEach(card => {
    card.style.display = card.dataset.category === filter ? '' : 'none';
  });
}

categoryPills?.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  const wasActive = pill.classList.contains('active');
  categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  withFade(() => {
    if (wasActive) {
      showAllCards();
    } else {
      pill.classList.add('active');
      applyFilter(pill.dataset.filter);
    }
  });
});

/* ===== Toast ===== */
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
let toastTimer;

function showToast(msg, duration) {
  toastText.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration || 2200);
}

/* ===== Cart ===== */
const CART_KEY = 'ffh_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

let cart = loadCart();

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

const cartBadge = document.getElementById('cartBadge');
function updateCartBadge() {
  if (!cartBadge) return;
  const count = cartCount();
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
}

function addToCart(id) {
  const item = data.menu.find(m => m.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
  saveCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const line = cart.find(c => c.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCartPanel();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCartPanel();
}

const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartFootEl = document.getElementById('cartFoot');

function renderCartPanel() {
  if (!cart.length) {
    cartItemsEl.innerHTML = `<div class="cart-empty">Savat bo'sh.<br>Menyudan mahsulot tanlang 🍔</div>`;
    cartFootEl.innerHTML = '';
    return;
  }
  cartItemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="image/${esc(c.image)}" alt="${esc(c.name)}">
      <div class="cart-item-info">
        <div class="cart-item-name">${esc(c.name)}</div>
        <div class="cart-item-price">${formatPrice(c.price)}</div>
      </div>
      <div class="cart-qty">
        <button data-qty-minus="${c.id}" aria-label="Kamaytirish">−</button>
        <span>${c.qty}</span>
        <button data-qty-plus="${c.id}" aria-label="Ko'paytirish">+</button>
      </div>
      <button class="cart-remove" data-remove="${c.id}" aria-label="O'chirish">✕</button>
    </div>
  `).join('');

  cartFootEl.innerHTML = `
    <div class="cart-total-row"><span>Jami</span><span class="cart-total-amount">${formatPrice(cartTotal())}</span></div>
    <button class="btn btn-gold cart-checkout-btn" id="checkoutBtn">Buyurtma berish</button>
  `;
}

const CUSTOMER_KEY = 'ffh_customer_v1';
function loadCustomer() {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : { phone: '', address: '' };
  } catch (e) { return { phone: '', address: '' }; }
}
function saveCustomer(c) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));
}

function renderCheckoutForm() {
  const saved = loadCustomer();
  cartFootEl.innerHTML = `
    <div class="checkout-form">
      <div class="checkout-field">
        <label>Telefon raqamingiz</label>
        <input type="tel" id="orderPhone" placeholder="+998 90 123 45 67" value="${esc(saved.phone)}">
      </div>
      <div class="checkout-field">
        <label>Yetkazib berish manzili</label>
        <textarea id="orderAddress" placeholder="Shahar, tuman, ko'cha, uy raqami...">${esc(saved.address)}</textarea>
      </div>
      <div class="checkout-error" id="checkoutError"></div>
      <div class="checkout-total-row"><span>Jami</span><span class="cart-total-amount">${formatPrice(cartTotal())}</span></div>
      <div class="checkout-actions">
        <button class="btn btn-outline-dark" id="checkoutBack">← Orqaga</button>
        <button class="btn btn-gold" id="checkoutConfirm">Tasdiqlash</button>
      </div>
    </div>
  `;
}

function openCart() {
  renderCartPanel();
  cartOverlay?.classList.add('show');
}
function closeCart() {
  cartOverlay?.classList.remove('show');
}

document.getElementById('cartFab')?.addEventListener('click', openCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', (e) => { if (e.target === cartOverlay) closeCart(); });

cartItemsEl?.addEventListener('click', (e) => {
  const plus = e.target.closest('[data-qty-plus]');
  const minus = e.target.closest('[data-qty-minus]');
  const remove = e.target.closest('[data-remove]');
  if (plus) changeQty(Number(plus.dataset.qtyPlus), 1);
  else if (minus) changeQty(Number(minus.dataset.qtyMinus), -1);
  else if (remove) removeFromCart(Number(remove.dataset.remove));
});

cartFootEl?.addEventListener('click', (e) => {
  if (e.target.closest('#checkoutBtn')) renderCheckoutForm();
  else if (e.target.closest('#checkoutBack')) renderCartPanel();
  else if (e.target.closest('#checkoutConfirm')) confirmCheckout();
});

function confirmCheckout() {
  const phoneInput = document.getElementById('orderPhone');
  const addressInput = document.getElementById('orderAddress');
  const errorEl = document.getElementById('checkoutError');
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  const phoneDigits = phone.replace(/[^\d]/g, '');
  if (phoneDigits.length < 9) {
    errorEl.textContent = "Iltimos, to'g'ri telefon raqam kiriting.";
    phoneInput.focus();
    return;
  }
  if (address.length < 5) {
    errorEl.textContent = 'Iltimos, yetkazib berish manzilini kiriting.';
    addressInput.focus();
    return;
  }
  errorEl.textContent = '';

  saveCustomer({ phone, address });
  submitOrder(phone, address);
}

function submitOrder(phone, address) {
  if (!cart.length) return;
  const order = {
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
    total: cartTotal(),
    phone,
    address,
    ts: new Date().toISOString()
  };

  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg && typeof tg.sendData === 'function' && tg.initData) {
    tg.sendData(JSON.stringify(order));
    showToast("Buyurtma yuborildi! ✅", 2600);
    cart = [];
    saveCart();
    updateCartBadge();
    closeCart();
    setTimeout(() => { if (tg.close) tg.close(); }, 900);
  } else {
    cartFootEl.innerHTML = `
      <div class="cart-confirm">
        ✅ Buyurtmangiz rasmiylashtirildi!<br>
        <small>${esc(phone)} raqamiga va "${esc(address)}" manziliga tez orada bog'lanamiz.<br><br>Buyurtmani to'g'ridan-to'g'ri yuborish uchun saytni bizning Telegram botimiz orqali oching.</small>
      </div>
    `;
    cart = [];
    saveCart();
    updateCartBadge();
    cartItemsEl.innerHTML = `<div class="cart-empty">Savat bo'sh.</div>`;
  }
}

updateCartBadge();

/* ===== Add-to-cart + open-cart buttons (event delegation) ===== */
document.body.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.add-btn');
  if (addBtn) {
    const id = Number(addBtn.dataset.id);
    addToCart(id);
    showToast(`${addBtn.dataset.name || 'Taom'} savatga qo'shildi`);
    return;
  }
  if (e.target.closest('.open-cart-btn')) {
    openCart();
  }
});

/* ===== Telegram Mini App init ===== */
if (window.Telegram && window.Telegram.WebApp) {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  } catch (e) { /* not running inside Telegram */ }
}

/* ===== Scroll-reveal ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.menu-card, .reveal').forEach(el => revealObserver.observe(el));

/* ===== Animated rating counter ===== */
const ratingEl = document.getElementById('ratingCounter');
if (ratingEl) {
  const target = Number(ratingEl.dataset.target) || 0;
  const duration = 1400;
  let started = false;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          ratingEl.textContent = Math.round(eased * target).toLocaleString('ru-RU').replace(/,/g, ' ');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  counterObserver.observe(ratingEl);
}

/* ===== Scroll progress bar ===== */
const progressBar = document.getElementById('progressBar');
function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgressBar, { passive: true });
updateProgressBar();

/* ===== Back to top ===== */
const backToTop = document.getElementById('backToTop');
function updateBackToTop() {
  if (!backToTop) return;
  if (window.scrollY > 700) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
}
window.addEventListener('scroll', updateBackToTop, { passive: true });
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
updateBackToTop();

/* ===== Hero image tilt (pointer-fine devices only) ===== */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const frame = document.querySelector('.hero-media .frame');
  if (frame) {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    frame.addEventListener('mouseleave', () => {
      frame.style.transform = '';
    });
  }
}
