/* Fast Food House — Telegram bot.
   Sends a button that opens the site as a Telegram Mini App (WebApp).
   Run with: node bot.js  (Node 18+ required for global fetch) */

const fs = require('fs');
const path = require('path');
const store = require('./orders-store');
const { startApiServer } = require('./api-server');

const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('config.json topilmadi. config.example.json dan nusxa oling va to\'ldiring.');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const TOKEN = process.env.BOT_TOKEN || config.token;
const SITE_URL = process.env.SITE_URL || config.siteUrl;

if (!TOKEN || TOKEN.includes('YOUR_BOT_TOKEN')) {
  console.error('Bot tokeni config.json ichida to\'ldirilmagan.');
  process.exit(1);
}
if (!SITE_URL || SITE_URL.includes('YOUR_SITE_URL')) {
  console.error('Sayt manzili (siteUrl) config.json ichida to\'ldirilmagan.');
  process.exit(1);
}

const API_PORT = config.apiPort || 4000;
const API = `https://api.telegram.org/bot${TOKEN}`;

const STATUS_LABEL = {
  yangi: '🆕 Yangi',
  tayyorlanmoqda: '👨‍🍳 Tayyorlanmoqda',
  tayyor: '✅ Tayyor',
  yetkazildi: '🚚 Yetkazildi'
};

async function call(method, params) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {})
  });
  const data = await res.json();
  if (!data.ok) console.error(`Telegram API xatosi (${method}):`, data.description);
  return data;
}

async function sendMenu(chatId) {
  await call('sendMessage', {
    chat_id: chatId,
    text: "🍔 *Fast Food House* ga xush kelibsiz!\n\nMenyuni ko'rish va buyurtma berish uchun quyidagi tugmani bosing 👇",
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🍔 Menyuni ochish', web_app: { url: SITE_URL } }],
        [{ text: '🌐 Brauzerda ochish', url: SITE_URL }]
      ]
    }
  });
}

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}

function buildOrderSummary(order, from) {
  const lines = order.items.map(it => `• ${it.name} × ${it.qty} — ${formatPrice(it.price * it.qty)}`);
  const who = from ? `\n👤 ${[from.first_name, from.last_name].filter(Boolean).join(' ')}${from.username ? ' (@' + from.username + ')' : ''}` : '';
  const contact = order.phone ? `\n📞 ${order.phone}` : '';
  const address = order.address ? `\n📍 ${order.address}` : '';
  return `${lines.join('\n')}\n\n💰 Jami: *${formatPrice(order.total)}*${contact}${address}${who}`;
}

async function handleOrder(msg) {
  const chatId = msg.chat.id;
  let parsed;
  try {
    parsed = JSON.parse(msg.web_app_data.data);
  } catch (e) {
    await call('sendMessage', { chat_id: chatId, text: "Buyurtmani o'qishda xatolik yuz berdi." });
    return;
  }
  if (!parsed.items || !parsed.items.length) return;

  const saved = store.addOrder({
    chatId,
    customerName: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' '),
    username: msg.from.username || '',
    items: parsed.items,
    total: parsed.total,
    phone: parsed.phone || '',
    address: parsed.address || ''
  });

  await call('sendMessage', {
    chat_id: chatId,
    text: `✅ *Buyurtmangiz qabul qilindi!*\n\n${buildOrderSummary(saved)}\n\nHoloti: ${STATUS_LABEL.yangi}\nBuyurtma raqami: #${saved.id}\n\nHolatni kuzatish uchun: /buyurtmalarim`,
    parse_mode: 'Markdown'
  });

  if (config.adminChatId) {
    await call('sendMessage', {
      chat_id: config.adminChatId,
      text: `🆕 *Yangi buyurtma!* #${saved.id}\n\n${buildOrderSummary(saved, msg.from)}`,
      parse_mode: 'Markdown'
    });
  }
}

async function handleMyOrders(chatId) {
  const orders = store.getByChat(chatId).sort((a, b) => b.id - a.id);
  if (!orders.length) {
    await call('sendMessage', { chat_id: chatId, text: "Sizda hali buyurtmalar yo'q. Menyudan tanlab, buyurtma bering! 🍔" });
    return;
  }
  const blocks = orders.slice(0, 10).map(o => {
    const itemsLine = o.items.map(it => `${it.name} ×${it.qty}`).join(', ');
    const date = new Date(o.createdAt).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `#${o.id} — ${STATUS_LABEL[o.status] || o.status}\n${itemsLine}\nJami: ${formatPrice(o.total)}\n${date}`;
  });
  await call('sendMessage', {
    chat_id: chatId,
    text: `📦 *Sizning buyurtmalaringiz:*\n\n${blocks.join('\n\n')}`,
    parse_mode: 'Markdown'
  });
}

async function notifyStatusChange(order) {
  if (order.status === 'yangi') return;
  const messages = {
    tayyorlanmoqda: `👨‍🍳 Buyurtmangiz (#${order.id}) tayyorlanmoqda!`,
    tayyor: `✅ Buyurtmangiz (#${order.id}) tayyor! Tez orada yetkaziladi.`,
    yetkazildi: `🚚 Buyurtmangiz (#${order.id}) yetkazib berildi. Yoqimli ishtaha! 😋\n\nBuyurtma tarixingizni /buyurtmalarim orqali ko'rishingiz mumkin.`
  };
  const text = messages[order.status];
  if (text) await call('sendMessage', { chat_id: order.chatId, text });
}

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.chat) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (msg.web_app_data) {
    await handleOrder(msg);
  } else if (text === '/start' || text === '/menu') {
    // Persistent blue "Menu" button next to the message box, opens the site directly.
    if (msg.chat.type === 'private') {
      await call('setChatMenuButton', {
        chat_id: chatId,
        menu_button: { type: 'web_app', text: 'Menyu', web_app: { url: SITE_URL } }
      });
    }
    await sendMenu(chatId);
  } else if (text === '/myid') {
    await call('sendMessage', {
      chat_id: chatId,
      text: `Sizning chat ID'ingiz: \`${chatId}\`\n\nBuyurtma bildirishnomalarini shu chatga olish uchun ushbu ID'ni bot/config.json faylidagi "adminChatId" maydoniga qo'ying.`,
      parse_mode: 'Markdown'
    });
  } else if (text === '/buyurtmalarim') {
    await handleMyOrders(chatId);
  } else if (text === '/help') {
    await call('sendMessage', {
      chat_id: chatId,
      text: "/start — menyuni ochish\n/menu — menyuni qayta ko'rsatish\n/buyurtmalarim — buyurtmalar tarixi\n/myid — chat ID'ingizni olish"
    });
  } else {
    await sendMenu(chatId);
  }
}

let offset = 0;
async function poll() {
  try {
    const res = await call('getUpdates', { offset, timeout: 25 });
    if (res.ok) {
      for (const update of res.result) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    }
  } catch (e) {
    console.error('Poll xatosi:', e.message);
  }
  setTimeout(poll, 400);
}

console.log('Fast Food House bot ishga tushdi. To\'xtatish uchun Ctrl+C.');
console.log('Sayt manzili:', SITE_URL);
startApiServer(API_PORT, notifyStatusChange);
poll();
