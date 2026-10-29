/**
 * Stitch ekranlarını PNG'ye çevirir ve design/screens/ klasörüne kopyalar.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverProc = spawn(process.execPath, ['server.js'], { cwd: __dirname, stdio: 'inherit' });

setTimeout(() => {
  const cy = spawn(
    'npx cypress run --spec cypress/stitch-capture/stitch-screens.cy.js --config video=false,specPattern=cypress/stitch-capture/**/*.cy.js',
    { cwd: __dirname, stdio: 'inherit', shell: true }
  );

  cy.on('close', (code) => {
    serverProc.kill();
    const src = path.join(__dirname, 'cypress', 'screenshots', 'stitch-screens.cy.js');
    const dst = path.join(__dirname, 'design', 'screens');
    fs.mkdirSync(dst, { recursive: true });
    if (fs.existsSync(src)) {
      fs.readdirSync(src)
        .filter((f) => f.endsWith('.png'))
        .forEach((f) => fs.copyFileSync(path.join(src, f), path.join(dst, f)));
      console.log('Stitch ekranları design/screens/ klasörüne kopyalandı.');
    }
    process.exit(code);
  });
}, 1500);
