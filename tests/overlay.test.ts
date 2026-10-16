import { expect, it, vi } from 'vitest';
import { drawOverlay } from '../src/core/overlay';
it('draws all 21 joints and the hand skeleton using viewport coordinates', () => {
  const context = { clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillText: vi.fn(), save: vi.fn(), restore: vi.fn() };
  const points = Array.from({ length: 21 }, () => ({ x: 0.25, y: 0.2, z: 0, visibility: 0 }));
  drawOverlay(context as unknown as CanvasRenderingContext2D,
    { landmarks: [points], handedness: [[{ categoryName: 'Left', score: 0.8, index: 0, displayName: '' }]], handednesses: [[{ categoryName: 'Left', score: 0.8, index: 0, displayName: '' }]], worldLandmarks: [] },
    { width: 640, height: 480 }, { width: 800, height: 800 }, true);
  expect(context.arc).toHaveBeenCalledTimes(21);
  expect(context.arc.mock.calls[0].slice(0, 2)).toEqual([600, 220]);
  expect(context.lineTo).toHaveBeenCalledTimes(21);
  expect(context.fillText).toHaveBeenCalledWith('Model: Left', 610, 210);
});
