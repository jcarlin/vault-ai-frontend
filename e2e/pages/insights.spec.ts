import { test, expect } from '../fixtures/base.fixture';

test.describe('Insights Page', () => {
  test('loads without console errors', async ({ page, consoleCapture }) => {
    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    const errors = consoleCapture.exceptions;
    expect(errors).toHaveLength(0);
  });

  test('heading "Insights" is visible', async ({ page }) => {
    await page.goto('/insights');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.getByRole('heading', { name: 'Insights' });
    await expect(heading).toBeVisible();
  });

  test('metric cards render', async ({ page }) => {
    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    // The InsightsPage renders 4 top-level metric cards.
    // Check for at least one known metric card title.
    const totalRequests = page.getByText('Total Requests');
    const totalTokens = page.getByText('Total Tokens');
    const avgResponseTime = page.getByText('Avg Response Time');

    // At least the metric card labels should render even if values are missing
    await expect(totalRequests.first()).toBeVisible();
    await expect(totalTokens.first()).toBeVisible();
    await expect(avgResponseTime.first()).toBeVisible();
  });

  test('chart section renders SVG elements', async ({ page }) => {
    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    // Recharts renders SVG elements for charts. Wait for at least one SVG to appear.
    const svgElements = page.locator('svg');
    await expect(svgElements.first()).toBeVisible();
  });

  test('connection status indicator is present', async ({ page }) => {
    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    // ConnectionDot renders "Live", "Reconnecting", "Connecting", or "Offline".
    // Since WS is mocked/blocked, expect "Offline" or "Connecting".
    const statusText = page.getByText(/Live|Reconnecting|Connecting|Offline/);
    await expect(statusText.first()).toBeVisible();
  });

  test('page handles API errors gracefully', async ({ page, mockApi, consoleCapture }) => {
    // Override the insights endpoint to return 500
    mockApi.setOverride('GET /vault/insights', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' }),
      });
    });

    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    // Page should not crash (no unhandled exceptions)
    const exceptions = consoleCapture.exceptions;
    expect(exceptions).toHaveLength(0);
  });
});
