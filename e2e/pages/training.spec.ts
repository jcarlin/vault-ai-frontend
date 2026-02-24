import { test, expect } from '../fixtures/base.fixture';

test.describe('Training Page', () => {
  test('loads without console errors', async ({ page, mockApi, consoleCapture }) => {
    await page.goto('/training');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });

  test('"Jobs" tab is active by default', async ({ page, mockApi }) => {
    await page.goto('/training');
    await page.waitForLoadState('networkidle');

    const jobsTab = page.getByRole('button', { name: 'Jobs' });
    await expect(jobsTab).toBeVisible();
    await expect(jobsTab).toHaveClass(/border-blue-500/);
  });

  test('"Adapters" tab click switches content', async ({ page, mockApi }) => {
    await page.goto('/training');
    await page.waitForLoadState('networkidle');

    const adaptersTab = page.getByRole('button', { name: 'Adapters' });
    await adaptersTab.click();
    await page.waitForTimeout(300);

    // Adapters tab should now be active
    await expect(adaptersTab).toHaveClass(/border-blue-500/);

    // Jobs tab should no longer be active
    const jobsTab = page.getByRole('button', { name: 'Jobs' });
    await expect(jobsTab).toHaveClass(/border-transparent/);
  });

  test('empty state renders when no training jobs exist', async ({ page, mockApi }) => {
    await page.goto('/training');
    await page.waitForLoadState('networkidle');

    // Mock returns empty array — should show empty state message
    await expect(page.getByText('No training jobs yet')).toBeVisible({ timeout: 5000 });
  });

  test('tab switcher works correctly — can switch back and forth', async ({ page, mockApi, consoleCapture }) => {
    await page.goto('/training');
    await page.waitForLoadState('networkidle');

    const jobsTab = page.getByRole('button', { name: 'Jobs' });
    const adaptersTab = page.getByRole('button', { name: 'Adapters' });

    // Start on Jobs
    await expect(jobsTab).toHaveClass(/border-blue-500/);

    // Switch to Adapters
    await adaptersTab.click();
    await page.waitForTimeout(300);
    await expect(adaptersTab).toHaveClass(/border-blue-500/);

    // Switch back to Jobs
    await jobsTab.click();
    await page.waitForTimeout(300);
    await expect(jobsTab).toHaveClass(/border-blue-500/);
    await expect(adaptersTab).toHaveClass(/border-transparent/);

    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
