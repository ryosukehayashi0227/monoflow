const { test, expect } = require('@playwright/test');

test.describe('Task Grouping', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should group children under a single virtual parent in Done column', async ({ page }) => {
        // 1. Create Parent Task
        await page.locator('#new-task-input').fill('Parent Task');
        await page.keyboard.press('Enter');

        // 2. Open Modal to get ID (easier to just rely on text for now)
        // We need to create children.
        // We need to know Parent ID to assign children.
        // Let's use evaluate to create data programmatically for speed and precision.
        await page.evaluate(() => {
            const pid = 't-parent';
            const c1 = 't-child-1';
            const c2 = 't-child-2';
            const now = new Date().toISOString();
            const data = {
                tasks: {
                    [pid]: { id: pid, content: 'Parent Task', parentId: null, priority: 'none', createdAt: now, updatedAt: now, archived: false },
                    [c1]: { id: c1, content: 'Child 1', parentId: pid, priority: 'none', createdAt: now, updatedAt: now, archived: false },
                    [c2]: { id: c2, content: 'Child 2', parentId: pid, priority: 'none', createdAt: now, updatedAt: now, archived: false }
                },
                columns: {
                    'c1': { id: 'c1', title: 'To Do', taskIds: [pid] },
                    'c2': { id: 'c2', title: 'In Progress', taskIds: [] },
                    'c3': { id: 'c3', title: 'Done', taskIds: [c1, c2] }
                },
                columnOrder: ['c1', 'c2', 'c3'],
                labels: []
            };
            localStorage.setItem('monoflow-v10-refactored', JSON.stringify(data));
        });
        await page.reload();

        // 3. Check Done Column (c3)
        // It should have:
        // Virtual Parent (Parent Task)
        // Child 1
        // Child 2
        // It SHOULD NOT have:
        // Virtual Parent
        // Child 1
        // Virtual Parent (Again)
        // Child 2

        const doneColumn = page.locator('.task-list[data-column-id="c3"]');

        // Count duplicate Virtual Parents
        const virtualParents = doneColumn.locator('.virtual-parent-card', { hasText: 'Parent Task' });
        await expect(virtualParents).toHaveCount(1);

        // Count Children
        await expect(doneColumn.locator('.task-card', { hasText: 'Child 1' })).toBeVisible();
        await expect(doneColumn.locator('.task-card', { hasText: 'Child 2' })).toBeVisible();
    });
});
