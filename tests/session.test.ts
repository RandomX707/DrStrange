import { expect, it, vi } from 'vitest';
import { LandmarkerOwner } from '../src/core/session';
import type { InitializedLandmarker } from '../src/core/landmarker';

it('closes a model that finishes initialization after stop', async () => {
  let resolve!: (value: InitializedLandmarker) => void;
  const owner = new LandmarkerOwner(() => new Promise(done => { resolve = done; }));
  const pending = owner.start();
  owner.stop();
  const detector = { close: vi.fn(), detectForVideo: vi.fn() };
  resolve({ detector, delegate: 'CPU', initializationMs: 1 });
  expect(await pending).toBeNull();
  expect(detector.close).toHaveBeenCalledOnce();
});
it('closes an active detector exactly once on repeated cleanup', async () => {
  const detector = { close: vi.fn(), detectForVideo: vi.fn() };
  const owner = new LandmarkerOwner(async () => ({ detector, delegate: 'GPU', initializationMs: 1 }));
  expect((await owner.start())?.delegate).toBe('GPU');
  owner.stop(); owner.stop();
  expect(detector.close).toHaveBeenCalledOnce();
});
