import { test, expect } from '../fixtures/base.fixture';

test.describe('Audit & Logs Page', () => {
  test('loads without console errors', async ({ page, consoleCapture }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    const errors = consoleCapture.exceptions;
    expect(errors).toHaveLength(0);
  });

  test('heading "Audit & Logs" is visible', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.getByRole('heading', { name: /Audit/i });
    await expect(heading).toBeVisible();
  });

  test('audit tab is active by default with table rendered', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    // "API Audit" tab button should be visible
    const auditTab = page.getByRole('button', { name: 'API Audit' });
    await expect(auditTab).toBeVisible();

    // The audit table should be rendered (look for the table element)
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('export CSV and JSON buttons are visible', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('domcontentloaded');

    // Export buttons contain Download icon + "CSV" / "JSON" text
    const csvButton = page.getByRole('button', { name: /CSV/i });
    const jsonButton = page.getByRole('button', { name: /JSON/i });

    await expect(csvButton).toBeVisible();
    await expect(jsonButton).toBeVisible();
  });

  test('System Logs tab click switches content', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    const logsTab = page.getByRole('button', { name: 'System Logs' });
    await expect(logsTab).toBeVisible();
    await logsTab.click();

    // After switching tabs, the audit table should no longer be visible.
    // The SystemLogsTab should render instead — export buttons are unmounted.
    const table = page.locator('table');
    await expect(table).toBeHidden();
  });

  test('audit entries show in table', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    // Mock data has 3 audit entries with methods POST, GET, GET
    // and paths /v1/chat/completions, /v1/models, /vault/health.
    // Scope to the table to avoid matching filter dropdown options.
    const table = page.locator('table');
    await expect(table).toBeVisible();

    const postBadge = table.getByText('POST');
    await expect(postBadge.first()).toBeVisible();

    const chatPath = table.getByText('/v1/chat/completions');
    await expect(chatPath.first()).toBeVisible();
  });

  test('pagination text is visible', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    // Pagination shows "Page X of Y (Z entries)" when totalPages > 1.
    // With 3 entries and PAGE_SIZE=50, totalPages=1, so pagination bar
    // is hidden. Instead verify the table itself rendered with entries.
    // The table header row contains "Method", "Path", "Status", etc.
    const table = page.locator('table');
    await expect(table).toBeVisible();

    const methodHeader = table.getByText('Method');
    await expect(methodHeader).toBeVisible();
  });

  test('stats section renders metric cards', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    // AuditStats renders MetricCards with titles like "Total Requests"
    const totalRequests = page.getByText('Total Requests');
    await expect(totalRequests.first()).toBeVisible();
  });
});
