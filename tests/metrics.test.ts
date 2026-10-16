import { expect, it } from 'vitest';
import { SessionMetrics } from '../src/core/metrics';

it('separates processed and render-callback FPS and measures bounded latency samples', () => {
  const metrics = new SessionMetrics(0);
  metrics.processed(10); metrics.processed(30); metrics.processed(20);
  metrics.rendered(10); metrics.rendered(30); metrics.rendered(100);
  const report = metrics.snapshot(1000);
  expect(report.processedFps).toBe(3);
  expect(report.renderedFps).toBe(3);
  expect(report.inference).toEqual({ latestMs: 20, meanMs: 20, p50Ms: 20, p95Ms: 30, sampleCount: 3 });
  expect(report.renderGapP95Ms).toBe(70);
});
it('keeps bounded samples without losing total processed count', () => {
  const metrics = new SessionMetrics(0);
  for (let i = 0; i < 2000; i++) metrics.processed(i);
  const report = metrics.snapshot(2000);
  expect(report.processedFrames).toBe(2000);
  expect(report.inference.sampleCount).toBe(1800);
  expect(report.inference.latestMs).toBe(1999);
});
