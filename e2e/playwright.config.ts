import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3001', // backend API base for direct uploads
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'cd .. && npm run build && node dist/index.js',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120_000,
  }
});
