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
          <button class="add-btn" data-name="${esc(item.name)}">+</button>
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
    <a href="#" class="btn btn-gold" style="width:fit-content;">${esc(p.comboBtn)}</a>
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
      <div class="order-box">
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

/* ===== Add-to-cart toast (event delegation, works for dynamic cards) ===== */
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
let toastTimer;

document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-btn');
  if (!btn) return;
  const name = btn.dataset.name || 'Taom';
  toastText.textContent = `${name} savatga qo'shildi`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
});

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
