import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface ConsoleEntry {
  type: string;
  message: string;
  url?: string;
  method?: string;
  status?: number;
}

interface PageErrors {
  page: string;
  entries: ConsoleEntry[];
}

interface FailedTest {
  title: string;
  file: string;
  error: string;
  duration: number;
}

/**
 * Custom Playwright reporter that generates e2e-report.md.
 * Aggregates console errors, exceptions, network failures, and test results.
 */
class MarkdownReporter implements Reporter {
  private startTime = 0;
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;
  private consoleErrors: ConsoleEntry[] = [];
  private failedTestDetails: FailedTest[] = [];
  private pageErrors = new Map<string, ConsoleEntry[]>();
  private outputPath: string;

  constructor(options?: { outputFile?: string }) {
    this.outputPath = options?.outputFile ?? 'e2e-report.md';
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.totalTests++;

    if (result.status === 'passed') {
      this.passedTests++;
    } else if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests++;

      const errorMessage =
        result.errors?.[0]?.message ?? result.errors?.[0]?.stack ?? 'Unknown error';

      this.failedTestDetails.push({
        title: test.title,
        file: test.location.file.replace(process.cwd() + '/', ''),
        error: errorMessage.slice(0, 500),
        duration: result.duration,
      });
    } else if (result.status === 'skipped') {
      this.skippedTests++;
    }

    // Extract console entries from test attachments
    for (const attachment of result.attachments) {
      if (attachment.name === 'console-entries' && attachment.body) {
        try {
          const entries: ConsoleEntry[] = JSON.parse(attachment.body.toString());
          this.consoleErrors.push(...entries);

          // Group by page URL
          for (const entry of entries) {
            const page = this.extractPagePath(entry.url ?? '');
            if (!this.pageErrors.has(page)) {
              this.pageErrors.set(page, []);
            }
            this.pageErrors.get(page)!.push(entry);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const exceptions = this.consoleErrors.filter((e) => e.type === 'exception');
    const errors = this.consoleErrors.filter((e) => e.type === 'error');
    const networkErrors = this.consoleErrors.filter((e) => e.type === 'network-error');
    const httpErrors = this.consoleErrors.filter((e) => e.type === 'http-error');
    const warnings = this.consoleErrors.filter((e) => e.type === 'warning');

    const lines: string[] = [];

    // ---- Header ----
    lines.push('# Vault AI Frontend — E2E Test Report');
    lines.push('');
    lines.push(`**Generated:** ${timestamp}  |  **Duration:** ${duration}s  |  **Browser:** Chromium  |  **Status:** ${result.status}`);
    lines.push('');

    // ---- Summary ----
    lines.push('## Summary');
    lines.push('');
    lines.push('| Metric | Count |');
    lines.push('|--------|-------|');
    lines.push(`| Total tests | ${this.totalTests} |`);
    lines.push(`| Passed | ${this.passedTests} |`);
    lines.push(`| Failed | ${this.failedTests} |`);
    lines.push(`| Skipped | ${this.skippedTests} |`);
    lines.push(`| Console errors | ${errors.length} |`);
    lines.push(`| Uncaught exceptions | ${exceptions.length} |`);
    lines.push(`| Network errors | ${networkErrors.length} |`);
    lines.push(`| HTTP errors (4xx/5xx) | ${httpErrors.length} |`);
    lines.push(`| Warnings | ${warnings.length} |`);
    lines.push('');

    // ---- Failed Tests ----
    if (this.failedTestDetails.length > 0) {
      lines.push('## Failed Tests');
      lines.push('');
      for (let i = 0; i < this.failedTestDetails.length; i++) {
        const t = this.failedTestDetails[i];
        lines.push(`### ${i + 1}. ${t.title}`);
        lines.push(`**File:** \`${t.file}\`  |  **Duration:** ${t.duration}ms`);
        lines.push('');
        lines.push('```');
        lines.push(t.error);
        lines.push('```');
        lines.push('');
      }
    }

    // ---- Console Errors by Page ----
    if (this.pageErrors.size > 0) {
      lines.push('## Console Errors by Page');
      lines.push('');

      const sortedPages = [...this.pageErrors.entries()].sort(
        ([, a], [, b]) => b.length - a.length
      );

      for (const [page, entries] of sortedPages) {
        const nonWarnings = entries.filter((e) => e.type !== 'warning');
        if (nonWarnings.length === 0) continue;

        lines.push(`### ${page} (${nonWarnings.length} errors)`);
        lines.push('');
        lines.push('| Type | Message |');
        lines.push('|------|---------|');
        for (const entry of nonWarnings) {
          const msg = entry.message.slice(0, 120).replace(/\|/g, '\\|').replace(/\n/g, ' ');
          lines.push(`| ${entry.type.toUpperCase()} | ${msg} |`);
        }
        lines.push('');
      }
    }

    // ---- Network Errors ----
    if (networkErrors.length > 0 || httpErrors.length > 0) {
      lines.push('## Network Errors');
      lines.push('');
      lines.push('| Method | URL | Error | Type |');
      lines.push('|--------|-----|-------|------|');
      for (const entry of [...networkErrors, ...httpErrors]) {
        const url = (entry.url ?? '').slice(0, 80);
        const msg = entry.message.slice(0, 60).replace(/\|/g, '\\|');
        lines.push(`| ${entry.method ?? '-'} | ${url} | ${msg} | ${entry.type} |`);
      }
      lines.push('');
    }

    // ---- Warnings ----
    if (warnings.length > 0) {
      lines.push('## Warnings (informational)');
      lines.push('');
      // Deduplicate warnings by message
      const seen = new Set<string>();
      const unique = warnings.filter((w) => {
        const key = w.message.slice(0, 100);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      lines.push(`${unique.length} unique warnings across ${warnings.length} total occurrences.`);
      lines.push('');
      for (const w of unique.slice(0, 30)) {
        const msg = w.message.slice(0, 150).replace(/\n/g, ' ');
        lines.push(`- ${msg}`);
      }
      if (unique.length > 30) {
        lines.push(`- ... and ${unique.length - 30} more`);
      }
      lines.push('');
    }

    // ---- Write file ----
    const outputDir = path.dirname(this.outputPath);
    if (outputDir && outputDir !== '.') {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(this.outputPath, lines.join('\n'));
  }

  private extractPagePath(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname || '/';
    } catch {
      return url || '(unknown)';
    }
  }
}

export default MarkdownReporter;
