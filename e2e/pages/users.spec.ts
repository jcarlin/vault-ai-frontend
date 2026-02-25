import { test, expect } from '../fixtures/base.fixture';

/**
 * Tests for the Add User flow (password fields) and delete confirmation dialog.
 * Settings > Users & Permissions
 */

async function navigateToUsers(page: import('@playwright/test').Page) {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.locator('nav').getByText('Users & Permissions').click();
  // Wait for users list to render
  await expect(page.getByText('admin@vault.local')).toBeVisible({ timeout: 5000 });
}

test.describe('Users & Permissions — Add User', () => {
  test('Add User dialog shows password fields', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    // Password and Confirm Password labels should be visible
    await expect(dialog.getByText('Password', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Confirm Password')).toBeVisible();

    // Password inputs should be present
    await expect(dialog.locator('input[type="password"]').first()).toBeVisible();
    await expect(dialog.locator('input[type="password"]').nth(1)).toBeVisible();
  });

  test('Add User requires password (cannot submit empty form)', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    // Fill name and email but leave password empty
    await dialog.locator('input[type="text"]').fill('Test User');
    await dialog.locator('input[type="email"]').fill('test@vault.local');

    // Try to submit — HTML required attribute should block
    await dialog.getByRole('button', { name: 'Add User' }).click();

    // Dialog should still be open (form was not submitted due to HTML required)
    await expect(dialog.getByText('Add New User')).toBeVisible();
  });

  test('Add User blocks submission when password is too short (browser validation)', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    await dialog.locator('input[type="text"]').fill('Test User');
    await dialog.locator('input[type="email"]').fill('test@vault.local');
    await dialog.locator('input[type="password"]').first().fill('short');
    await dialog.locator('input[type="password"]').nth(1).fill('short');

    await dialog.getByRole('button', { name: 'Add User' }).click();

    // Browser native minLength validation prevents submission — dialog stays open
    await expect(dialog.getByText('Add New User')).toBeVisible();
    // Verify the password field has minLength attribute
    await expect(dialog.locator('input[type="password"]').first()).toHaveAttribute('minlength', '8');
  });

  test('Add User validates passwords match', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    await dialog.locator('input[type="text"]').fill('Test User');
    await dialog.locator('input[type="email"]').fill('test@vault.local');
    await dialog.locator('input[type="password"]').first().fill('password123');
    await dialog.locator('input[type="password"]').nth(1).fill('different123');

    await dialog.getByRole('button', { name: 'Add User' }).click();

    // Should show mismatch error
    await expect(dialog.getByText('Passwords do not match')).toBeVisible();
  });

  test('Add User shows and clears mismatch error on password input change', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    await dialog.locator('input[type="text"]').fill('Test User');
    await dialog.locator('input[type="email"]').fill('test@vault.local');
    await dialog.locator('input[type="password"]').first().fill('password123');
    await dialog.locator('input[type="password"]').nth(1).fill('different123');

    await dialog.getByRole('button', { name: 'Add User' }).click();
    await expect(dialog.getByText('Passwords do not match')).toBeVisible();

    // Fix the confirm password — error should clear
    await dialog.locator('input[type="password"]').nth(1).fill('password123');
    await expect(dialog.getByText('Passwords do not match')).not.toBeVisible();
  });

  test('Add User submits successfully with valid password', async ({ page, mockApi }) => {
    let capturedBody: Record<string, unknown> | null = null;

    // Override POST /vault/admin/users to capture the request body
    mockApi.setOverride('POST /vault/admin/users', async (route) => {
      const body = route.request().postDataJSON();
      capturedBody = body;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-new',
          name: body.name,
          username: body.email.split('@')[0],
          email: body.email,
          role: body.role,
          status: 'active',
          is_active: true,
          auth_source: 'local',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    await dialog.locator('input[type="text"]').fill('Jane Doe');
    await dialog.locator('input[type="email"]').fill('jane@vault.local');
    await dialog.locator('input[type="password"]').first().fill('securepass123');
    await dialog.locator('input[type="password"]').nth(1).fill('securepass123');

    await dialog.getByRole('button', { name: 'Add User' }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // Verify the request body included password and auth_source
    expect(capturedBody).not.toBeNull();
    expect(capturedBody!.password).toBe('securepass123');
    expect(capturedBody!.auth_source).toBe('local');
    expect(capturedBody!.name).toBe('Jane Doe');
    expect(capturedBody!.email).toBe('jane@vault.local');
  });

  test('Add User password placeholder says "Minimum 8 characters"', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    const passwordInput = dialog.locator('input[type="password"]').first();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Minimum 8 characters');
  });
});

test.describe('Users & Permissions — Edit User', () => {
  test('Edit User dialog does NOT show password fields', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    // Click the edit button on the first user row
    const editButton = page.locator('button').filter({ has: page.locator('.lucide-pencil') }).first();
    await editButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Edit User')).toBeVisible();

    // Password inputs should NOT be present
    await expect(dialog.locator('input[type="password"]')).toHaveCount(0);

    // Save Changes button instead of Add User
    await expect(dialog.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });
});

test.describe('Users & Permissions — Delete Confirmation', () => {
  test('clicking delete shows confirmation dialog with user name', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    // Click the delete (trash) button on the first user row
    const deleteButton = page.locator('button').filter({ has: page.locator('.lucide-trash-2') }).first();
    await deleteButton.click();

    // Confirmation dialog should appear
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Deactivate User')).toBeVisible();
    await expect(dialog.getByText(/Are you sure you want to deactivate/)).toBeVisible();
    // Should mention the user will no longer be able to log in
    await expect(dialog.getByText(/will no longer be able to log in/)).toBeVisible();
  });

  test('cancel button closes delete confirmation without deactivating', async ({ page, mockApi }) => {
    let deleteCalled = false;
    mockApi.setOverride('DELETE /vault/admin/users/*', async (route) => {
      deleteCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await navigateToUsers(page);

    const deleteButton = page.locator('button').filter({ has: page.locator('.lucide-trash-2') }).first();
    await deleteButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Deactivate User')).toBeVisible();

    // Click Cancel
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // Delete API should NOT have been called
    expect(deleteCalled).toBe(false);
  });

  test('confirm button calls deactivate API', async ({ page, mockApi }) => {
    let deleteCalled = false;
    mockApi.setOverride('DELETE /vault/admin/users/*', async (route) => {
      deleteCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await navigateToUsers(page);

    const deleteButton = page.locator('button').filter({ has: page.locator('.lucide-trash-2') }).first();
    await deleteButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Deactivate User')).toBeVisible();

    // Click Deactivate
    await dialog.getByRole('button', { name: 'Deactivate' }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // Delete API should have been called
    expect(deleteCalled).toBe(true);
  });

  test('deactivate button has red styling', async ({ page, mockApi }) => {
    await navigateToUsers(page);

    const deleteButton = page.locator('button').filter({ has: page.locator('.lucide-trash-2') }).first();
    await deleteButton.click();

    const dialog = page.locator('[role="dialog"]');
    const deactivateButton = dialog.getByRole('button', { name: 'Deactivate' });
    await expect(deactivateButton).toHaveClass(/bg-red-600/);
  });
});

test.describe('Users & Permissions — No Console Errors', () => {
  test('add user flow produces no console errors', async ({ page, mockApi, consoleCapture }) => {
    await navigateToUsers(page);

    await page.getByRole('button', { name: /Add User/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('Add New User')).toBeVisible();

    await dialog.locator('input[type="text"]').fill('Test User');
    await dialog.locator('input[type="email"]').fill('test@vault.local');
    await dialog.locator('input[type="password"]').first().fill('password123');
    await dialog.locator('input[type="password"]').nth(1).fill('password123');
    await dialog.getByRole('button', { name: 'Add User' }).click();

    await page.waitForTimeout(500);
    expect(consoleCapture.exceptions).toHaveLength(0);
  });
});
