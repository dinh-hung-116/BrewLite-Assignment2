// E2E chạy trên trình duyệt điện thoại giả lập (NFR-03). Cần web + API đang chạy:
// local: docker compose up; CI: job e2e trong .github/workflows/ci.yml.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'Pixel 7', use: { ...devices['Pixel 7'] } }],
});
