const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (!path.extname(reqPath) && fs.existsSync(path.join(ROOT, reqPath + '.html'))) {
    reqPath = reqPath + '.html';
  }

  const filePath = path.join(ROOT, reqPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

const preferredPort = 8085;

server.listen(preferredPort, '127.0.0.1', () => {
  const addr = server.address();
  console.log('===========================================');
  console.log('AJI SUGOI SERVER RUNNING ON FREE PORT:');
  console.log(`URL: http://localhost:${addr.port}/`);
  console.log('============================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    server.listen(0, '127.0.0.1');
  } else {
    console.error('Server error:', err);
  }
});
