/* Tiny local HTTP API for the admin panel to read/update orders.
   No external dependencies — uses Node's built-in http module.
   Intended for local use only (admin panel running on the same PC). */

const http = require('http');
const store = require('./orders-store');

function corsHeaders(req) {
  return {
    'Content-Type': 'application/json',
    // Reflect the actual request origin (rather than "*") — Chrome's Private
    // Network Access check requires a concrete origin, a wildcard is not enough.
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // Lets a public HTTPS page (GitHub Pages) call this local server.
    // Safe here since the server only runs on localhost.
    'Access-Control-Allow-Private-Network': 'true'
  };
}

function send(req, res, status, body) {
  res.writeHead(status, corsHeaders(req));
  res.end(JSON.stringify(body));
}

function startApiServer(port, onStatusChange) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    if (req.method === 'OPTIONS') {
      return send(req, res, 204, {});
    }

    if (req.method === 'GET' && url.pathname === '/api/orders') {
      return send(req, res, 200, store.loadAll());
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
            return send(req, res, 400, { error: "Noto'g'ri status" });
          }
          const updated = store.updateStatus(Number(patchMatch[1]), status);
          if (!updated) return send(req, res, 404, { error: 'Buyurtma topilmadi' });
          if (onStatusChange) await onStatusChange(updated);
          return send(req, res, 200, updated);
        } catch (e) {
          return send(req, res, 500, { error: e.message });
        }
      });
      return;
    }

    send(req, res, 404, { error: 'Not found' });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} band. Buyurtmalar API ishga tushmadi (boshqa bot nusxasi ishlamayaptimi, tekshiring).`);
    } else {
      console.error('Buyurtmalar API xatosi:', err.message);
    }
  });

  server.listen(port, () => {
    console.log(`Admin buyurtmalar API: http://localhost:${port}/api/orders`);
  });

  return server;
}

module.exports = { startApiServer };
