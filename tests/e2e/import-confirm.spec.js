const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Import Confirmation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            const initialData = {
                tasks: {
                    't1': {
                        id: 't1',
                        content: 'Original Task',
                        status: 'todo',
                        parentId: null,
                        labels: [],
                        priority: 'none',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        archived: false,
                        blockers: []
                    }
                },
                columns: {
                    'c1': { id: 'c1', title: 'To Do', taskIds: ['t1'] },
                    'c2': { id: 'c2', title: 'In Progress', taskIds: [] },
                    'c3': { id: 'c3', title: 'Done', taskIds: [] }
                },
                columnOrder: ['c1', 'c2', 'c3'],
                labels: []
            };
            localStorage.setItem('monoflow-v10-refactored', JSON.stringify(initialData));
        });
        await page.reload();
        // Wait for board to render "Original Task" before starting any test
        await expect(page.locator('.task-card', { hasText: 'Original Task' })).toBeVisible({ timeout: 5000 });
    });

    test('should cancel import when confirmation is declined', async ({ page }) => {
        // Create dummy import file
        const importData = {
            data: {
                tasks: { 't2': { id: 't2', content: 'Imported Task', status: 'todo' } },
                columns: { 'c1': { id: 'c1', title: 'To Do', taskIds: ['t2'] } },
                columnOrder: ['c1']
            }
        };
        const filePath = path.join(__dirname, 'temp_import_cancel.json');
        fs.writeFileSync(filePath, JSON.stringify(importData));

        // Setup dialog handler to dismiss (Cancel)
        page.on('dialog', async dialog => {
            const message = dialog.message();
            // Check if message matches EITHER Japanese OR English
            const isMatch = message.includes('現在のデータは失われますがよろしいですか？') ||
                message.includes('Current data will be lost');
            expect(isMatch).toBeTruthy();
            await dialog.dismiss();
        });

        // Trigger import
        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(filePath);

        // Verify Original Task is still there
        await expect(page.locator('.task-card', { hasText: 'Original Task' })).toBeVisible();
        await expect(page.locator('.task-card', { hasText: 'Imported Task' })).not.toBeVisible();

        // Cleanup
        fs.unlinkSync(filePath);
    });

    test('should proceed with import when confirmation is accepted', async ({ page }) => {
        // Create dummy import file
        const importData = {
            data: {
                tasks: {
                    't2': {
                        id: 't2',
                        content: 'Imported Task',
                        status: 'todo',
                        parentId: null,
                        labels: [],
                        priority: 'none',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        archived: false,
                        blockers: []
                    }
                },
                columns: {
                    'c1': { id: 'c1', title: 'To Do', taskIds: ['t2'] },
                    'c2': { id: 'c2', title: 'In Progress', taskIds: [] },
                    'c3': { id: 'c3', title: 'Done', taskIds: [] }
                },
                columnOrder: ['c1', 'c2', 'c3'],
                labels: []
            }
        };
        const filePath = path.join(__dirname, 'temp_import_accept.json');
        fs.writeFileSync(filePath, JSON.stringify(importData));

        // Setup dialog handler to accept (OK)
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        // Trigger import
        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(filePath);

        // Wait for reload (Import triggers location.reload())
        // We expect 'Imported Task' to appear.
        await expect(page.locator('.task-card', { hasText: 'Imported Task' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.task-card', { hasText: 'Original Task' })).not.toBeVisible();

        // Cleanup
        fs.unlinkSync(filePath);
    });
});
