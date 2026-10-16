import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
const baseArgs = ['--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${resolve('artifacts/no-hands.y4m')}`];
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1,
  timeout: 60_000,
  expect: { timeout: 30_000 },
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium-synthetic', testMatch: /workspace.spec.ts/, use: { browserName: 'chromium', launchOptions: { args: [...baseArgs, '--use-fake-ui-for-media-stream'] } } },
    { name: 'chromium-denied', testMatch: /permission.spec.ts/, use: { browserName: 'chromium', launchOptions: { args: [...baseArgs, '--use-fake-ui-for-media-stream=deny'] } } },
    { name: 'chromium-cpu', testMatch: /cpu.spec.ts/, use: { browserName: 'chromium', launchOptions: { args: [...baseArgs, '--use-fake-ui-for-media-stream'] } } },
  ],
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
