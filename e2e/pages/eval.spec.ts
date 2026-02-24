import { test, expect } from '../fixtures/base.fixture';

test.describe('Eval Page', () => {
  test('loads without console errors', async ({ page, mockApi, consoleCapture }) => {
    await page.goto('/eval');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });

  test('"Jobs" tab is active by default', async ({ page, mockApi }) => {
    await page.goto('/eval');
    await page.waitForLoadState('networkidle');

    // Jobs tab button should have the active blue border
    const jobsTab = page.getByRole('button', { name: 'Jobs' });
    await expect(jobsTab).toBeVisible();
    await expect(jobsTab).toHaveClass(/border-blue-500/);
  });

  test('"Compare" tab click switches content', async ({ page, mockApi }) => {
    await page.goto('/eval');
    await page.waitForLoadState('networkidle');

    const compareTab = page.getByRole('button', { name: 'Compare' });
    await compareTab.click();
    await page.waitForTimeout(300);

    // Compare tab should now be active
    await expect(compareTab).toHaveClass(/border-blue-500/);

    // Jobs tab should no longer be active
    const jobsTab = page.getByRole('button', { name: 'Jobs' });
    await expect(jobsTab).toHaveClass(/border-transparent/);
  });

  test('"Quick Eval" tab click switches content', async ({ page, mockApi }) => {
    await page.goto('/eval');
    await page.waitForLoadState('networkidle');

    const quickEvalTab = page.getByRole('button', { name: 'Quick Eval' });
    await quickEvalTab.click();
    await page.waitForTimeout(300);

    // Quick Eval tab should now be active
    await expect(quickEvalTab).toHaveClass(/border-blue-500/);
  });

  test('empty state renders when no eval jobs exist', async ({ page, mockApi }) => {
    await page.goto('/eval');
    await page.waitForLoadState('networkidle');

    // Mock returns empty array — should show "No eval jobs"
    await expect(page.getByText('No eval jobs')).toBeVisible({ timeout: 5000 });
  });

  test('tab active indicator uses blue border', async ({ page, mockApi }) => {
    await page.goto('/eval');
    await page.waitForLoadState('networkidle');

    // The active tab (Jobs) should have border-blue-500
    const jobsTab = page.getByRole('button', { name: 'Jobs' });
    await expect(jobsTab).toHaveClass(/border-blue-500/);

    // Switch to Compare and verify blue border moves
    const compareTab = page.getByRole('button', { name: 'Compare' });
    await compareTab.click();
    await page.waitForTimeout(300);

    await expect(compareTab).toHaveClass(/border-blue-500/);
    await expect(jobsTab).not.toHaveClass(/border-blue-500/);
  });
});
