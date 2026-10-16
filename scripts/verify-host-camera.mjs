import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
// Run against npm run dev. No fake capture flags, screenshots or frame recordings.
const url = 'http://127.0.0.1:5173';
const browser = await chromium.launch();
const report = { checkedAt: new Date().toISOString(), browser: browser.version(), synthetic: false, status: 'blocked' };
try {
  const context = await browser.newContext({ permissions: ['camera'] });
  const page = await context.newPage();
  await page.goto(url);
  const observation = await page.evaluate(async () => {
    let stream;
    let timeout;
    try {
      const media = navigator.mediaDevices;
      if (!media) return { result: 'unavailable', reason: 'navigator.mediaDevices is unavailable' };
      const devices = await media.enumerateDevices();
      const cameraCount = devices.filter(device => device.kind === 'videoinput').length;
      const acquisition = media.getUserMedia({ video: true, audio: false });
      let expired = false;
      // A late grant after timeout is stopped too; no host permission settings are changed.
      acquisition.then(lateStream => { if (expired) lateStream.getTracks().forEach(track => track.stop()); }, () => {});
      try {
        stream = await Promise.race([acquisition, new Promise((_, reject) => {
          timeout = setTimeout(() => { expired = true; reject(new Error('No host camera response within 10 seconds')); }, 10_000);
        })]);
      } finally { clearTimeout(timeout); }
      const settings = stream.getVideoTracks()[0].getSettings();
      const video = document.createElement('video'); video.muted = true; video.srcObject = stream;
      await video.play();
      const result = { result: 'opened', cameraCount, width: video.videoWidth, height: video.videoHeight, frameRateSetting: settings.frameRate };
      video.pause(); video.srcObject = null;
      return result;
    } catch (error) {
      return { result: 'blocked', reason: `${error.name}: ${error.message}` };
    } finally { stream?.getTracks().forEach(track => track.stop()); }
  });
  Object.assign(report, observation, { status: observation.result === 'opened' ? 'capture-opened-physical-hands-unverified' : 'blocked' });
} catch (error) {
  Object.assign(report, { reason: `${error.name}: ${error.message}` });
} finally {
  await browser.close();
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/host-camera.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.status === 'blocked') process.exitCode = 2;
}
