import { test, expect } from '../fixtures/base.fixture';

test.describe('Quarantine Page', () => {
  test('loads without console errors', async ({ page, consoleCapture }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    const errors = consoleCapture.exceptions;
    expect(errors).toHaveLength(0);
  });

  test('heading "Quarantine" is visible', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.getByRole('heading', { name: 'Quarantine' });
    await expect(heading).toBeVisible();
  });

  test('stats cards render', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    // QuarantineStats renders MetricCards with titles passed to MetricCard.
    // MetricCard renders: <p className="text-sm text-muted-foreground">{title}</p>
    // Titles are: "Files Scanned", "Held for Review", "Approved", "Rejected"
    await expect(page.getByText('Files Scanned')).toBeVisible();
    await expect(page.getByText('Held for Review')).toBeVisible();
  });

  test('signature health section is present', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    // SignatureHealth renders heading "Signature Sources" and cards "ClamAV", "YARA Rules", "Hash Blacklist"
    await expect(page.getByText('Signature Sources')).toBeVisible();
    await expect(page.getByText('ClamAV')).toBeVisible();
  });

  test('held files table renders first file', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    // QuarantinePage renders <h2>Held Files</h2> above the table
    await expect(page.getByRole('heading', { name: 'Held Files' })).toBeVisible();

    // HeldFilesTable renders file.original_filename in table cells
    // Mock data first file: "suspicious-doc.pdf"
    await expect(page.getByText('suspicious-doc.pdf')).toBeVisible();
  });

  test('second held file is visible', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    // Second mock file: "test-file.docx"
    await expect(page.getByText('test-file.docx')).toBeVisible();
  });

  test('click on held file row opens detail dialog', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    // Click on the first held file row to open the detail dialog
    await page.getByText('suspicious-doc.pdf').click();

    // HeldFileDetailDialog renders a Dialog with title "File Details"
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('File Details')).toBeVisible();
  });

  test('stats show severity distribution', async ({ page }) => {
    await page.goto('/quarantine');
    await page.waitForLoadState('networkidle');

    // QuarantineStats renders severity distribution badges when severity_distribution is non-empty.
    // Label: "Severity distribution:" followed by badges like "critical: 1", "high: 1"
    await expect(page.getByText('Severity distribution:')).toBeVisible();
    await expect(page.getByText('critical: 1')).toBeVisible();
  });
});
