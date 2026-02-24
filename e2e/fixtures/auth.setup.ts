import { test as setup } from '@playwright/test';
import { MockApiHelper } from './api-mocks';

const AUTH_FILE = 'e2e/.auth/user.json';
const TEST_API_KEY = 'vault_sk_test1234567890abcdef';

// Must match VAULT_ACCESS_KEY in .env / .env.local
const VAULT_ACCESS_KEY = '5453647cf029030a4640233ed5cab54804688e89598de581ef42f15a2e20c0b3';

/**
 * Auth setup project — runs once before all tests.
 *
 * Two auth layers must be satisfied:
 * 1. Server-side proxy (src/proxy.ts) checks for `vault_access_key` httpOnly
 *    cookie — without it, all non-public routes redirect to /auth.
 * 2. Client-side AuthContext reads `vault_api_key` from localStorage.
 *
 * We POST to /api/auth from the browser context so the Set-Cookie header
 * is applied to the browser. Then we set localStorage for the client-side auth.
 */
setup('authenticate', async ({ page }) => {
  // Install API mocks for /api/p/* routes (backend proxy)
  const mockApi = new MockApiHelper(page);
  await mockApi.install();

  // Navigate to /auth (public route) to establish the origin
  await page.goto('/auth');
  await page.waitForLoadState('domcontentloaded');

  // Authenticate via /api/auth to get the httpOnly cookie.
  // Run inside page.evaluate so the Set-Cookie is applied to the browser context.
  const authOk = await page.evaluate(async (key) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    return res.ok;
  }, VAULT_ACCESS_KEY);

  if (!authOk) {
    throw new Error('Auth setup failed: /api/auth returned non-200. Check VAULT_ACCESS_KEY in .env');
  }

  // Set client-side auth in localStorage (AuthContext reads vault_api_key)
  await page.evaluate((key) => {
    localStorage.setItem('vault_api_key', key);
  }, TEST_API_KEY);

  // Save storage state (cookies + localStorage) for reuse by all test projects
  await page.context().storageState({ path: AUTH_FILE });
});
