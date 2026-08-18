/* Fast Food House — Telegram bot.
   Sends a button that opens the site as a Telegram Mini App (WebApp).
   Run with: node bot.js  (Node 18+ required for global fetch) */

const fs = require('fs');
const path = require('path');

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

const API = `https://api.telegram.org/bot${TOKEN}`;

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

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.chat) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (text === '/start' || text === '/menu') {
    // Persistent blue "Menu" button next to the message box, opens the site directly.
    if (msg.chat.type === 'private') {
      await call('setChatMenuButton', {
        chat_id: chatId,
        menu_button: { type: 'web_app', text: 'Menyu', web_app: { url: SITE_URL } }
      });
    }
    await sendMenu(chatId);
  } else if (text === '/help') {
    await call('sendMessage', {
      chat_id: chatId,
      text: "/start — menyuni ochish\n/menu — menyuni qayta ko'rsatish"
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
poll();
