/* Tiny local HTTP API for the admin panel to read/update orders.
   No external dependencies — uses Node's built-in http module.
   Intended for local use only (admin panel running on the same PC). */

const http = require('http');
const store = require('./orders-store');

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(body));
}

function startApiServer(port, onStatusChange) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    if (req.method === 'OPTIONS') {
      return send(res, 204, {});
    }

    if (req.method === 'GET' && url.pathname === '/api/orders') {
      return send(res, 200, store.loadAll());
    }

    const patchMatch = url.pathname.match(/^\/api\/orders\/(\d+)$/);
    if (req.method === 'PATCH' && patchMatch) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { status } = JSON.parse(body || '{}');
          const validStatuses = ['yangi', 'tayyorlanmoqda', 'tayyor', 'yetkazildi'];
          if (!validStatuses.includes(status)) {
            return send(res, 400, { error: "Noto'g'ri status" });
          }
          const updated = store.updateStatus(Number(patchMatch[1]), status);
          if (!updated) return send(res, 404, { error: 'Buyurtma topilmadi' });
          if (onStatusChange) await onStatusChange(updated);
          return send(res, 200, updated);
        } catch (e) {
          return send(res, 500, { error: e.message });
        }
      });
      return;
    }

    send(res, 404, { error: 'Not found' });
  });

  server.listen(port, () => {
    console.log(`Admin buyurtmalar API: http://localhost:${port}/api/orders`);
  });

  return server;
}

module.exports = { startApiServer };
