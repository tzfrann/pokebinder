const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const publicFiles = [
  'index.html',
  'styles.css',
  'install.css',
  'auth.css',
  'catalog.css',
  'collection-library.css',
  'quantity.css',
  'hero-showcase.css',
  'friends.css',
  'app.js',
  'supabase-client.js',
  'manifest.webmanifest',
  'icon.svg',
  'service-worker.js',
  'supabase/config.js'
];

fs.rmSync(output, { recursive: true, force: true });
for (const relativeFile of publicFiles) {
  const source = path.join(root, relativeFile);
  const destination = path.join(output, relativeFile);
  if (!fs.existsSync(source)) throw new Error(`Falta el archivo público: ${relativeFile}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log(`PokéBinder preparado en dist (${publicFiles.length} archivos públicos).`);
