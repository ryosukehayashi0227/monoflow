const { test, expect } = require('@playwright/test');

test.describe('Localization', () => {
    test.beforeEach(async ({ page }) => {
        // Force reset
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('monoflow-lang', 'ja'); // Start with JA
        });
        await page.reload();
    });

    test('should display English text when switched to EN', async ({ page }) => {
        // Expect 'Board' (unified)
        await expect(page.locator('#nav-board')).toHaveText('Board');

        // Switch to EN
        // Click language button
        await page.locator('#lang-btn').click();

        // Check if verified text is EN
        // 'About' menu text changes in EN? 
        // In common.js: ja -> 'About', en -> 'About'. Not good for diff.
        // ja -> 'User Guide' (menu_help), en -> 'User Guide'.
        // ja -> add_btn: '追加', en -> 'Add'

        // Wait for reload or DOM update
        await page.waitForLoadState('domcontentloaded');

        const addBtnText = page.locator('#add-btn-text');
        await expect(addBtnText).toHaveText('Add');

        // Check Board tab again (should still be Board)
        await expect(page.locator('#nav-board')).toHaveText('Board');
    });

    test('should display Japanese text when switched to JA', async ({ page }) => {
        // Switch to EN first to ensure we can switch back
        await page.locator('#lang-btn').click();
        await expect(page.locator('#add-btn-text')).toHaveText('Add');

        // Switch back to JA
        await page.locator('#lang-btn').click();

        // Wait for reload
        await page.waitForLoadState('domcontentloaded');

        // ja -> add_btn: '追加'
        await expect(page.locator('#add-btn-text')).toHaveText('追加');

        // Check unified 'Board'
        await expect(page.locator('#nav-board')).toHaveText('Board');
    });

    test('should persist language setting after reload', async ({ page }) => {
        // Switch to EN
        await page.locator('#lang-btn').click();
        await expect(page.locator('#add-btn-text')).toHaveText('Add');

        // Reload
        await page.reload();

        // Should still be EN
        await expect(page.locator('#add-btn-text')).toHaveText('Add');
    });
});
