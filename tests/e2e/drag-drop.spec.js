const { test, expect } = require('@playwright/test');

test.describe('MonoFlow Drag & Drop', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should move a task from To Do to In Progress', async ({ page }) => {
        const taskName = 'Drag Me';

        // Create Task
        await page.locator('#new-task-input').fill(taskName);
        await page.keyboard.press('Enter');

        // Check if task exists in To Do
        const todoList = page.locator('.task-list[data-column-id="c1"]');
        const taskCard = todoList.locator('.task-card', { hasText: taskName });
        await expect(taskCard).toBeVisible();

        const inProgressList = page.locator('.task-list[data-column-id="c2"]');

        // Get bounding boxes
        const sourceBox = await taskCard.boundingBox();
        const targetBox = await inProgressList.boundingBox();

        if (sourceBox && targetBox) {
            await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
            await page.mouse.down();
            // Move slowly to trigger sortable
            await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 20 });
            await page.mouse.up();
        }

        // Verify it is now in "In Progress"
        await expect(inProgressList.locator('.task-card', { hasText: taskName })).toBeVisible();
        await expect(todoList.locator('.task-card', { hasText: taskName })).not.toBeVisible();

        // Reload to verify persistence
        await page.reload();
        await expect(page.locator('.task-list[data-column-id="c2"] .task-card', { hasText: taskName })).toBeVisible();
    });
});
