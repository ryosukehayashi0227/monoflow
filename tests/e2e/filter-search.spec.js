const { test, expect } = require('@playwright/test');

test.describe('Search and Filter', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should filter tasks by search query', async ({ page }) => {
        // Add two tasks
        await page.locator('#new-task-input').fill('Apple Task');
        await page.keyboard.press('Enter');
        await page.locator('#new-task-input').fill('Banana Task');
        await page.keyboard.press('Enter');

        // Search for "Apple"
        await page.locator('#search-input').fill('Apple');

        // "Apple Task" should be visible
        await expect(page.locator('.task-card', { hasText: 'Apple Task' })).toBeVisible();

        // "Banana Task" should NOT be visible
        await expect(page.locator('.task-card', { hasText: 'Banana Task' })).not.toBeVisible();
    });

    test('should filter tasks by priority', async ({ page }) => {
        const taskName = 'High Priority Task';
        await page.locator('#new-task-input').fill(taskName);
        await page.keyboard.press('Enter');

        // Open modal to set priority
        await page.locator('.task-card', { hasText: taskName }).click();

        // Click High Priority Label
        // Assuming labels text or class. Let's try locating by text "High" inside the modal.
        await page.locator('label', { hasText: 'High' }).click();
        await page.locator('#modal-save-btn').click();

        // Set filter to "High"
        await page.locator('#priority-filter').selectOption('high');
        await expect(page.locator('.task-card', { hasText: taskName })).toBeVisible();

        // Set filter to "Low"
        await page.locator('#priority-filter').selectOption('low');
        await expect(page.locator('.task-card', { hasText: taskName })).not.toBeVisible();
    });
});
