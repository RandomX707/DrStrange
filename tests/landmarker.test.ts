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
it('uses CPU directly when requested without attempting GPU', async () => {
  const detector = { close: vi.fn(), detectForVideo: vi.fn() };
  const create = vi.fn().mockResolvedValue(detector);
  const result = await initializeLandmarker(create, 'CPU');
  expect(create.mock.calls.map(call => call[0])).toEqual(['CPU']);
  expect(result.delegate).toBe('CPU');
  expect(result.fallbackReason).toBeUndefined();
});
it('reports CPU-only initialization failure without retrying GPU', async () => {
  const create = vi.fn().mockRejectedValue(new Error('cpu unavailable'));
  await expect(initializeLandmarker(create, 'CPU')).rejects.toThrow(/CPU.*cpu unavailable/);
  expect(create.mock.calls.map(call => call[0])).toEqual(['CPU']);
});
