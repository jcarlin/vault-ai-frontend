import { test, expect } from '../fixtures/base.fixture';

test.describe('Dev Jupyter Page', () => {
  test('redirects to /chat when devmode is disabled', async ({ page, mockApi }) => {
    // Default mock has devmode disabled
    await page.goto('/dev/jupyter');
    await expect(page).toHaveURL(/\/chat/, { timeout: 5000 });
  });

  test('page loads when devmode is enabled', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/jupyter');
    await page.waitForLoadState('networkidle');

    // JupyterPage renders heading "Jupyter Notebooks"
    await expect(page.getByRole('heading', { name: 'Jupyter Notebooks' })).toBeVisible({ timeout: 5000 });
  });

  test('Jupyter page has Launch button and status card', async ({ page, mockApi }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/jupyter');
    await page.waitForLoadState('networkidle');

    // When Jupyter is stopped, the "Launch Jupyter" button is visible
    await expect(
      page.getByRole('button', { name: /Launch Jupyter/i })
    ).toBeVisible({ timeout: 5000 });

    // JupyterLab status card is visible
    await expect(page.getByText('JupyterLab')).toBeVisible();
  });

  test('no uncaught exceptions', async ({ page, mockApi, consoleCapture }) => {
    await mockApi.setDevModeEnabled();
    await page.goto('/dev/jupyter');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
