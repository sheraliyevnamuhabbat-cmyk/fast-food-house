/* Fast Food House — shared site data + storage helpers.
   Used by both index.html (renders the public site) and admin.html
   (edits the same data). Persisted in localStorage so admin edits
   show up on the public site without a backend. */

const STORAGE_KEY = 'ffh_site_data_v1';
const AUTH_KEY = 'ffh_admin_auth';
const ADMIN_EMAIL = 'sheraliyevnamuhabbat@gmail.com';
const ADMIN_PASSWORD = 'Admin@FastFood2026!';

const IMAGE_LIBRARY = [
  '4sir.jpg', 'Chizkeyk.jpg', 'Sarimsoq.webp', 'achchiq.jpg', 'asal.webp',
  'brauni.jpg', 'chilihod.jpg', 'fri.jpg', 'klassik.webp', 'klassikhod.jpg',
  'kombo1.jpg', 'kombo2.jpg', 'kombo3.jpg', 'margarita.jpg', 'mol.jpg',
  'nagetsi.jpg', 'peperoni.jpg', 'pishloqli.jpg', 'pishloqlihod.jpg',
  'pishlosous.jpg', 'piyoz.jpg', 'piyozz.png', 'r1.jpg', 'r2.jpg', 'r3.jpg',
  'r4.jpg', 'r5.jpg', 'r6.jpg', 'tovuq.jpg'
];

const DEFAULT_SITE_DATA = {
  site: {
    brandName: 'FAST FOOD HOUSE',
    brandTagline: 'TEZKOR & MAZALI',
    copyright: '© 2026 Fast Food House. Barcha huquqlar himoyalangan.'
  },
  hero: {
    eyebrow: "Yangi tayyorlangan. Zavq bilan yeyiladi.",
    titleTop: "MAZALI",
    titleMid: "TAOMLAR",
    titleGold: "TO'G'RI",
    titleBottom: "TAYYORLANADI",
    description: "100% yangi mahsulotlar, boy ta'm, qarsildoq fri va shaurmalar — bir joyda. Burger, pitsa, hot-dog va shaurmalarimiz har kuni yangidan tayyorlanadi.",
    primaryBtn: "MENYUNI KO'RISH",
    secondaryBtn: "MANZILNI TOPISH",
    ratingScore: "4.9",
    ratingCount: 1800,
    ratingLabel: "sharh",
    image: "r5.jpg",
    badgeLine1: "100% YANGI MAHSULOT",
    badgeLine2: "Muzlatilmagan"
  },
  features: [
    { title: "YUQORI SIFAT", desc: "100% yangi go'sht, hech qachon muzlatilmagan." },
    { title: "QARSILDOQ FRI", desc: "Oltin rangda va mukammal tuzlangan." },
    { title: "ISSIQ PITSA", desc: "Har bir buyurtma uchun yangidan pishiriladi." },
    { title: "HAR KUNI YANGI", desc: "Sifatli ingredientlar har kuni yetkaziladi." }
  ],
  categories: [
    { key: 'burger', label: 'Burgerlar' },
    { key: 'gazak', label: 'Gazaklar' },
    { key: 'hotdog', label: 'Hot-doglar' },
    { key: 'kombo', label: 'Kombolar' },
    { key: 'shaurma', label: 'Shaurma' },
    { key: 'pitsa', label: 'Pitsa' },
    { key: 'vok', label: 'Vok' },
    { key: 'desert', label: 'Desertlar' },
    { key: 'sous', label: 'Souslar' }
  ],
  menu: [
    { id: 1, category: 'burger', name: "Klassik Burger", desc: "Mol go'shti, salat, pomidor, piyoz, tuziq turshi va maxsus sous.", price: 32000, image: 'r5.jpg' },
    { id: 2, category: 'burger', name: "Dueble Cheeseburger", desc: "Ikki qavat mol go'shti, erigan pishloq, xantal-tuziq sous.", price: 42000, image: 'r2.jpg' },
    { id: 3, category: 'burger', name: "BBQ Piyozli Burger", desc: "Karamellangan piyoz, qalampirli sous va ikki qavat kotlet.", price: 45000, image: 'r3.jpg' },
    { id: 4, category: 'burger', name: "Avokado Burger", desc: "G'alla bulochka, avokado ezmasi, turp va yangi ko'katlar.", price: 38000, image: 'r1.jpg' },
    { id: 5, category: 'burger', name: "Gril Burger", desc: "Kunjutli bulochka, yangi sabzavotlar va gril kotlet.", price: 30000, image: 'r4.jpg' },
    { id: 6, category: 'burger', name: "Pushti Burger", desc: "Maxsus pushti bulochka, uzun pishirilgan go'sht va erigan pishloq.", price: 40000, image: 'r6.jpg' },
    { id: 7, category: 'gazak', name: "Tovuq Nagetslari", desc: "Qarsildoq panirovka, achchiq-shirin sous bilan xizmat qilinadi.", price: 22000, image: 'nagetsi.jpg' },
    { id: 8, category: 'gazak', name: "Piyoz Halqalari", desc: "Qarsildoq qovurilgan, achchiq sous bilan birga.", price: 18000, image: 'piyoz.jpg' },
    { id: 9, category: 'gazak', name: "Fri Kartoshka", desc: "Oltin rangda qovurilgan, tuz bilan sepilgan qarsildoq fri.", price: 15000, image: 'fri.jpg' },
    { id: 10, category: 'hotdog', name: "Klassik Hot-dog", desc: "Sosiska, tuziq turshi va xantal bilan yangi bulochkada.", price: 20000, image: 'klassikhod.jpg' },
    { id: 11, category: 'hotdog', name: "Pishloqli Hot-dog", desc: "Erigan pishloq bilan mo'l-ko'l bezatilgan hot-dog.", price: 24000, image: 'pishloqlihod.jpg' },
    { id: 12, category: 'hotdog', name: "Chili Hot-dog", desc: "Chili sous, xantal va yangi piyoz bilan bezatilgan.", price: 25000, image: 'chilihod.jpg' },
    { id: 13, category: 'kombo', name: "Burger Kombo", desc: "Burger, fri kartoshka va sovuq ichimlik bir tarelkada.", price: 55000, image: 'kombo1.jpg' },
    { id: 14, category: 'kombo', name: "Katta Kombo", desc: "Burger, ikkita hot-dog, fri kartoshka va ichimlik.", price: 65000, image: 'kombo2.jpg' },
    { id: 15, category: 'kombo', name: "Pitsa Kombo", desc: "Pepperoni pitsa, ikkita hot-dog, fri va ichimlik.", price: 60000, image: 'kombo3.jpg' },
    { id: 16, category: 'shaurma', name: "Achchiq Shaurma", desc: "Qarsildoq to'ldirma, achchiq sous va yangi sabzavotlar bilan.", price: 28000, image: 'achchiq.jpg' },
    { id: 17, category: 'shaurma', name: "Tovuq Shaurma", desc: "Gril tovuq, yangi sabzavotlar va maxsus sous bilan o'ralgan.", price: 26000, image: 'klassik.webp' },
    { id: 18, category: 'shaurma', name: "Pishloqli Shaurma", desc: "Mo'l-ko'l pishloq, xumus sousi va qarsildoq sabzavotlar.", price: 30000, image: 'pishloqli.jpg' },
    { id: 19, category: 'pitsa', name: "Pepperoni Pitsa", desc: "Mol'zarella pishlog'i va shirali pepperoni bilan.", price: 55000, image: 'peperoni.jpg' },
    { id: 20, category: 'pitsa', name: "Margarita Pitsa", desc: "Pomidor, mol'zarella va yangi rayhon bargi bilan.", price: 48000, image: 'margarita.jpg' },
    { id: 21, category: 'pitsa', name: "4 Pishloqli Pitsa", desc: "To'rt xil pishloq bilan boy va lazzatli ta'm.", price: 52000, image: '4sir.jpg' },
    { id: 22, category: 'vok', name: "Mol Go'shtli Vok", desc: "Tuxum lag'mon, mol go'shti va yangi sabzavotlar bilan vok qozonda.", price: 42000, image: 'mol.jpg' },
    { id: 23, category: 'vok', name: "Tovuqli Vok", desc: "Tuxum lag'mon, gril tovuq va yangi sabzavotlar bilan vok qozonda.", price: 38000, image: 'tovuq.jpg' },
    { id: 24, category: 'desert', name: "Chizkeyk", desc: "Nafis va yumshoq, shokolad sous bilan bezatilgan.", price: 20000, image: 'Chizkeyk.jpg' },
    { id: 25, category: 'desert', name: "Shokoladli Brauni", desc: "Yumshoq va shirali, yalpiz bargi bilan bezatilgan.", price: 18000, image: 'brauni.jpg' },
    { id: 26, category: 'sous', name: "Sarimsoq Sousi", desc: "Krem asosidagi yangi sarimsoqli maxsus sous.", price: 6000, image: 'Sarimsoq.webp' },
    { id: 27, category: 'sous', name: "Pishloq Sousi", desc: "Erigan pishloqdan tayyorlangan issiq va yumshoq sous.", price: 7000, image: 'pishlosous.jpg' }
  ],
  promo: {
    comboEyebrow: "Kombo taklifi",
    comboTitleTop: "OVQATNI",
    comboTitleBottom: "KATTA QILING!",
    comboText: "Har qanday burger, pitsa yoki hot-dogingizga fri va ichimlik qo'shing.",
    comboPrice: "+12 000 so'm",
    comboPriceLabel: "fri & ichimlik uchun",
    comboBtn: "BUYURTMA BERISH",
    comboImage: 'kombo2.jpg',
    aboutEyebrow: "Biz haqimizda",
    aboutTitleTop: "CHIN INGREDIENTLAR,",
    aboutTitleBottom: "CHIN MAZALI TAOMLAR",
    aboutText: "Biz oddiy g'oyadan boshladik: halol va yangi mahsulotlardan eng mazali taomlarni tayyorlash. Har bir taom siz uchun buyurtma asosida tayyorlanadi.",
    aboutBtn: "BIZNING HIKOYAMIZ →",
    aboutStampLine1: "CHIN TA'M",
    aboutStampLine2: "HAR KUNI"
  },
  footer: {
    tagline: "Yangi ingredientlardan tayyorlangan burger, pitsa, shaurma va hot-doglar — tez va mazali.",
    hours: [
      { label: "Dush – Payshanba", value: "11:00 – 22:00" },
      { label: "Juma – Shanba", value: "11:00 – 23:00" },
      { label: "Yakshanba", value: "12:00 – 22:00" }
    ],
    social: { facebook: '#', instagram: '#', telegram: '#' },
    orderLabel: "Uyingizga yetkazib berish",
    orderCta: "HOZIROQ BUYURTMA BERING →"
  }
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getSiteData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(DEFAULT_SITE_DATA);
    const parsed = JSON.parse(raw);
    // shallow-merge with defaults so newly added default fields survive old saves
    return Object.assign(deepClone(DEFAULT_SITE_DATA), parsed);
  } catch (e) {
    return deepClone(DEFAULT_SITE_DATA);
  }
}

function saveSiteData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetSiteData() {
  localStorage.removeItem(STORAGE_KEY);
}

function nextMenuId(data) {
  return data.menu.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function formatPrice(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}
