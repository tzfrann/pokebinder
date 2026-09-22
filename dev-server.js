// Servidor local mínimo para probar PokéBinder en http://localhost:8000.
// No publica nada en Internet y no requiere dependencias.
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

http.createServer((request, response) => {
  const requested = request.url.split('?')[0] === '/' ? '/index.html' : request.url.split('?')[0];
  const file = path.resolve(root, '.' + decodeURIComponent(requested));
  if (!file.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(8000, () => console.log('PokéBinder disponible en http://localhost:8000'));
