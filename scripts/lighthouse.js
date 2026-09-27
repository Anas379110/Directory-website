// sites/directory/scripts/lighthouse.js
/* eslint-disable no-console */
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const path = require('path');

async function run(url, outDir) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const options = {
    output: 'html',
    logLevel: 'info',
    onlyCategories: ['accessibility'],
    emulatedFormFactor: 'mobile',
  };
  const result = await lighthouse(url, { ...options, port: chrome.port });
  const reportPath = path.join(outDir, `lighthouse-${new Date().toISOString().replace(/[:.]/g, '-')}.html`);
  await fs.promises.writeFile(reportPath, result.report, 'utf-8');
  console.log(`✅ Lighthouse report written to ${reportPath}`);
  await chrome.kill();
}

const target = process.argv[2];
if (!target) {
  console.error('Usage: node lighthouse.js <page>');
  process.exit(1);
}
const base = 'http://localhost:3000';
run(`${base}/${target}`, path.join(__dirname, '..', 'reports')).catch(err => {
  console.error(err);
  process.exit(1);
});
