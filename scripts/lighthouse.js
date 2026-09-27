// Add a *performance* budget to the Lighthouse script.
// We'll run Lighthouse with the "performance" category and
// then check if the score is >= 90.0.  If not we exit with
// a non‑zero code so the CI fails.

async function run(url, outDir) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const options = {
    output: 'html',
    logLevel: 'info',
    onlyCategories: ['accessibility', 'performance'], // add performance
    emulatedFormFactor: 'mobile',
  };
  const result = await lighthouse(url, { ...options, port: chrome.port });
  const reportPath = path.join(outDir, `lighthouse-${new Date().toISOString().replace(/[:.]/g, '-')}.html`);
  await fs.promises.writeFile(reportPath, result.report, 'utf-8');
  console.log(`✅ Lighthouse report written to ${reportPath}`);

  // Performance budget – 90+ required
  const perfScore = result.categories.performance.score * 100;
  if (perfScore < 90) {
    console.error(`❌ Performance score ${perfScore}% is below the 90% target.`);
    process.exit(1);
  }
  console.log(`✅ Performance score ${perfScore}% meets the 90% target.`);

  await chrome.kill();
}
