/* Fast Food House — Admin Panel logic.
   Client-side only (no backend): edits are kept in `data` and persisted
   to localStorage via saveSiteData(), which index.html reads on load. */

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

let data = getSiteData();
let activeTab = 'overview';
let editingMenuId = null;
const ORDERS_API = 'http://localhost:4000';
let ordersPollTimer = null;

/* ================= AUTH ================= */
const loginScreen = document.getElementById('loginScreen');
const adminApp = document.getElementById('adminApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function showApp() {
  loginScreen.classList.add('hidden');
  adminApp.classList.remove('hidden');
  renderTab(activeTab);
}

function showLogin() {
  adminApp.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginEmail').value = '';
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  if (email === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    loginError.textContent = '';
    showApp();
  } else {
    loginError.textContent = "Email yoki parol noto'g'ri. Qayta urinib ko'ring.";
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
});

if (isAuthed()) showApp(); else showLogin();

/* ================= TOAST ================= */
const adminToast = document.getElementById('adminToast');
let toastTimer;
function showToast(msg) {
  adminToast.textContent = msg;
  adminToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => adminToast.classList.remove('show'), 2200);
}

function persist(msg) {
  saveSiteData(data);
  showToast(msg || 'Saqlandi');
}

/* ================= RESET ================= */
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm("Barcha o'zgarishlar standart holatga qaytariladi. Davom etasizmi?")) return;
  resetSiteData();
  data = getSiteData();
  showToast('Standart holatga qaytarildi');
  renderTab(activeTab);
});

/* ================= NAV / TABS ================= */
const TAB_TITLES = {
  overview: "Umumiy ko'rinish",
  orders: 'Buyurtmalar',
  hero: 'Bosh ekran',
  features: 'Xususiyatlar',
  menu: 'Menyu boshqaruvi',
  categories: 'Kategoriyalar',
  promo: 'Bannerlar',
  footer: 'Footer / Aloqa'
};

document.getElementById('adminNav').addEventListener('click', (e) => {
  const btn = e.target.closest('.admin-nav-btn');
  if (!btn) return;
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeTab = btn.dataset.tab;
  renderTab(activeTab);
});

function renderTab(tab) {
  stopOrdersPolling();
  document.getElementById('tabTitle').textContent = TAB_TITLES[tab];
  const map = {
    overview: renderOverview,
    orders: renderOrdersTab,
    hero: renderHeroTab,
    features: renderFeaturesTab,
    menu: renderMenuTab,
    categories: renderCategoriesTab,
    promo: renderPromoTab,
    footer: renderFooterTab
  };
  (map[tab] || renderOverview)();
}

function imageOptions(selected) {
  return IMAGE_LIBRARY.map(f => `<option value="${esc(f)}" ${f === selected ? 'selected' : ''}>${esc(f)}</option>`).join('');
}

/* ================= OVERVIEW ================= */
function renderOverview() {
  const content = document.getElementById('tabContent');
  const totalItems = data.menu.length;
  const totalCats = data.categories.length;
  const avgPrice = Math.round(data.menu.reduce((s, m) => s + Number(m.price || 0), 0) / (totalItems || 1));
  const cheapest = data.menu.reduce((min, m) => Math.min(min, m.price), Infinity);

  const breakdown = data.categories.map(c => {
    const count = data.menu.filter(m => m.category === c.key).length;
    return `<div class="admin-cat-row"><span>${esc(c.label)}</span><b>${count} ta</b></div>`;
  }).join('');

  content.innerHTML = `
    <div class="admin-stats">
      <div class="admin-stat"><div class="num gold">${totalItems}</div><div class="label">Jami mahsulotlar</div></div>
      <div class="admin-stat"><div class="num">${totalCats}</div><div class="label">Kategoriyalar</div></div>
      <div class="admin-stat"><div class="num">${formatPrice(avgPrice)}</div><div class="label">O'rtacha narx</div></div>
      <div class="admin-stat"><div class="num">${formatPrice(cheapest)}</div><div class="label">Eng arzon mahsulot</div></div>
    </div>
    <div class="admin-card">
      <h2>Kategoriyalar bo'yicha taqsimot</h2>
      <p class="admin-card-sub">Har bir bo'limda nechta mahsulot borligi</p>
      <div class="admin-cat-breakdown">${breakdown}</div>
    </div>
    <div class="admin-card">
      <h2>Tezkor havola</h2>
      <p class="admin-card-sub">O'zgarishlar avtomatik ravishda saytga qo'llanadi — brauzeringizda saqlanadi.</p>
      <a href="index.html" target="_blank" class="btn btn-gold" style="width:fit-content;">Saytni ko'rish ↗</a>
    </div>
  `;
}

/* ================= HERO ================= */
function renderHeroTab() {
  const h = data.hero;
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-card">
      <h2>Bosh ekran matni</h2>
      <p class="admin-card-sub">Saytning eng birinchi ko'rinadigan qismi</p>
      <div class="admin-grid">
        <div class="admin-field full"><label>Kichik sarlavha (eyebrow)</label><input type="text" id="f_eyebrow" value="${esc(h.eyebrow)}"></div>
        <div class="admin-field"><label>Sarlavha — 1-qator</label><input type="text" id="f_titleTop" value="${esc(h.titleTop)}"></div>
        <div class="admin-field"><label>Sarlavha — 2-qator (oddiy)</label><input type="text" id="f_titleMid" value="${esc(h.titleMid)}"></div>
        <div class="admin-field"><label>Sarlavha — 2-qator (oltin rang so'z)</label><input type="text" id="f_titleGold" value="${esc(h.titleGold)}"></div>
        <div class="admin-field"><label>Sarlavha — 3-qator</label><input type="text" id="f_titleBottom" value="${esc(h.titleBottom)}"></div>
        <div class="admin-field full"><label>Tavsif matni</label><textarea id="f_description">${esc(h.description)}</textarea></div>
        <div class="admin-field"><label>Asosiy tugma matni</label><input type="text" id="f_primaryBtn" value="${esc(h.primaryBtn)}"></div>
        <div class="admin-field"><label>Ikkinchi tugma matni</label><input type="text" id="f_secondaryBtn" value="${esc(h.secondaryBtn)}"></div>
        <div class="admin-field"><label>Reyting bahosi</label><input type="text" id="f_ratingScore" value="${esc(h.ratingScore)}"></div>
        <div class="admin-field"><label>Sharhlar soni</label><input type="number" id="f_ratingCount" value="${Number(h.ratingCount) || 0}"></div>
        <div class="admin-field"><label>Reyting sub-matni</label><input type="text" id="f_ratingLabel" value="${esc(h.ratingLabel)}"></div>
        <div class="admin-field full">
          <label>Hero rasmi</label>
          <div class="admin-image-picker">
            <select id="f_image">${imageOptions(h.image)}</select>
            <img id="f_imagePreview" src="image/${esc(h.image)}" alt="">
          </div>
        </div>
        <div class="admin-field"><label>Belgi (badge) — 1-qator</label><input type="text" id="f_badgeLine1" value="${esc(h.badgeLine1)}"></div>
        <div class="admin-field"><label>Belgi (badge) — 2-qator</label><input type="text" id="f_badgeLine2" value="${esc(h.badgeLine2)}"></div>
      </div>
      <div class="admin-save-row"><button class="btn btn-gold" id="saveHero">Saqlash</button></div>
    </div>
  `;

  document.getElementById('f_image').addEventListener('change', (e) => {
    document.getElementById('f_imagePreview').src = `image/${e.target.value}`;
  });

  document.getElementById('saveHero').addEventListener('click', () => {
    data.hero = {
      eyebrow: val('f_eyebrow'),
      titleTop: val('f_titleTop'),
      titleMid: val('f_titleMid'),
      titleGold: val('f_titleGold'),
      titleBottom: val('f_titleBottom'),
      description: val('f_description'),
      primaryBtn: val('f_primaryBtn'),
      secondaryBtn: val('f_secondaryBtn'),
      ratingScore: val('f_ratingScore'),
      ratingCount: Number(val('f_ratingCount')) || 0,
      ratingLabel: val('f_ratingLabel'),
      image: val('f_image'),
      badgeLine1: val('f_badgeLine1'),
      badgeLine2: val('f_badgeLine2')
    };
    persist('Bosh ekran yangilandi');
  });
}

function val(id) { return document.getElementById(id).value.trim(); }

/* ================= FEATURES ================= */
function renderFeaturesTab() {
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-card">
      <h2>Xususiyatlar qatori</h2>
      <p class="admin-card-sub">Bosh ekran ostidagi 4 ta afzallik bloki</p>
      <div class="admin-grid">
        ${data.features.map((f, i) => `
          <div class="admin-field full" style="border:1px solid rgba(20,15,5,.08);border-radius:12px;padding:16px;">
            <label>Sarlavha ${i + 1}</label>
            <input type="text" id="feat_title_${i}" value="${esc(f.title)}" style="margin-bottom:10px;">
            <label>Tavsif ${i + 1}</label>
            <input type="text" id="feat_desc_${i}" value="${esc(f.desc)}">
          </div>
        `).join('')}
      </div>
      <div class="admin-save-row"><button class="btn btn-gold" id="saveFeatures">Saqlash</button></div>
    </div>
  `;

  document.getElementById('saveFeatures').addEventListener('click', () => {
    data.features = data.features.map((f, i) => ({
      title: val(`feat_title_${i}`),
      desc: val(`feat_desc_${i}`)
    }));
    persist('Xususiyatlar yangilandi');
  });
}

/* ================= CATEGORIES ================= */
function renderCategoriesTab() {
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-card">
      <h2>Kategoriya nomlari</h2>
      <p class="admin-card-sub">Menyudagi filtr tugmalarida ko'rinadigan nomlar. Kalit (key) o'zgarmaydi, faqat nom.</p>
      <div class="admin-grid">
        ${data.categories.map((c, i) => `
          <div class="admin-field">
            <label>${esc(c.key)}</label>
            <input type="text" id="cat_label_${i}" value="${esc(c.label)}">
          </div>
        `).join('')}
      </div>
      <div class="admin-save-row"><button class="btn btn-gold" id="saveCategories">Saqlash</button></div>
    </div>
  `;

  document.getElementById('saveCategories').addEventListener('click', () => {
    data.categories = data.categories.map((c, i) => ({ key: c.key, label: val(`cat_label_${i}`) }));
    persist('Kategoriyalar yangilandi');
  });
}

/* ================= MENU ================= */
function renderMenuTab() {
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-card">
      <div class="admin-toolbar">
        <select id="menuCatFilter">
          <option value="all">Barcha kategoriyalar</option>
          ${data.categories.map(c => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join('')}
        </select>
        <button class="btn btn-gold" id="addMenuItemBtn">+ Yangi mahsulot qo'shish</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr><th></th><th>Nomi</th><th>Kategoriya</th><th>Narx</th><th></th></tr>
          </thead>
          <tbody id="menuTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  renderMenuTable('all');

  document.getElementById('menuCatFilter').addEventListener('change', (e) => {
    renderMenuTable(e.target.value);
  });

  document.getElementById('addMenuItemBtn').addEventListener('click', () => openMenuForm(null));
}

function renderMenuTable(filterKey) {
  const tbody = document.getElementById('menuTableBody');
  const items = data.menu.filter(m => filterKey === 'all' || m.category === filterKey);
  const catLabel = (key) => data.categories.find(c => c.key === key)?.label || key;

  tbody.innerHTML = items.map(item => `
    <tr>
      <td><img src="image/${esc(item.image)}" alt=""></td>
      <td><strong>${esc(item.name)}</strong></td>
      <td><span class="cat-tag">${esc(catLabel(item.category))}</span></td>
      <td class="price">${formatPrice(item.price)}</td>
      <td>
        <div class="admin-row-actions">
          <button class="icon-btn" data-edit="${item.id}" title="Tahrirlash">✎</button>
          <button class="icon-btn danger" data-del="${item.id}" title="O'chirish">🗑</button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">Bu kategoriyada mahsulot yo'q</td></tr>`;

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openMenuForm(Number(btn.dataset.edit)));
  });
  tbody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteMenuItem(Number(btn.dataset.del)));
  });
}

function deleteMenuItem(id) {
  const item = data.menu.find(m => m.id === id);
  if (!item) return;
  if (!confirm(`"${item.name}" mahsulotini o'chirmoqchimisiz?`)) return;
  data.menu = data.menu.filter(m => m.id !== id);
  persist("Mahsulot o'chirildi");
  renderMenuTable(document.getElementById('menuCatFilter').value);
}

const adminOverlay = document.getElementById('adminOverlay');
const panelBody = document.getElementById('panelBody');
document.getElementById('panelClose').addEventListener('click', closePanel);
adminOverlay.addEventListener('click', (e) => { if (e.target === adminOverlay) closePanel(); });

function closePanel() {
  adminOverlay.classList.remove('show');
}

function openMenuForm(id) {
  editingMenuId = id;
  const item = id ? data.menu.find(m => m.id === id) : { category: data.categories[0].key, name: '', desc: '', price: 0, image: IMAGE_LIBRARY[0] };

  panelBody.innerHTML = `
    <h3>${id ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</h3>
    <div class="admin-field">
      <label>Kategoriya</label>
      <select id="m_category">${data.categories.map(c => `<option value="${esc(c.key)}" ${c.key === item.category ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
    </div>
    <div class="admin-field"><label>Nomi</label><input type="text" id="m_name" value="${esc(item.name)}"></div>
    <div class="admin-field"><label>Tavsif</label><textarea id="m_desc">${esc(item.desc)}</textarea></div>
    <div class="admin-field"><label>Narxi (so'm)</label><input type="number" id="m_price" value="${Number(item.price) || 0}"></div>
    <div class="admin-field">
      <label>Rasm</label>
      <div class="admin-image-picker">
        <select id="m_image">${imageOptions(item.image)}</select>
        <img id="m_imagePreview" src="image/${esc(item.image)}" alt="">
      </div>
    </div>
    <div class="admin-save-row"><button class="btn btn-gold" id="saveMenuItem">${id ? 'Saqlash' : "Qo'shish"}</button></div>
  `;

  document.getElementById('m_image').addEventListener('change', (e) => {
    document.getElementById('m_imagePreview').src = `image/${e.target.value}`;
  });

  document.getElementById('saveMenuItem').addEventListener('click', () => {
    const name = val('m_name');
    if (!name) { alert('Nomi kiritilishi shart'); return; }
    const payload = {
      category: val('m_category'),
      name,
      desc: val('m_desc'),
      price: Number(val('m_price')) || 0,
      image: val('m_image')
    };
    if (editingMenuId) {
      const idx = data.menu.findIndex(m => m.id === editingMenuId);
      data.menu[idx] = { id: editingMenuId, ...payload };
    } else {
      data.menu.push({ id: nextMenuId(data), ...payload });
    }
    persist(editingMenuId ? 'Mahsulot yangilandi' : "Mahsulot qo'shildi");
    closePanel();
    renderMenuTable(document.getElementById('menuCatFilter')?.value || 'all');
  });

  adminOverlay.classList.add('show');
}

/* ================= PROMO ================= */
function renderPromoTab() {
  const p = data.promo;
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-card">
      <h2>Kombo banneri (qora panel)</h2>
      <div class="admin-grid">
        <div class="admin-field"><label>Eyebrow</label><input type="text" id="p_comboEyebrow" value="${esc(p.comboEyebrow)}"></div>
        <div class="admin-field"></div>
        <div class="admin-field"><label>Sarlavha — 1-qator</label><input type="text" id="p_comboTitleTop" value="${esc(p.comboTitleTop)}"></div>
        <div class="admin-field"><label>Sarlavha — 2-qator</label><input type="text" id="p_comboTitleBottom" value="${esc(p.comboTitleBottom)}"></div>
        <div class="admin-field full"><label>Matn</label><textarea id="p_comboText">${esc(p.comboText)}</textarea></div>
        <div class="admin-field"><label>Narx yorlig'i</label><input type="text" id="p_comboPrice" value="${esc(p.comboPrice)}"></div>
        <div class="admin-field"><label>Narx tavsifi</label><input type="text" id="p_comboPriceLabel" value="${esc(p.comboPriceLabel)}"></div>
        <div class="admin-field"><label>Tugma matni</label><input type="text" id="p_comboBtn" value="${esc(p.comboBtn)}"></div>
        <div class="admin-field">
          <label>Fon rasmi</label>
          <div class="admin-image-picker">
            <select id="p_comboImage">${imageOptions(p.comboImage)}</select>
            <img id="p_comboImagePreview" src="image/${esc(p.comboImage)}" alt="">
          </div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <h2>"Biz haqimizda" banneri (oltin panel)</h2>
      <div class="admin-grid">
        <div class="admin-field"><label>Eyebrow</label><input type="text" id="p_aboutEyebrow" value="${esc(p.aboutEyebrow)}"></div>
        <div class="admin-field"></div>
        <div class="admin-field"><label>Sarlavha — 1-qator</label><input type="text" id="p_aboutTitleTop" value="${esc(p.aboutTitleTop)}"></div>
        <div class="admin-field"><label>Sarlavha — 2-qator</label><input type="text" id="p_aboutTitleBottom" value="${esc(p.aboutTitleBottom)}"></div>
        <div class="admin-field full"><label>Matn</label><textarea id="p_aboutText">${esc(p.aboutText)}</textarea></div>
        <div class="admin-field"><label>Tugma matni</label><input type="text" id="p_aboutBtn" value="${esc(p.aboutBtn)}"></div>
        <div class="admin-field"></div>
        <div class="admin-field"><label>Muhr — 1-qator</label><input type="text" id="p_aboutStampLine1" value="${esc(p.aboutStampLine1)}"></div>
        <div class="admin-field"><label>Muhr — 2-qator</label><input type="text" id="p_aboutStampLine2" value="${esc(p.aboutStampLine2)}"></div>
      </div>
      <div class="admin-save-row"><button class="btn btn-gold" id="savePromo">Saqlash</button></div>
    </div>
  `;

  document.getElementById('p_comboImage').addEventListener('change', (e) => {
    document.getElementById('p_comboImagePreview').src = `image/${e.target.value}`;
  });

  document.getElementById('savePromo').addEventListener('click', () => {
    data.promo = {
      comboEyebrow: val('p_comboEyebrow'),
      comboTitleTop: val('p_comboTitleTop'),
      comboTitleBottom: val('p_comboTitleBottom'),
      comboText: val('p_comboText'),
      comboPrice: val('p_comboPrice'),
      comboPriceLabel: val('p_comboPriceLabel'),
      comboBtn: val('p_comboBtn'),
      comboImage: val('p_comboImage'),
      aboutEyebrow: val('p_aboutEyebrow'),
      aboutTitleTop: val('p_aboutTitleTop'),
      aboutTitleBottom: val('p_aboutTitleBottom'),
      aboutText: val('p_aboutText'),
      aboutBtn: val('p_aboutBtn'),
      aboutStampLine1: val('p_aboutStampLine1'),
      aboutStampLine2: val('p_aboutStampLine2')
    };
    persist('Bannerlar yangilandi');
  });
}

/* ================= FOOTER ================= */
function renderFooterTab() {
  const f = data.footer;
  const s = data.site;
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-card">
      <h2>Brend</h2>
      <div class="admin-grid">
        <div class="admin-field"><label>Brend nomi</label><input type="text" id="s_brandName" value="${esc(s.brandName)}"></div>
        <div class="admin-field"><label>Brend shiori</label><input type="text" id="s_brandTagline" value="${esc(s.brandTagline)}"></div>
        <div class="admin-field full"><label>Mualliflik huquqi matni</label><input type="text" id="s_copyright" value="${esc(s.copyright)}"></div>
      </div>
    </div>

    <div class="admin-card">
      <h2>Footer tavsifi</h2>
      <div class="admin-field full"><textarea id="f_tagline">${esc(f.tagline)}</textarea></div>
    </div>

    <div class="admin-card">
      <h2>Ish vaqti</h2>
      <div class="admin-grid">
        ${f.hours.map((h, i) => `
          <div class="admin-field"><label>Kun ${i + 1}</label><input type="text" id="hrs_label_${i}" value="${esc(h.label)}"></div>
          <div class="admin-field"><label>Vaqt ${i + 1}</label><input type="text" id="hrs_value_${i}" value="${esc(h.value)}"></div>
        `).join('')}
      </div>
    </div>

    <div class="admin-card">
      <h2>Ijtimoiy tarmoqlar</h2>
      <div class="admin-grid">
        <div class="admin-field"><label>Facebook havolasi</label><input type="url" id="soc_facebook" value="${esc(f.social.facebook)}"></div>
        <div class="admin-field"><label>Instagram havolasi</label><input type="url" id="soc_instagram" value="${esc(f.social.instagram)}"></div>
        <div class="admin-field"><label>Telegram havolasi</label><input type="url" id="soc_telegram" value="${esc(f.social.telegram)}"></div>
      </div>
    </div>

    <div class="admin-card">
      <h2>Yetkazib berish bloki</h2>
      <div class="admin-grid">
        <div class="admin-field"><label>Yorliq</label><input type="text" id="f_orderLabel" value="${esc(f.orderLabel)}"></div>
        <div class="admin-field"><label>Chaqiruv matni</label><input type="text" id="f_orderCta" value="${esc(f.orderCta)}"></div>
      </div>
      <div class="admin-save-row"><button class="btn btn-gold" id="saveFooter">Saqlash</button></div>
    </div>
  `;

  document.getElementById('saveFooter').addEventListener('click', () => {
    data.site.brandName = val('s_brandName');
    data.site.brandTagline = val('s_brandTagline');
    data.site.copyright = val('s_copyright');
    data.footer = {
      tagline: val('f_tagline'),
      hours: f.hours.map((h, i) => ({ label: val(`hrs_label_${i}`), value: val(`hrs_value_${i}`) })),
      social: {
        facebook: val('soc_facebook'),
        instagram: val('soc_instagram'),
        telegram: val('soc_telegram')
      },
      orderLabel: val('f_orderLabel'),
      orderCta: val('f_orderCta')
    };
    persist('Footer yangilandi');
  });
}

/* ================= ORDERS ================= */
const ORDER_STATUS_FLOW = ['yangi', 'tayyorlanmoqda', 'tayyor', 'yetkazildi'];
const ORDER_STATUS_LABEL = {
  yangi: "🆕 Yangi",
  tayyorlanmoqda: "👨‍🍳 Tayyorlanmoqda",
  tayyor: "✅ Tayyor",
  yetkazildi: "🚚 Yetkazildi"
};
const ORDER_NEXT_ACTION_LABEL = {
  yangi: "Tayyorlashni boshlash →",
  tayyorlanmoqda: "Tayyor deb belgilash →",
  tayyor: "Yetkazildi deb belgilash →"
};

function stopOrdersPolling() {
  if (ordersPollTimer) {
    clearInterval(ordersPollTimer);
    ordersPollTimer = null;
  }
}

function renderOrdersTab() {
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="admin-toolbar">
      <select id="ordersStatusFilter">
        <option value="all">Barcha holatlar</option>
        <option value="yangi">🆕 Yangi</option>
        <option value="tayyorlanmoqda">👨‍🍳 Tayyorlanmoqda</option>
        <option value="tayyor">✅ Tayyor</option>
        <option value="yetkazildi">🚚 Yetkazildi</option>
      </select>
      <button class="btn btn-outline-dark" id="ordersRefreshBtn">↻ Yangilash</button>
    </div>
    <div id="ordersList"></div>
  `;

  document.getElementById('ordersStatusFilter').addEventListener('change', () => fetchOrders());
  document.getElementById('ordersRefreshBtn').addEventListener('click', () => fetchOrders());

  fetchOrders();
  stopOrdersPolling();
  ordersPollTimer = setInterval(fetchOrders, 8000);
}

async function fetchOrders() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  try {
    const res = await fetch(`${ORDERS_API}/api/orders`);
    if (!res.ok) throw new Error('API xatosi');
    const orders = await res.json();
    renderOrdersList(orders);
  } catch (e) {
    const isLocal = location.protocol === 'file:' || location.hostname === 'localhost';
    list.innerHTML = isLocal ? `
      <div class="admin-card">
        <h2>Buyurtmalar serveriga ulanib bo'lmadi</h2>
        <p class="admin-card-sub">
          Bot ishga tushirilmagan ko'rinadi. <code>bot</code> papkasidagi <code>start-bot.bat</code> faylini ikki marta bosing
          (yoki terminalda <code>bot</code> papkasida <code>node bot.js</code> buyrug'ini bering) va oynani ochiq qoldiring, so'ng
          "Yangilash" tugmasini bosing.
        </p>
      </div>
    ` : `
      <div class="admin-card">
        <h2>⚠️ Buyurtmalar shu yerdan ko'rinmaydi</h2>
        <p class="admin-card-sub">
          Siz admin panelni <b>internet orqali (GitHub Pages)</b> ochyapsiz. Xavfsizlik sabablariga ko'ra brauzer
          bunday sahifalarga kompyuteringizdagi lokal serverga ulanishni bloklaydi — shuning uchun buyurtmalar bu yerda ko'rinmaydi.
        </p>
        <p class="admin-card-sub">
          <b>Yechim:</b> Buyurtmalarni boshqarish uchun admin panelni <b>kompyuteringizdagi fayldan</b> oching:<br>
          <code>C:\\Users\\User\\Desktop\\food\\admin.html</code><br>
          (yoki <code>food</code> papkasidagi <code>open-admin.bat</code> faylini ikki marta bosing). Bot esa
          <code>bot\\start-bot.bat</code> orqali ishga tushirilgan bo'lishi kerak.
        </p>
      </div>
    `;
  }
}

function renderOrdersList(orders) {
  const filter = document.getElementById('ordersStatusFilter')?.value || 'all';
  const list = document.getElementById('ordersList');
  const filtered = orders.filter(o => filter === 'all' || o.status === filter);

  if (!filtered.length) {
    list.innerHTML = `<div class="admin-card"><p class="admin-card-sub">Bu holatda buyurtmalar yo'q.</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(o => {
    const itemsHtml = o.items.map(it => `<div>${esc(it.name)} × ${it.qty} — ${formatPrice(it.price * it.qty)}</div>`).join('');
    const date = new Date(o.createdAt).toLocaleString('uz-UZ');
    const nextLabel = ORDER_NEXT_ACTION_LABEL[o.status];
    return `
      <div class="admin-card order-card">
        <div class="order-card-head">
          <div>
            <strong>#${o.id}</strong>
            <span class="cat-tag">${ORDER_STATUS_LABEL[o.status] || o.status}</span>
          </div>
          <span class="admin-card-sub">${date}</span>
        </div>
        <div class="order-card-body">
          <div class="order-card-items">${itemsHtml}</div>
          <div class="order-card-meta">
            <div><b>👤</b> ${esc(o.customerName || 'Noma\'lum')}${o.username ? ' (@' + esc(o.username) + ')' : ''}</div>
            <div><b>📞</b> ${esc(o.phone || '—')}</div>
            <div><b>📍</b> ${esc(o.address || '—')}</div>
            <div class="order-card-total"><b>Jami:</b> ${formatPrice(o.total)}</div>
          </div>
        </div>
        ${nextLabel ? `<div class="admin-save-row"><button class="btn btn-gold" data-advance="${o.id}" data-next="${ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.indexOf(o.status) + 1]}">${nextLabel}</button></div>` : ''}
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-advance]').forEach(btn => {
    btn.addEventListener('click', () => advanceOrderStatus(Number(btn.dataset.advance), btn.dataset.next));
  });
}

async function advanceOrderStatus(id, status) {
  try {
    const res = await fetch(`${ORDERS_API}/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Yangilab bo\'lmadi');
    showToast(`Buyurtma #${id} — ${ORDER_STATUS_LABEL[status]}`);
    fetchOrders();
  } catch (e) {
    showToast("Xatolik: buyurtma serveriga ulanib bo'lmadi");
  }
}
