import { test, expect } from '../fixtures/base.fixture';

test.describe('Chat Page', () => {
  test('loads without console errors', async ({ page, mockApi, consoleCapture }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const exceptions = consoleCapture.exceptions;
    expect(exceptions).toHaveLength(0);
  });

  test('chat input textarea is visible and accepts text', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const textarea = page.getByPlaceholder('Message Vault AI Systems...');
    await expect(textarea).toBeVisible();

    // Type into the textarea
    await textarea.fill('Hello, Vault AI');
    await expect(textarea).toHaveValue('Hello, Vault AI');
  });

  test('model selector shows model name', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // The model selector button shows the model's display name.
    // Mock data has name: "Qwen 2.5 32B AWQ" for the loaded model.
    // On small screens the name is hidden, so check for the button with aria-label.
    const modelButton = page.getByRole('button', { name: 'Select model' });
    await expect(modelButton).toBeVisible();

    // The model name text is inside the button (hidden on xs, visible on sm+)
    await expect(page.getByText('Qwen 2.5 32B AWQ')).toBeAttached();
  });

  test('suggested prompts visible on empty chat', async ({ page, mockApi }) => {
    // Set onboarding complete so we get default prompts (not onboarding prompts)
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.setItem('vault-onboarding-agent-complete', 'true');
    });
    // Reload to pick up the localStorage change
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('What would you like to work on?')).toBeVisible();
  });

  test('suggested prompt cards are visible', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.setItem('vault-onboarding-agent-complete', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Default prompt cards from SuggestedPrompts component
    await expect(page.getByRole('button', { name: 'Set up new model' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Interpret data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run training' })).toBeVisible();
  });

  test('send button disabled when input is empty', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });

  test('type message enables send button', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const textarea = page.getByPlaceholder('Message Vault AI Systems...');
    const sendButton = page.getByRole('button', { name: 'Send message' });

    // Initially disabled
    await expect(sendButton).toBeDisabled();

    // Type a message
    await textarea.fill('Hello there');

    // Now enabled
    await expect(sendButton).toBeEnabled();
  });

  test('send message and receive SSE streamed response', async ({ page, mockApi }) => {
    // Complete onboarding to avoid onboarding prompts
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.setItem('vault-onboarding-agent-complete', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const textarea = page.getByPlaceholder('Message Vault AI Systems...');
    const sendButton = page.getByRole('button', { name: 'Send message' });

    // Type and send a message
    await textarea.fill('Tell me about yourself');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // User message should appear in the thread
    await expect(page.getByText('Tell me about yourself')).toBeVisible({ timeout: 5_000 });

    // Wait for the SSE streamed response to appear.
    // The mock SSE stream returns "Hello! I am Vault AI." split by words.
    await expect(page.getByText(/Hello!.*I am Vault AI\./)).toBeVisible({ timeout: 10_000 });
  });

  test('onboarding banner appears when localStorage key not set', async ({ page, mockApi }) => {
    // Clear onboarding key to ensure onboarding is active
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.removeItem('vault-onboarding-agent-complete');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Onboarding banner text
    await expect(page.getByText('Getting started with Vault Cube')).toBeVisible();
  });

  test('onboarding "Skip intro" is clickable', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.removeItem('vault-onboarding-agent-complete');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const skipButton = page.getByRole('button', { name: 'Skip intro' });
    await expect(skipButton).toBeVisible();

    // Click skip — banner should disappear and default prompts should show
    await skipButton.click();
    await expect(page.getByText('Getting started with Vault Cube')).not.toBeVisible();
    await expect(page.getByText('What would you like to work on?')).toBeVisible();
  });

  test('empty state renders correctly', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.setItem('vault-onboarding-agent-complete', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // No messages — suggested prompts are visible
    await expect(page.getByText('What would you like to work on?')).toBeVisible();

    // Chat input is available
    await expect(page.getByPlaceholder('Message Vault AI Systems...')).toBeVisible();

    // Model selector is present
    await expect(page.getByRole('button', { name: 'Select model' })).toBeVisible();
  });

  test('export button not visible on empty chat', async ({ page, mockApi }) => {
    await page.goto('/chat');
    await page.evaluate(() => {
      localStorage.setItem('vault-onboarding-agent-complete', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // The export button (Download icon with title "Export conversation") should
    // not be visible because there's no conversationId and no messages.
    const exportButton = page.getByTitle('Export conversation');
    await expect(exportButton).not.toBeVisible();
  });
});
