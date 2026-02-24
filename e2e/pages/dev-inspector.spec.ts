import { test, expect } from '../fixtures/base.fixture';

test.describe('Dev Model Inspector Page', () => {
  test('redirects to /chat when devmode is disabled', async ({ page, mockApi }) => {
    // Default mock has devmode disabled
    await page.goto('/dev/inspector');
    await expect(page).toHaveURL(/\/chat/, { timeout: 5000 });
  });

  test('page loads when devmode is enabled', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/inspector');
    await page.waitForLoadState('networkidle');

    // ModelInspectorPage renders heading "Model Inspector"
    await expect(page.getByRole('heading', { name: 'Model Inspector' })).toBeVisible({ timeout: 5000 });
  });

  test('model inspector has model selector and placeholder', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/inspector');
    await page.waitForLoadState('networkidle');

    // The model selector dropdown is visible with default "Select a model..." option
    await expect(page.locator('select')).toBeVisible({ timeout: 5000 });

    // Empty state text is shown when no model is selected
    await expect(
      page.getByText('Select a model to inspect')
    ).toBeVisible({ timeout: 5000 });
  });

  test('no uncaught exceptions', async ({ page, mockApi, consoleCapture }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/inspector');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
