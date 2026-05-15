import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ViewMarket/);
  });

  test('displays hero section', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('has sign-in link', async ({ page }) => {
    await page.goto('/');
    const signInLink = page.locator('a[href*="sign-in"]').first();
    await expect(signInLink).toBeVisible();
  });
});

test.describe('Sign-in Page', () => {
  test('displays sign-in options', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('button, a')).toHaveCount({ minimum: 1 });
  });
});

test.describe('Health Check', () => {
  test('API health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
});
