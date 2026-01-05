const { test, expect } = require('@playwright/test');

test.describe('Blocker Functionality', () => {
    test.use({ viewport: { width: 1600, height: 900 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('monoflow-lang', 'en');
        });
        await page.reload();
    });

    test('should warn when moving blocked task to Done', async ({ page }) => {
        // 1. Create Task A (Blocker) and Task B (Blocked)
        const taskA = 'Task A (Blocker)';
        const taskB = 'Task B (Blocked)';

        await page.locator('#new-task-input').fill(taskA);
        await page.keyboard.press('Enter');
        await page.locator('#new-task-input').fill(taskB);
        await page.keyboard.press('Enter');

        // 2. Open Task B and add Task A as blocker
        await page.locator('.task-card', { hasText: taskB }).click();

        // Select Task A in blocker dropdown. 
        // We need to wait for select to be populated.
        const select = page.locator('#edit-task-blocker-select');
        // Task A needs to be selected by value. We need to find the ID of Task A.
        // Easier way: Select by label (content). Playwright's selectOption matches label.
        // However, the option text is "Task A (Blocker)..." (substring).
        // Let's use getAttribute/evaluate to find the ID or match text.
        await select.selectOption({ label: taskA });

        // Click Add Blocker button
        await page.locator('#modal-add-blocker-btn').click();

        // Verify it is added to the list
        await expect(page.locator('#edit-task-blockers-list')).toContainText(taskA);

        // Click Save Changes button
        await page.locator('#modal-save-btn').click();
        await expect(page.locator('#task-modal')).toBeHidden();
        await expect(page.locator('#task-modal')).toBeHidden();

        // Verify Blocker Indicator on Card - Retry with screenshot if needed
        const cardLocator = page.locator('.task-card', { hasText: taskB });
        await expect(cardLocator).toBeVisible();
        await expect(cardLocator.locator('.blocker-indicator')).toBeVisible();

        // 2.5 Drag Task B to In Progress (Verify basic drag works)
        const inProgressList = page.locator('.task-list[data-column-id="c2"]');
        const inProgressBox = await inProgressList.boundingBox();

        let box = await cardLocator.boundingBox();
        if (box && inProgressBox) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(inProgressBox.x + inProgressBox.width / 2, inProgressBox.y + inProgressBox.height / 2, { steps: 20 });
            await page.mouse.up();
        }

        await expect(inProgressList.locator('.task-card', { hasText: taskB })).toBeVisible();

        // 3. Try to drag Task B to Done (from In Progress)
        box = await cardLocator.boundingBox(); // New position
        // Ensure doneList is visible (c3)
        const doneList = page.locator('.task-list[data-column-id="c3"]');
        const doneBox = await doneList.boundingBox();

        let dialogHandled = false;
        let dialogMsg = '';
        page.once('dialog', async dialog => {
            dialogMsg = dialog.message();
            dialogHandled = true;
            await dialog.dismiss();
        });

        if (box && doneBox) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height / 2, { steps: 20 });
            await page.mouse.up();
        }

        // Wait for dialog to be handled
        await expect(async () => {
            expect(dialogHandled).toBe(true);
        }).toPass({ timeout: 5000 });

        expect(dialogMsg).toContain('Task A (Blocker)');

        // 4. Clean up - Complete Task A to allow move
        // Move Task A (Blocker) to Done
        const taskACard = page.locator('.task-card', { hasText: taskA });
        const sourceBoxA = await taskACard.boundingBox();
        if (sourceBoxA && doneBox) {
            await page.mouse.move(sourceBoxA.x + sourceBoxA.width / 2, sourceBoxA.y + sourceBoxA.height / 2);
            await page.mouse.down();
            await page.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height / 2, { steps: 20 });
            await page.mouse.up();
        }
        await expect(doneList.locator('.task-card', { hasText: taskA })).toBeVisible();

        // 5. Move Task B to Done (Should succeed now)
        // We shouldn't get a dialog this time, or if we do it would be wrong.
        page.on('dialog', () => { throw new Error('Unexpected dialog'); });

        // Move B again
        // We need to re-fetch bounding box as A moved and layout shifted
        const boxB2 = await cardLocator.boundingBox();
        if (boxB2 && doneBox) {
            await page.mouse.move(boxB2.x + boxB2.width / 2, boxB2.y + boxB2.height / 2);
            await page.mouse.down();
            await page.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height / 2, { steps: 20 });
            await page.mouse.up();
        }

        // Verify B is in Done
        await expect(doneList.locator('.task-card', { hasText: taskB })).toBeVisible();
    });
});
