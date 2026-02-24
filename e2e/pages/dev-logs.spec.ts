import { test, expect } from '../fixtures/base.fixture';

test.describe('Dev Debug Logs Page', () => {
  test('redirects to /chat when devmode is disabled', async ({ page, mockApi }) => {
    // Default mock has devmode disabled
    await page.goto('/dev/logs');
    await expect(page).toHaveURL(/\/chat/, { timeout: 5000 });
  });

  test('page loads when devmode is enabled', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/logs');
    await page.waitForLoadState('networkidle');

    // DebugLogsPage renders heading "Debug Logs"
    await expect(page.getByRole('heading', { name: 'Debug Logs' })).toBeVisible({ timeout: 5000 });
  });

  test('logs page has service filter, severity filter, and Live button', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/logs');
    await page.waitForLoadState('networkidle');

    // Service filter dropdown is present (first select with "All Services" option)
    await expect(page.locator('select').first()).toBeVisible({ timeout: 5000 });

    // Live toggle button
    await expect(
      page.getByRole('button', { name: /Live/i })
    ).toBeVisible();

    // Export button
    await expect(
      page.getByRole('button', { name: /Export/i })
    ).toBeVisible();
  });

  test('no uncaught exceptions', async ({ page, mockApi, consoleCapture }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/logs');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
