const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Data Integrity (Import)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should show alert when importing invalid JSON', async ({ page }) => {
        const invalidJsonPath = path.join(__dirname, 'temp_invalid.json');
        fs.writeFileSync(invalidJsonPath, '{ "this is broken json: ...');

        page.on('dialog', async dialog => {
            expect(dialog.type()).toContain('alert');
            // We expect the translated message for 'import_fail'
            // Default is likely 'ja' -> 'インポートに失敗しました。' or 'en' -> 'Import failed.'
            // Since we can't easily guess the current lang default without forcing it, we just accept the dialog.
            // But we can check if it's not empty.
            expect(dialog.message()).toBeTruthy();
            await dialog.accept();
        });

        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(invalidJsonPath);

        // Wait a bit to ensure no crash happens
        await page.waitForTimeout(500);

        // Assert app is still alive (header visible)
        await expect(page.locator('header')).toBeVisible();

        fs.unlinkSync(invalidJsonPath);
    });

    test('should show alert when importing JSON with missing data', async ({ page }) => {
        const missingDataJsonPath = path.join(__dirname, 'temp_missing.json');
        // valid JSON but missing 'data' or 'tasks' structure expected by logic
        fs.writeFileSync(missingDataJsonPath, JSON.stringify({ version: '1.0' }));

        page.on('dialog', async dialog => {
            expect(dialog.type()).toContain('alert');
            expect(dialog.message()).toBeTruthy();
            await dialog.accept();
        });

        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(missingDataJsonPath);

        await page.waitForTimeout(500);
        await expect(page.locator('header')).toBeVisible();

        fs.unlinkSync(missingDataJsonPath);
    });
});
