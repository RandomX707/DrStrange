import { expect, test } from '@playwright/test';

test('real CPU inference works after an injected GPU initialization failure', async ({ page }) => {
  await page.goto('/');
  const visionUrl = await page.evaluate(() => performance.getEntriesByType('resource').find(entry => entry.name.includes('/@mediapipe_tasks-vision.'))?.name);
  expect(visionUrl).toBeTruthy();
  // Replace only the GPU-creation boundary. CPU WASM/model initialization remains real.
  await page.evaluate(async url => {
    const { HandLandmarker } = await import(/* @vite-ignore */ url!);
    const create = HandLandmarker.createFromOptions;
    HandLandmarker.createFromOptions = function(files: unknown, options: { baseOptions: { delegate: string } }) {
      if (options.baseOptions.delegate === 'GPU') return Promise.reject(new Error('Injected GPU failure for CPU integration test'));
      return create.call(this, files, options);
    };
  }, visionUrl);
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByTestId('session-status')).toHaveText('Live');
  await expect(page.getByText('GPU initialization failed; using CPU.', { exact: false })).toBeVisible();
  await expect.poll(async () => Number(await page.getByTestId('processed-frames').textContent())).toBeGreaterThan(3);
  await page.getByRole('button', { name: 'Stop camera' }).click();
  expect(await page.locator('video').evaluate((video: HTMLVideoElement) => video.srcObject === null)).toBe(true);
});
