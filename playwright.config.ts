import { PlaywrightTestConfig, devices } from '@playwright/test';
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path:'.env.development' });
}

const config: PlaywrightTestConfig = {
    use: {
        trace: 'on-first-retry',
        baseURL: process.env.VITE_API_AAD_APP_REDIRECT_URI || 'http://localhost:3000',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
};

export default config;
