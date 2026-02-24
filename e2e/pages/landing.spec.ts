import { test, expect } from '../fixtures/base.fixture';

test.describe('Landing Page', () => {
  test('loads without console errors', async ({ page, consoleCapture }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const errors = consoleCapture.exceptions;
    expect(errors).toHaveLength(0);
  });

  test('logo is visible with correct alt text', async ({ page, mockApi }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const logo = page.getByRole('img', { name: 'Vault AI' });
    await expect(logo).toBeVisible({ timeout: 10_000 });
  });

  test('tagline text is visible', async ({ page, mockApi }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Self-hosted AI inference platform')).toBeVisible({ timeout: 10_000 });
  });

  test('"Open Chat" button is visible and links to /chat', async ({ page, mockApi }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const openChatLink = page.getByRole('link', { name: 'Open Chat' });
    await expect(openChatLink).toBeVisible({ timeout: 10_000 });
    await expect(openChatLink).toHaveAttribute('href', '/chat');
  });

  test('Grafana and Cockpit admin links are present', async ({ page, mockApi }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Administration section label
    await expect(page.getByText('Administration')).toBeVisible({ timeout: 10_000 });

    // Grafana link (external, port 3000)
    const grafanaLink = page.getByRole('link', { name: /Grafana/i });
    await expect(grafanaLink).toBeVisible();
    await expect(grafanaLink).toHaveAttribute('target', '_blank');
    await expect(grafanaLink).toHaveAttribute('href', /:\d*3000/);

    // Cockpit link (external, port 9090)
    const cockpitLink = page.getByRole('link', { name: /Cockpit/i });
    await expect(cockpitLink).toBeVisible();
    await expect(cockpitLink).toHaveAttribute('target', '_blank');
    await expect(cockpitLink).toHaveAttribute('href', /:\d*9090/);
  });
});
