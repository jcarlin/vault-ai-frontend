import { test as base, expect } from '@playwright/test';
import { attachConsoleCapture, type ConsoleCapture } from './console-capture';
import { MockApiHelper } from './api-mocks';

/**
 * Composed test fixture providing:
 * - consoleCapture: automatic console.error/pageerror/requestfailed collection
 * - mockApi: MockApiHelper for intercepting all /api/p/** requests
 *
 * All spec files should import { test, expect } from this file.
 */
export const test = base.extend<{
  consoleCapture: ConsoleCapture;
  mockApi: MockApiHelper;
}>({
  // Auto-install API mocks for every test — even those that don't destructure mockApi.
  // Without mocks the Next.js proxy returns 502 (backend not running) and all data fetches fail.
  mockApi: [async ({ page }, use) => {
    const mock = new MockApiHelper(page);
    await mock.install();
    await use(mock);
  }, { auto: true }],

  consoleCapture: [async ({ page }, use, testInfo) => {
    const capture = attachConsoleCapture(page);
    await use(capture);

    // Attach entries to testInfo for the markdown reporter
    if (capture.all.length > 0) {
      await testInfo.attach('console-entries', {
        body: JSON.stringify(capture.all),
        contentType: 'application/json',
      });
    }
  }, { auto: true }],
});

export { expect };
