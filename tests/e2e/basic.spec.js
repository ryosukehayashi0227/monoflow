const { test, expect } = require('@playwright/test');

test.describe('MonoFlow Basic Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the starting url before each test.
        await page.goto('/');
        // Evaluate to clear local storage to start fresh
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should load the page and show title', async ({ page }) => {
        await expect(page).toHaveTitle(/MonoFlow/);
        await expect(page.locator('#board')).toBeVisible();
    });

    test('should add a new task', async ({ page }) => {
        const taskName = 'Playwright Test Task';

        // Type into the input
        await page.locator('#new-task-input').fill(taskName);
        await page.keyboard.press('Enter');

        // Check if task exists in the To Do column
        const taskCard = page.locator('.task-card', { hasText: taskName });
        await expect(taskCard).toBeVisible();
    });

    test('should edit a task', async ({ page }) => {
        const taskName = 'Task to Edit';
        const newName = 'Task Edited';

        // Create task
        await page.locator('#new-task-input').fill(taskName);
        await page.keyboard.press('Enter');

        // Click to open modal
        await page.locator('.task-card', { hasText: taskName }).click();

        // Check modal visibility
        const modal = page.locator('#task-modal');
        await expect(modal).toBeVisible();

        // Edit title
        await page.locator('#edit-task-content').fill(newName);

        // Save
        await page.locator('#modal-save-btn').click();

        // Check if updated on board
        await expect(page.locator('.task-card', { hasText: newName })).toBeVisible();
    });
});
