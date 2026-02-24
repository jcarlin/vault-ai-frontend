import { test, expect } from './fixtures/base.fixture';

test.describe('Navigation', () => {
  test('/chat loads with sidebar and conversation list', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Sidebar is visible with conversations
    await expect(page.getByText('Conversations')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Test conversation')).toBeVisible();
    await expect(page.getByText('Another chat')).toBeVisible();
  });

  test('clicking "New chat" resets the chat panel', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // First select a conversation to have it active
    await page.getByText('Test conversation').click();

    // Click "New chat" — the button contains the Plus icon and text
    await page.getByRole('button', { name: 'New chat' }).click();

    // After new chat, suggested prompts should be visible (empty state)
    await expect(
      page.getByText('What would you like to work on?')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking a conversation loads it', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Click on the first conversation in the sidebar
    await page.getByText('Test conversation').click();

    // The conversation's messages should appear in the chat panel.
    // Mock returns messages: "Hello, what can you do?" and the assistant reply.
    await expect(page.getByText('Hello, what can you do?')).toBeVisible({ timeout: 10_000 });
  });

  test('navigate to /insights renders page', async ({ page, mockApi }) => {
    await page.goto('/insights');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible({ timeout: 10_000 });
  });

  test('navigate to /models renders page', async ({ page, mockApi }) => {
    await page.goto('/models');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Models', exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('navigate to /audit renders page', async ({ page, mockApi }) => {
    await page.goto('/audit');
    await page.waitForLoadState('networkidle');

    // The audit page heading is "Audit & Logs"
    await expect(page.getByRole('heading', { name: /Audit/i })).toBeVisible({ timeout: 10_000 });
  });

  test('/settings renders and "Back to Chat" navigates back', async ({ page, mockApi }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Settings page has SettingsSidebar with "Back to Chat" button
    const backButton = page.getByRole('button', { name: /Back to Chat/i });
    await expect(backButton).toBeVisible({ timeout: 10_000 });

    // Click back to chat
    await backButton.click();
    await page.waitForURL('**/chat', { timeout: 15_000 });
    expect(page.url()).toContain('/chat');
  });

  test('landing page "Open Chat" navigates to /chat', async ({ page, mockApi }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const openChatLink = page.getByRole('link', { name: 'Open Chat' });
    await expect(openChatLink).toBeVisible({ timeout: 10_000 });

    await openChatLink.click();
    await page.waitForURL('**/chat', { timeout: 15_000 });
    expect(page.url()).toContain('/chat');
  });
});
