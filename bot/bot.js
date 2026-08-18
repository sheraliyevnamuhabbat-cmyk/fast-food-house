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

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}

function buildOrderSummary(order, from) {
  const lines = order.items.map(it => `• ${it.name} × ${it.qty} — ${formatPrice(it.price * it.qty)}`);
  const who = from ? `\n👤 ${[from.first_name, from.last_name].filter(Boolean).join(' ')}${from.username ? ' (@' + from.username + ')' : ''}` : '';
  return `${lines.join('\n')}\n\n💰 Jami: *${formatPrice(order.total)}*${who}`;
}

async function handleOrder(msg) {
  const chatId = msg.chat.id;
  let order;
  try {
    order = JSON.parse(msg.web_app_data.data);
  } catch (e) {
    await call('sendMessage', { chat_id: chatId, text: "Buyurtmani o'qishda xatolik yuz berdi." });
    return;
  }
  if (!order.items || !order.items.length) return;

  await call('sendMessage', {
    chat_id: chatId,
    text: `✅ *Buyurtmangiz qabul qilindi!*\n\n${buildOrderSummary(order)}\n\nTez orada siz bilan bog'lanamiz. Rahmat! 🙏`,
    parse_mode: 'Markdown'
  });

  if (config.adminChatId) {
    await call('sendMessage', {
      chat_id: config.adminChatId,
      text: `🆕 *Yangi buyurtma!*\n\n${buildOrderSummary(order, msg.from)}`,
      parse_mode: 'Markdown'
    });
  }
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
  } else if (text === '/help') {
    await call('sendMessage', {
      chat_id: chatId,
      text: "/start — menyuni ochish\n/menu — menyuni qayta ko'rsatish\n/myid — chat ID'ingizni olish"
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
