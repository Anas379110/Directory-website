// sites/directory/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* enable reporters */
  reporter: [['list'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    // Browser launch options can be adjusted if needed
  },
});
