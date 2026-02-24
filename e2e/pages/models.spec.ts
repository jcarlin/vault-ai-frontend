import { test, expect } from '../fixtures/base.fixture';

test.describe('Models Page', () => {
  test('loads without console errors', async ({ page, consoleCapture }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    const errors = consoleCapture.exceptions;
    expect(errors).toHaveLength(0);
  });

  test('heading "Models" is visible', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.getByRole('heading', { name: 'Models' });
    await expect(heading).toBeVisible();
  });

  test('Import Model button is visible', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('domcontentloaded');

    // Button has "+" Plus icon and "Import Model" text
    const importButton = page.getByRole('button', { name: /Import Model/i });
    await expect(importButton).toBeVisible();
  });

  test('model card renders with model name', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    // Mock returns one model with displayName "Qwen 2.5 32B AWQ"
    const modelName = page.getByText('Qwen 2.5 32B AWQ');
    await expect(modelName).toBeVisible();
  });

  test('model status "loaded" indicator is visible', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    // ModelCard shows a "Loaded" badge when vaultStatus === 'loaded'
    const loadedBadge = page.getByText('Loaded');
    await expect(loadedBadge).toBeVisible();
  });

  test('click on model card opens detail dialog', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    // Click the model card (it's a button)
    const modelCard = page.getByText('Qwen 2.5 32B AWQ');
    await modelCard.click();

    // ModelDetailDialog should open — it uses a Dialog component
    // which renders a dialog/modal with the model name in the title
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('Import Model button click opens AddModelModal', async ({ page }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    const importButton = page.getByRole('button', { name: /Import Model/i });
    await importButton.click();

    // AddModelModal uses Dialog component
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('empty state when no models', async ({ page, mockApi }) => {
    // Override models endpoints to return empty lists
    mockApi.setEmptyModels();

    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    // ModelList renders "No models available" when models array is empty
    const emptyText = page.getByText('No models available');
    await expect(emptyText).toBeVisible();
  });
});
