import fs from 'fs';
import path from 'path';

const root = process.cwd();
const publicDir = path.join(root, '.output', 'public');
const assetsDir = path.join(publicDir, 'assets');
const basePath = '/auto-ad-generator/';

if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found:', assetsDir);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const stylesFile = files.find((file) => /^styles-.*\.css$/.test(file));
const clientFile = files.find((file) => /^client-.*\.js$/.test(file));

if (!stylesFile || !clientFile) {
  console.error('Required build assets not found.');
  console.error('Found:', files.join(', '));
  process.exit(1);
}

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base href="${basePath}" />
    <link rel="icon" href="${basePath}favicon.ico" />
    <link rel="stylesheet" href="${basePath}assets/${stylesFile}" />
    <title>Auto Ad Generator</title>
    <script>
      window.__TSS_START_OPTIONS__ = { basepath: '${basePath}' };
    </script>
  </head>
  <body>
    <script type="module" src="${basePath}assets/${clientFile}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(publicDir, '404.html'), html, 'utf8');
console.log('Generated index.html and 404.html for gh-pages');
