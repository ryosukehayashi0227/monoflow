const { test, expect } = require('@playwright/test');

test.describe('Theme Toggling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('monoflow-theme', 'light');
        });
        await page.reload();
    });

    test('should toggle dark mode', async ({ page }) => {
        const html = page.locator('html');
        await expect(html).not.toHaveClass(/dark/);

        // Click theme toggle
        await page.locator('#theme-btn').click();

        // Should have class dark
        await expect(html).toHaveClass(/dark/);
    });

    test('should persist theme after reload', async ({ page }) => {
        // Toggle to dark
        await page.locator('#theme-btn').click();
        await expect(page.locator('html')).toHaveClass(/dark/);

        // Reload
        await page.reload();

        // Should still be dark
        await expect(page.locator('html')).toHaveClass(/dark/);
    });
});
