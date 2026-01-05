const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://127.0.0.1:8080', // We might need to serve it or use file://
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npx http-server . -p 8080',
        url: 'http://127.0.0.1:8080',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
