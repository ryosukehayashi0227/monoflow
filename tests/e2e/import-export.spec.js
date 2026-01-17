const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Import/Export', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should import data correctly', async ({ page }) => {
        const taskName = 'Imported Task';
        // Prepare a valid JSON file content
        const importData = {
            data: {
                tasks: {
                    't-import': {
                        id: 't-import',
                        content: taskName,
                        status: 'todo',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        parentId: null,
                        labels: [],
                        blockers: [],
                        priority: 'high'
                    }
                },
                columns: {
                    'c1': { id: 'c1', title: 'To Do', taskIds: ['t-import'] },
                    'c2': { id: 'c2', title: 'In Progress', taskIds: [] },
                    'c3': { id: 'c3', title: 'Done', taskIds: [] }
                },
                columnOrder: ['c1', 'c2', 'c3'],
                labels: []
            },
            lang: 'en',
            theme: 'light',
            version: 'v10-unified'
        };

        // Write to a temp file
        const importFilePath = path.join(__dirname, 'temp_import.json');
        fs.writeFileSync(importFilePath, JSON.stringify(importData));

        // Handle the confirm dialog that appears before import
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        // Get file input and upload the file
        const fileInput = page.locator('#import-file');
        await fileInput.setInputFiles(importFilePath);

        // Import triggers page reload, wait for it
        await page.waitForLoadState('load');

        // Wait for board to render
        await page.waitForSelector('#board');

        // Verify task appears
        await expect(page.locator('.task-card', { hasText: taskName })).toBeVisible({ timeout: 10000 });

        // Cleanup
        fs.unlinkSync(importFilePath);
    });
});

