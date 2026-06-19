const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ehao123';

const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ADMIN_HTML = path.join(__dirname, 'admin', 'index.html');
const LETTERS_FILE = path.join(DATA_DIR, 'letters.json');
const WORDS_FILE = path.join(DATA_DIR, 'warm-words.json');

let adminTokens = [];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}
function writeJSON(fp, data) {
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function checkAuth(req) {
  const a = req.headers['authorization'] || '';
  if (!a.startsWith('Bearer ')) return false;
  return adminTokens.includes(a.slice(7));
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}

async function handle(req, res) {
  const parsed = new URL(req.url, 'http://localhost');
  const p = parsed.pathname;
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (p === '/api/auth' && method === 'POST') {
    const body = await parseBody(req);
    if (body.password === ADMIN_PASSWORD) {
      const token = crypto.randomBytes(32).toString('hex');
      adminTokens.push(token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '密码错误' }));
    }
    return;
  }

  if (p === '/api/letters' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ letters: readJSON(LETTERS_FILE) }));
    return;
  }

  if (p === '/api/letters' && method === 'POST') {
    if (!checkAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }
    const body = await parseBody(req);
    if (!body.title || !body.content) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'empty fields' }));
      return;
    }
    const letters = readJSON(LETTERS_FILE);
    const letter = { id: Date.now(), title: body.title, content: body.content, date: new Date().toISOString().slice(0, 10), read: false };
    letters.push(letter);
    writeJSON(LETTERS_FILE, letters);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ letter }));
    return;
  }

  const deleteMatch = p.match(/^\/api\/letters\/(\d+)$/);
  if (deleteMatch && method === 'DELETE') {
    if (!checkAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }
    let letters = readJSON(LETTERS_FILE);
    letters = letters.filter(l => l.id !== parseInt(deleteMatch[1]));
    writeJSON(LETTERS_FILE, letters);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  const readMatch = p.match(/^\/api\/letters\/(\d+)\/read$/);
  if (readMatch && method === 'POST') {
    const letters = readJSON(LETTERS_FILE);
    const l = letters.find(x => x.id === parseInt(readMatch[1]));
    if (l) { l.read = true; writeJSON(LETTERS_FILE, letters); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (p === '/api/warm-words' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ words: readJSON(WORDS_FILE) }));
    return;
  }

  if (p === "/api/verify-site-password" && method === "POST") {
    const body = await parseBody(req);
    const ok = body.password === SITE_PASSWORD;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok }));
    return;
  }

  if (p === '/admin') {
    serveStatic(res, ADMIN_HTML);
    return;
  }

  let filePath = p === '/' ? '/index.html' : p;
  serveStatic(res, path.join(PUBLIC_DIR, filePath));
}

const server = http.createServer(handle);
server.listen(PORT, '0.0.0.0', () => {
  console.log('🏝️ 饿饿一号已启动');
  console.log('   💻 本机访问: http://localhost:' + PORT);
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function(ifname) {
    ifaces[ifname].forEach(function(iface) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log('   📱 手机访问: http://' + iface.address + ':' + PORT);
      }
    });
  });
  console.log('   🔐 管理后台: http://localhost:' + PORT + '/admin');
  console.log('   📝 后台密码: ' + ADMIN_PASSWORD);
});

// --- Site password gate ---
const SITE_PASSWORD = process.env.SITE_PASSWORD || "sbmyx";

// In the handle function, add before the static file handling:
/* 在 handle 函数中，在 const MIME 之前添加 */
/* SITE_PASSWORD is already declared above */

/* 在文件末尾的 server.listen 前面加这个 */
