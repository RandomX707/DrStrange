import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('real MediaPipe processes synthetic capture, exports measured metrics, and releases camera', async ({ page }, testInfo) => {
  const seconds = Number(process.env.SIGNOVA_BENCHMARK_SECONDS ?? 10);
  test.setTimeout((seconds + 60) * 1000);
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5173') && !request.url().startsWith('data:')) external.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Capture workspace' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stop camera' })).toBeDisabled();
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByTestId('session-status')).toHaveText('Live');
  await expect.poll(async () => Number(await page.getByTestId('processed-frames').textContent())).toBeGreaterThan(10);
  // A fixed observation interval is intentional in a performance experiment.
  await page.waitForTimeout(seconds * 1000);
  await page.getByRole('checkbox', { name: 'Mirror preview' }).uncheck();
  await page.getByRole('button', { name: 'Stop camera' }).click();
  await expect(page.getByTestId('session-status')).toHaveText('Stopped');
  expect(await page.locator('video').evaluate((video: HTMLVideoElement) => video.srcObject === null)).toBe(true);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export metrics' }).click();
  const download = await downloadPromise;
  const target = testInfo.outputPath('synthetic-metrics.json');
  await download.saveAs(target);
  const { readFile } = await import('node:fs/promises');
  const report = JSON.parse(await readFile(target, 'utf8'));
  expect(report.metrics.processedFrames).toBeGreaterThan(10);
  expect(report.metrics.inference.p95Ms).toBeGreaterThan(0);
  expect(report.source.width).toBeGreaterThan(0);
  expect(report.delegate).toMatch(/GPU|CPU/);
  expect(report).not.toHaveProperty('landmarks');
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/synthetic-metrics.json', JSON.stringify(report, null, 2));
  await page.screenshot({ path: 'artifacts/workspace-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByTestId('session-status')).toHaveText('Live');
  await page.getByRole('button', { name: 'Stop camera' }).click();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('mobile workspace fits viewport and explains absent camera support', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Camera capture is unavailable');
  await expect(page.getByRole('button', { name: 'Start camera' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/workspace-mobile.png', fullPage: true });
});

test('stopping during model load prevents late initialization from reopening capture', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/models/hand_landmarker.task', async route => { await gate; await route.continue(); });
  await page.goto('/');
  let lateModelClosed = false;
  page.on('console', message => { if (message.text() === 'test:late-model-closed') lateModelClosed = true; });
  const visionUrl = await page.evaluate(() => performance.getEntriesByType('resource').find(entry => entry.name.includes('/@mediapipe_tasks-vision.'))?.name);
  expect(visionUrl).toBeTruthy();
  await page.evaluate(async url => {
    const { HandLandmarker } = await import(/* @vite-ignore */ url!);
    const close = HandLandmarker.prototype.close;
    HandLandmarker.prototype.close = function() {
      close.call(this);
      console.info('test:late-model-closed');
    };
  }, visionUrl);
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByTestId('session-status')).toHaveText('Loading landmarks');
  await page.getByRole('button', { name: 'Stop camera' }).click();
  expect(lateModelClosed).toBe(false);
  release();
  await expect.poll(() => lateModelClosed).toBe(true);
  await expect(page.getByTestId('session-status')).toHaveText('Stopped');
  expect(await page.locator('video').evaluate((video: HTMLVideoElement) => video.srcObject === null)).toBe(true);
});
