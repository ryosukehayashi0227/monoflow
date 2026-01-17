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

        let alertShown = false;

        // Handle dialogs: confirm first (accept to proceed), then alert for failure
        page.on('dialog', async dialog => {
            if (dialog.type() === 'confirm') {
                await dialog.accept(); // Accept the confirm to proceed with import
            } else if (dialog.type() === 'alert') {
                alertShown = true;
                expect(dialog.message()).toBeTruthy();
                await dialog.accept();
            }
        });

        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(invalidJsonPath);

        // Wait a bit to ensure dialogs are processed
        await page.waitForTimeout(1000);

        // Assert alert was shown for invalid JSON
        expect(alertShown).toBe(true);

        // Assert app is still alive (header visible)
        await expect(page.locator('header')).toBeVisible();

        fs.unlinkSync(invalidJsonPath);
    });

    test('should show alert when importing JSON with missing data', async ({ page }) => {
        const missingDataJsonPath = path.join(__dirname, 'temp_missing.json');
        // valid JSON but missing 'data' or 'tasks' structure expected by logic
        fs.writeFileSync(missingDataJsonPath, JSON.stringify({ version: '1.0' }));

        let alertShown = false;

        // Handle dialogs: confirm first, then alert for failure
        page.on('dialog', async dialog => {
            if (dialog.type() === 'confirm') {
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                alertShown = true;
                expect(dialog.message()).toBeTruthy();
                await dialog.accept();
            }
        });

        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(missingDataJsonPath);

        await page.waitForTimeout(1000);

        // Assert alert was shown for missing data
        expect(alertShown).toBe(true);

        await expect(page.locator('header')).toBeVisible();

        fs.unlinkSync(missingDataJsonPath);
    });
});

