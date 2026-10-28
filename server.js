import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const OLLAMA_HOST = process.env.OLLAMA_HOST || '127.0.0.1';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function forwardToOllama(pathname, method, body, clientRes, isStreaming = false) {
  const options = {
    hostname: OLLAMA_HOST,
    port: OLLAMA_PORT,
    path: pathname,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
    },
    timeout: 60000
  };

  const req = http.request(options, (ollamaRes) => {
    clientRes.writeHead(ollamaRes.statusCode || 200, {
      'Content-Type': ollamaRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });

    ollamaRes.pipe(clientRes);
  });

  req.on('error', (err) => {
    console.warn(`[Proxy Warning] Ollama connection error on ${pathname}:`, err.message);
    if (!clientRes.headersSent) {
      clientRes.writeHead(503, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      clientRes.end(JSON.stringify({
        error: 'Ollama is unreachable at http://' + OLLAMA_HOST + ':' + OLLAMA_PORT,
        details: err.message,
        hint: 'Make sure Ollama is running (`ollama serve`). The platform fallback engine will handle this request automatically.'
      }));
    }
  });

  req.on('timeout', () => {
    req.destroy();
    if (!clientRes.headersSent) {
      clientRes.writeHead(504, { 'Content-Type': 'application/json' });
      clientRes.end(JSON.stringify({ error: 'Ollama connection timed out' }));
    }
  });

  if (body) {
    req.write(body);
  }
  req.end();
}

function handleApiRequest(req, res, url) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // 1. Health check & Ollama status
  if (url.pathname === '/api/health' && req.method === 'GET') {
    const testReq = http.request({
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: '/api/tags',
      method: 'GET',
      timeout: 2500
    }, (testRes) => {
      let data = '';
      testRes.on('data', chunk => data += chunk);
      testRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            status: 'online',
            ollamaConnected: true,
            ollamaHost: `http://${OLLAMA_HOST}:${OLLAMA_PORT}`,
            modelsCount: parsed.models ? parsed.models.length : 0,
            models: parsed.models || []
          }));
        } catch {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ status: 'online', ollamaConnected: true, models: [] }));
        }
      });
    });

    testReq.on('error', (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({
        status: 'online',
        ollamaConnected: false,
        error: err.message,
        hint: 'Ollama server not detected on default port 11434. Fallback heuristics active.'
      }));
    });
    testReq.end();
    return;
  }

  // 2. Fetch models from Ollama
  if (url.pathname === '/api/models' && req.method === 'GET') {
    forwardToOllama('/api/tags', 'GET', null, res);
    return;
  }

  // 3. Generate completion / recipe / markdown
  if (url.pathname === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      forwardToOllama('/api/generate', 'POST', body, res);
    });
    return;
  }

  // 4. Chat completion
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      forwardToOllama('/api/chat', 'POST', body, res);
    });
    return;
  }

  // Unknown API route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
}

function serveStaticFile(req, res, url) {
  let safePath = path.normalize(decodeURIComponent(url.pathname));
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security: Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing if requested non-api html
      if (!path.extname(filePath)) {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(indexPath, (indexErr, content) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(content);
          }
        });
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname.startsWith('/api/')) {
    handleApiRequest(req, res, url);
  } else {
    serveStaticFile(req, res, url);
  }
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n========================================================`);
    console.log(`🌿 ResQHarvest: The Zero-Waste Intelligence Engine`);
    console.log(`🚀 Web Platform running at: http://localhost:${port}`);
    console.log(`🤖 Ollama Proxy Target:    http://${OLLAMA_HOST}:${OLLAMA_PORT}`);
    console.log(`========================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server failed to start:', err);
    }
  });
}

startServer(DEFAULT_PORT);
