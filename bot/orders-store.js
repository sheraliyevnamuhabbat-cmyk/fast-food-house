/* Simple JSON-file order store. No database needed for this scale. */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'orders.json');

function loadAll() {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (e) {
    console.error('orders.json o\'qishda xatolik:', e.message);
    return [];
  }
}

function saveAll(orders) {
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2));
}

function addOrder(order) {
  const orders = loadAll();
  const record = {
    id: Date.now(),
    status: 'yangi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...order
  };
  orders.unshift(record);
  saveAll(orders);
  return record;
}

function updateStatus(id, status) {
  const orders = loadAll();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  saveAll(orders);
  return orders[idx];
}

function getByChat(chatId) {
  return loadAll().filter(o => o.chatId === chatId);
}

module.exports = { loadAll, saveAll, addOrder, updateStatus, getByChat };
