import { expect, it, vi } from 'vitest';
import { initializeLandmarker } from '../src/core/landmarker';

it('uses GPU first and returns its measured initialization duration', async () => {
  const detector = { close: vi.fn(), detectForVideo: vi.fn() };
  const create = vi.fn().mockResolvedValue(detector);
  const result = await initializeLandmarker(create);
  expect(create.mock.calls.map(call => call[0])).toEqual(['GPU']);
  expect(result.detector).toBe(detector);
  expect(result.delegate).toBe('GPU');
  expect(result.initializationMs).toBeGreaterThanOrEqual(0);
});
it('falls back to CPU on GPU initialization failure', async () => {
  const detector = { close: vi.fn(), detectForVideo: vi.fn() };
  const create = vi.fn().mockRejectedValueOnce(new Error('WebGL unavailable')).mockResolvedValueOnce(detector);
  const result = await initializeLandmarker(create);
  expect(create.mock.calls.map(call => call[0])).toEqual(['GPU', 'CPU']);
  expect(result.delegate).toBe('CPU');
  expect(result.fallbackReason).toContain('WebGL unavailable');
});
it('preserves both failures if neither delegate can initialize', async () => {
  const create = vi.fn().mockRejectedValueOnce(new Error('gpu failed')).mockRejectedValueOnce(new Error('cpu failed'));
  await expect(initializeLandmarker(create)).rejects.toThrow(/GPU.*gpu failed.*CPU.*cpu failed/);
});
