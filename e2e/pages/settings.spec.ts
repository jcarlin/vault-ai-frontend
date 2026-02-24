import { test, expect } from '../fixtures/base.fixture';

test.describe('Settings Page', () => {
  test('loads without console errors', async ({ page, mockApi, consoleCapture }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    expect(consoleCapture.exceptions).toHaveLength(0);
  });

  test('settings sidebar is visible with category buttons', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Scope to the sidebar <nav> to avoid matching content area text
    const nav = page.locator('nav');
    await expect(nav.getByText('Network')).toBeVisible();
    await expect(nav.getByText('Users & Permissions')).toBeVisible();
    await expect(nav.getByText('Data Controls')).toBeVisible();
    await expect(nav.getByText('System')).toBeVisible();
    await expect(nav.getByText('Model Defaults')).toBeVisible();
    await expect(nav.getByText('Security')).toBeVisible();
    await expect(nav.getByText('Quarantine')).toBeVisible();
    await expect(nav.getByText('Training')).toBeVisible();
  });

  test('"Back to Chat" button is visible in sidebar header', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const backButton = page.getByRole('button', { name: /Back to Chat/i });
    await expect(backButton).toBeVisible();
  });

  test('Network category is default — network heading visible', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // NetworkSettings component renders an h2 with "Network" inside <main>
    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: 'Network', exact: true })).toBeVisible();
  });

  test('click Users category — user list renders', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Click the sidebar button scoped to <nav>
    await page.locator('nav').getByText('Users & Permissions').click();
    await page.waitForTimeout(500);

    // Mock returns a user with email "admin@vault.local" — check the user row rendered
    await expect(page.getByText('admin@vault.local')).toBeVisible({ timeout: 5000 });
  });

  test('click Data Controls category — data settings visible', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.locator('nav').getByText('Data Controls').click();
    await page.waitForTimeout(500);

    // DataSettings contains export/backup/archive actions
    await expect(
      page.getByText(/Export|Backup|Archive/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('click Model Defaults category — model settings form visible', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.locator('nav').getByText('Model Defaults').click();
    await page.waitForTimeout(500);

    // ModelSettings has temperature and max tokens controls
    await expect(
      page.getByText(/Temperature/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('click Security category — TLS info visible', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.locator('nav').getByText('Security').click();
    await page.waitForTimeout(500);

    // SecuritySettings shows TLS certificate information
    await expect(
      page.getByText(/TLS|Certificate/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('click Quarantine category — quarantine settings visible', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.locator('nav').getByText('Quarantine').click();
    await page.waitForTimeout(500);

    // QuarantineSettings renders scanning configuration — check in main content
    const main = page.locator('main');
    await expect(
      main.getByText(/Quarantine|Scan|File/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('click Training category — training settings visible', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.locator('nav').getByText('Training').click();
    await page.waitForTimeout(500);

    // TrainingSettings renders GPU/fine-tuning related content — check in main content
    const main = page.locator('main');
    await expect(
      main.getByText(/Training|GPU|Fine/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Advanced category is hidden when developer mode is off', async ({ page, mockApi }) => {
    // By default, dev mode is disabled — Advanced requires requiresAdvanced
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // "Advanced" should NOT be in the sidebar (requiresAdvanced=true, developerMode=false)
    await expect(page.locator('nav').getByText('Advanced')).not.toBeVisible();
  });

  test('Network settings has a Save button', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // NetworkSettings renders a "Save Changes" button
    await expect(
      page.getByRole('button', { name: /Save/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('System category renders system settings', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Click the System category — scoped to sidebar nav
    await page.locator('nav').getByText('System').click();
    await page.waitForTimeout(500);

    // SystemSettings should render system preferences content in main area
    const main = page.locator('main');
    await expect(
      main.getByText(/System|Timezone|Log Level/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('clicking categories updates active state styling', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');

    // Network is active by default — its button should have the active class (bg-zinc-800)
    const networkButton = nav.locator('button').filter({ hasText: 'Network' });
    await expect(networkButton).toHaveClass(/bg-zinc-800/);

    // Click Users & Permissions in the sidebar nav
    await nav.getByText('Users & Permissions').click();
    await page.waitForTimeout(300);

    // Users button should now be active
    const usersButton = nav.locator('button').filter({ hasText: 'Users & Permissions' });
    await expect(usersButton).toHaveClass(/bg-zinc-800/);
  });

  test('no uncaught exceptions after switching multiple categories', async ({ page, mockApi, consoleCapture }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');

    // Switch through several categories using sidebar-scoped selectors
    await nav.getByText('Users & Permissions').click();
    await page.waitForTimeout(300);
    await nav.getByText('Model Defaults').click();
    await page.waitForTimeout(300);
    await nav.getByText('Security').click();
    await page.waitForTimeout(300);
    await nav.getByText('Quarantine').click();
    await page.waitForTimeout(300);

    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
