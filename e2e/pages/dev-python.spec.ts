import { test, expect } from '../fixtures/base.fixture';

test.describe('Dev Python Page', () => {
  test('redirects to /chat when devmode is disabled', async ({ page, mockApi }) => {
    // Default mock has devmode disabled
    await page.goto('/dev/python');
    await expect(page).toHaveURL(/\/chat/, { timeout: 5000 });
  });

  test('page loads when devmode is enabled', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/python');
    await page.waitForLoadState('networkidle');

    // PythonConsolePage renders heading "Python Console"
    await expect(page.getByRole('heading', { name: 'Python Console' })).toBeVisible({ timeout: 5000 });
  });

  test('Python REPL has Start Python button', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/python');
    await page.waitForLoadState('networkidle');

    // When no session is active, "Start Python" button is visible
    await expect(
      page.getByRole('button', { name: /Start Python/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('no uncaught exceptions', async ({ page, mockApi, consoleCapture }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/python');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
