import { test as unauthTest, expect as unauthExpect } from '@playwright/test';
import { test, expect } from './fixtures/base.fixture';
import { MockApiHelper } from './fixtures/api-mocks';

// ---------------------------------------------------------------------------
// Unauthenticated tests — no storageState, raw Playwright test
// The proxy middleware (src/proxy.ts) redirects all non-public routes to
// /auth when the vault_access_key cookie is missing. Users see the proxy
// auth page (src/app/auth/page.tsx), NOT the dashboard ApiKeyEntry.
// ---------------------------------------------------------------------------
unauthTest.describe('Auth guard (unauthenticated)', () => {
  unauthTest.use({ storageState: { cookies: [], origins: [] } });

  unauthTest.beforeEach(async ({ page }) => {
    // Install mocks so pages don't hit a real backend
    const mock = new MockApiHelper(page);
    await mock.install();
  });

  unauthTest('visiting /chat redirects to proxy auth page', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Proxy auth page — heading and subtitle
    await unauthExpect(page.getByRole('heading', { name: 'Vault AI Systems' })).toBeVisible({ timeout: 10_000 });
    await unauthExpect(page.getByText('Enter your access key to continue')).toBeVisible();
  });

  unauthTest('visiting /insights redirects to proxy auth page', async ({ page }) => {
    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    await unauthExpect(page.getByRole('heading', { name: 'Vault AI Systems' })).toBeVisible({ timeout: 10_000 });
    await unauthExpect(page.getByText('Enter your access key to continue')).toBeVisible();
  });

  unauthTest('visiting /models redirects to proxy auth page', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    await unauthExpect(page.getByRole('heading', { name: 'Vault AI Systems' })).toBeVisible({ timeout: 10_000 });
    await unauthExpect(page.getByText('Enter your access key to continue')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Authenticated tests — use base fixture with storageState (includes
// vault_access_key cookie set during auth-setup, so middleware passes).
// ---------------------------------------------------------------------------
test.describe('Auth guard (authenticated)', () => {
  test('API key auth loads dashboard', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Dashboard loaded: sidebar with "New chat" button is visible
    await expect(page.getByRole('button', { name: 'New chat' })).toBeVisible({ timeout: 10_000 });
  });

  test('/chat loads with sidebar visible', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Sidebar shows conversations section
    await expect(page.getByText('Conversations')).toBeVisible({ timeout: 10_000 });
    // Chat input is present
    await expect(page.getByPlaceholder('Message Vault AI Systems...')).toBeVisible();
  });

  test('DevModeGuard redirects /dev/terminal to /chat when devmode disabled', async ({
    page,
    mockApi,
  }) => {
    // Default mock returns devmode enabled: false — no override needed
    await page.goto('/dev/terminal');

    // Should redirect to /chat
    await page.waitForURL('**/chat', { timeout: 15_000 });
    expect(page.url()).toContain('/chat');
  });

  test('DevModeGuard allows /dev/terminal when devmode enabled', async ({
    page,
    mockApi,
  }) => {
    await mockApi.setDevModeEnabled();

    await page.goto('/dev/terminal');
    await page.waitForLoadState('networkidle');

    // Should stay on /dev/terminal (not redirected)
    expect(page.url()).toContain('/dev/terminal');
  });

  test('401 triggers auth error handling', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Verify dashboard loaded first
    await expect(page.getByRole('button', { name: 'New chat' })).toBeVisible({ timeout: 10_000 });

    // Now set auth failure so next conversations fetch returns 401
    mockApi.setAuthFailure();

    // Trigger the auth error event that the layout listens for
    await page.evaluate(() => {
      window.dispatchEvent(new Event('vault:auth-error'));
    });

    // After auth error, should show ApiKeyEntry (clearApiKey called)
    await expect(
      page.getByRole('heading', { name: 'Vault AI Systems' })
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Sign in to get started')).toBeVisible({ timeout: 10_000 });
  });
});
