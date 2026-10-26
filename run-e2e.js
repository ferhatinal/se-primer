/**
 * Yerel sunucuyu başlatır, Cypress E2E testlerini ve video kaydını koşar,
 * üretilen 3 mobil ekran görüntüsünü design/screens/ klasörüne kopyalar ve sunucuyu kapatır.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverProc = spawn(process.execPath, ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

setTimeout(() => {
  const isWin = process.platform === 'win32';
  const npxCmd = isWin ? 'npx.cmd' : 'npx';

  const cypressProc = spawn(npxCmd, ['cypress', 'run'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  cypressProc.on('close', (code) => {
    serverProc.kill();

    // Ekran görüntülerini design/screens/ altına kopyala
    const screensDir = path.join(__dirname, 'design', 'screens');
    fs.mkdirSync(screensDir, { recursive: true });

    const screenshotsRoot = path.join(__dirname, 'cypress', 'screenshots', 'se-primer.cy.js');
    if (fs.existsSync(screenshotsRoot)) {
      const files = fs.readdirSync(screenshotsRoot);
      files.forEach((f) => {
        if (f.endsWith('.png')) {
          fs.copyFileSync(path.join(screenshotsRoot, f), path.join(screensDir, f));
        }
      });
      console.log('Mobil ekran görüntüleri design/screens/ klasörüne kopyalandı.');
    }

    process.exit(code);
  });
}, 1500);
