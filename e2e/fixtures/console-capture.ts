import { test as base, type Page } from '@playwright/test';

export interface ConsoleEntry {
  type: 'error' | 'warning' | 'exception' | 'network-error' | 'http-error';
  message: string;
  url?: string;
  method?: string;
  status?: number;
}

export interface ConsoleCapture {
  errors: ConsoleEntry[];
  warnings: ConsoleEntry[];
  exceptions: ConsoleEntry[];
  networkErrors: ConsoleEntry[];
  httpErrors: ConsoleEntry[];
  all: ConsoleEntry[];
}

function createCapture(): ConsoleCapture {
  return {
    errors: [],
    warnings: [],
    exceptions: [],
    networkErrors: [],
    httpErrors: [],
    get all() {
      return [
        ...this.exceptions,
        ...this.errors,
        ...this.networkErrors,
        ...this.httpErrors,
        ...this.warnings,
      ];
    },
  };
}

/**
 * Attach console listeners to a page. Returns a ConsoleCapture
 * that accumulates entries as the page runs.
 */
export function attachConsoleCapture(page: Page): ConsoleCapture {
  const capture = createCapture();

  page.on('console', (msg) => {
    const text = msg.text();
    // Filter out noisy Next.js dev warnings
    if (text.includes('Fast Refresh') || text.includes('compiled client')) return;
    if (text.includes('[HMR]') || text.includes('webpack')) return;

    if (msg.type() === 'error') {
      // Filter out expected errors from mocked routes
      if (text.includes('Failed to load resource') && text.includes('/api/p/')) return;
      capture.errors.push({ type: 'error', message: text, url: page.url() });
    } else if (msg.type() === 'warning') {
      capture.warnings.push({ type: 'warning', message: text, url: page.url() });
    }
  });

  page.on('pageerror', (error) => {
    capture.exceptions.push({
      type: 'exception',
      message: `${error.name}: ${error.message}`,
      url: page.url(),
    });
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    // Ignore expected failures from mocked websockets and HMR
    if (url.includes('/_next/') || url.includes('__nextjs')) return;
    if (url.startsWith('ws://') || url.startsWith('wss://')) return;
    const failure = request.failure();
    capture.networkErrors.push({
      type: 'network-error',
      message: failure?.errorText ?? 'Unknown network error',
      url,
      method: request.method(),
    });
  });

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    // Only capture 4xx/5xx from non-mocked, non-static routes
    if (status >= 400 && !url.includes('/_next/') && !url.includes('__nextjs')) {
      capture.httpErrors.push({
        type: 'http-error',
        message: `HTTP ${status}`,
        url,
        method: response.request().method(),
        status,
      });
    }
  });

  return capture;
}

/**
 * Fixture that provides automatic console capture on every test's page.
 * After each test, attaches collected entries to testInfo for the reporter.
 */
export const test = base.extend<{ consoleCapture: ConsoleCapture }>({
  consoleCapture: async ({ page }, use, testInfo) => {
    const capture = attachConsoleCapture(page);
    await use(capture);

    // Attach entries to testInfo for the markdown reporter
    if (capture.all.length > 0) {
      await testInfo.attach('console-entries', {
        body: JSON.stringify(capture.all),
        contentType: 'application/json',
      });
    }
  },
});
