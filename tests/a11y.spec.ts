// sites/directory/tests/a11y.spec.ts
import { test, expect } from '@playwright/test';
import axios from 'axios';

// Use Axe-core with Playwright
import { AxeResults } from 'axe-core';
import { injectAxe, getViolations } from 'axe-playwright';

const baseURL = 'http://localhost:3000'; // Update if dev server runs on another port

// Helper to run axe against a page
async function runAxe(page: any): Promise<AxeResults> {
  await injectAxe(page);
  const results = await getViolations(page);
  return results;
}

test.describe('Accessibility', () => {
  test('Home page should be accessible', async ({ page }) => {
    await page.goto(`${baseURL}`);
    const result = await runAxe(page);
    expect(result.violations).toHaveLength(0);
  });

  test('Business page should be accessible', async ({ page, params }) => {
    // For demo we pick a business ID. In real usage you'd loop test data.
    const businessId = 'test-id';
    await page.goto(`${baseURL}/business/${businessId}`);
    const result = await runAxe(page);
    expect(result.violations).toHaveLength(0);
  });
});
