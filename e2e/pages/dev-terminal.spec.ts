import { test, expect } from '../fixtures/base.fixture';

test.describe('Dev Terminal Page', () => {
  test('redirects to /chat when devmode is disabled', async ({ page, mockApi }) => {
    // Default mock has devmode disabled
    await page.goto('/dev/terminal');
    await expect(page).toHaveURL(/\/chat/, { timeout: 5000 });
  });

  test('page loads when devmode is enabled', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/terminal');
    await page.waitForLoadState('networkidle');

    // TerminalPage renders heading "Terminal"
    await expect(page.getByRole('heading', { name: 'Terminal' })).toBeVisible({ timeout: 5000 });
  });

  test('terminal page has Start Terminal button', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/terminal');
    await page.waitForLoadState('networkidle');

    // When no session is active, "Start Terminal" button is visible
    await expect(
      page.getByRole('button', { name: /Start Terminal/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('no uncaught exceptions', async ({ page, mockApi, consoleCapture }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/terminal');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });

  test('handles missing WebSocket gracefully', async ({ page, mockApi, consoleCapture }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/terminal');
    await page.waitForLoadState('networkidle');

    // Page should render without crashing even though WS is mocked/blocked
    await expect(page.getByRole('heading', { name: 'Terminal' })).toBeVisible();
    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
