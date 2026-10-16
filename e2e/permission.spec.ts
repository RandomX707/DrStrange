import { expect, test } from '@playwright/test';

test('Chromium fake permission UI denial leaves capture stopped and offers recovery', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByRole('alert')).toContainText('permission');
  await expect(page.getByTestId('session-status')).toHaveText('Error');
  expect(await page.locator('video').evaluate((video: HTMLVideoElement) => video.srcObject === null)).toBe(true);
  await expect(page.getByRole('button', { name: 'Start camera' })).toBeEnabled();
});
