import { test, expect } from '../fixtures/base.fixture';

test.describe('Datasets Page', () => {
  test('loads without console errors', async ({ page, consoleCapture }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('networkidle');

    const errors = consoleCapture.exceptions;
    expect(errors).toHaveLength(0);
  });

  test('heading "Datasets" is visible', async ({ page }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.getByRole('heading', { name: 'Datasets' });
    await expect(heading).toBeVisible();
  });

  test('catalog tab is active by default', async ({ page }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('domcontentloaded');

    // The "Catalog" tab button should be visible and styled as active
    // (border-blue-500 class when active)
    const catalogTab = page.getByRole('button', { name: 'Catalog' });
    await expect(catalogTab).toBeVisible();

    // Verify the active tab has the blue underline styling
    await expect(catalogTab).toHaveClass(/border-blue-500/);
  });

  test('dataset list renders with dataset name', async ({ page }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('networkidle');

    // Mock data has one dataset named "Test Dataset"
    const datasetName = page.getByText('Test Dataset');
    await expect(datasetName.first()).toBeVisible();
  });

  test('click Sources tab switches content', async ({ page }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('networkidle');

    const sourcesTab = page.getByRole('button', { name: 'Sources' });
    await expect(sourcesTab).toBeVisible();
    await sourcesTab.click();

    // After clicking, Sources tab should be active (blue underline)
    await expect(sourcesTab).toHaveClass(/border-blue-500/);

    // Catalog tab should no longer have the active styling
    const catalogTab = page.getByRole('button', { name: 'Catalog' });
    await expect(catalogTab).not.toHaveClass(/border-blue-500/);
  });

  test('sources tab shows data sources', async ({ page }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('networkidle');

    // Switch to Sources tab
    const sourcesTab = page.getByRole('button', { name: 'Sources' });
    await sourcesTab.click();

    // Mock data has one source: "Local Storage" of type "local"
    const sourceName = page.getByText('Local Storage');
    await expect(sourceName.first()).toBeVisible();
  });

  test('tab highlighting works correctly', async ({ page }) => {
    await page.goto('/datasets');
    await page.waitForLoadState('domcontentloaded');

    const catalogTab = page.getByRole('button', { name: 'Catalog' });
    const sourcesTab = page.getByRole('button', { name: 'Sources' });

    // Initially Catalog is active
    await expect(catalogTab).toHaveClass(/border-blue-500/);
    await expect(sourcesTab).toHaveClass(/border-transparent/);

    // Click Sources
    await sourcesTab.click();
    await expect(sourcesTab).toHaveClass(/border-blue-500/);
    await expect(catalogTab).toHaveClass(/border-transparent/);

    // Click back to Catalog
    await catalogTab.click();
    await expect(catalogTab).toHaveClass(/border-blue-500/);
    await expect(sourcesTab).toHaveClass(/border-transparent/);
  });
});
