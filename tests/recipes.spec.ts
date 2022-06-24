import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Vite App/);

  // Expect an attribute "to be strictly equal" to the value.
  await expect(page.locator('text=Admin').first()).toHaveAttribute('href', '/admin');

  await page.click('text=Admin');
  // Expect some text to be visible on the page.
  await expect(page.locator('text=Sign in').first()).toBeVisible();
});