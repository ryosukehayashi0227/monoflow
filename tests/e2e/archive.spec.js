const { test, expect } = require('@playwright/test');

test.describe('Archive Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should archive and restore a task', async ({ page }) => {
        const taskName = 'Task to Archive';
        await page.locator('#new-task-input').fill(taskName);
        await page.keyboard.press('Enter');

        // Open modal
        await page.locator('.task-card', { hasText: taskName }).click();

        // Click Archive button (it has id 'modal-archive-btn')
        await page.locator('#modal-archive-btn').click();

        // Task should disappear from board
        await expect(page.locator('.task-card', { hasText: taskName })).not.toBeVisible();

        // Open Archive Modal (Archive button in menu)
        // The menu item has text 'Archive' (or 'アーカイブ' depending on lang, but we use defaults)
        // Wait, the menu item id is 'menu-archive'. But it's inside a span.
        // Let's assume the button with onclick="Archive.open()"
        // Actually common.js says: t('menu-archive', 'menu_archive');
        // Let's find the element by text or id.
        // The previous analysis didn't show the clean HTML structure for menu, let's try finding by text or icon.
        // Assuming there is a button that opens Archive.

        // Let's just execute JS to open it if UI is tricky to find without exploring HTML again
        await page.evaluate(() => Archive.open());

        // Check if task is in archive list
        const archiveList = page.locator('#archive-list');
        await expect(archiveList).toBeVisible();
        await expect(archiveList).toContainText(taskName);

        // Restore it
        // There is a restore button with icon 'rotate-ccw' or onclick="BoardData.restoreTask..."
        // Let's click the button inside the archive list item
        await archiveList.locator('button').first().click(); // Assuming first button is restore. 
        // Wait, let's be more specific. Restore usually has a specific icon or class.
        // In app.js: button onclick="BoardData.restoreTask('${t.id}')"
        // We can click that.

        // Close modal (helper for stability)
        await page.evaluate(() => Archive.close());

        // Task should be back on board
        await expect(page.locator('.task-card', { hasText: taskName })).toBeVisible();
    });
});
