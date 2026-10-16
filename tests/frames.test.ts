import { expect, it, vi } from 'vitest';
import { startFrameLoop } from '../src/core/frames';

it('uses video-frame callbacks, deduplicates frames, and cancels on stop', () => {
  let callback!: VideoFrameRequestCallback;
  const video = { currentTime: 0, readyState: 2,
    requestVideoFrameCallback: vi.fn(cb => { callback = cb; return 7; }),
    cancelVideoFrameCallback: vi.fn(),
  } as unknown as HTMLVideoElement;
  const process = vi.fn();
  const stop = startFrameLoop(video, process);
  callback(10, { mediaTime: 0 } as VideoFrameCallbackMetadata);
  callback(20, { mediaTime: 0 } as VideoFrameCallbackMetadata);
  callback(30, { mediaTime: 0.03 } as VideoFrameCallbackMetadata);
  expect(process.mock.calls.map(c => c[0])).toEqual([10, 30]);
  stop();
  expect(video.cancelVideoFrameCallback).toHaveBeenCalledWith(7);
  callback(40, { mediaTime: 0.04 } as VideoFrameCallbackMetadata);
  expect(process).toHaveBeenCalledTimes(2);
});
it('falls back to animation frames and does not infer duplicate decoded frames', () => {
  let callback!: FrameRequestCallback;
  const raf = vi.fn(cb => { callback = cb; return 9; });
  const cancel = vi.fn();
  const video = { currentTime: 1, readyState: 2 } as HTMLVideoElement;
  const process = vi.fn();
  const stop = startFrameLoop(video, process, { request: raf, cancel });
  callback(10); callback(20);
  video.currentTime = 1.1;
  callback(30);
  expect(process).toHaveBeenCalledTimes(2);
  stop();
  expect(cancel).toHaveBeenCalledWith(9);
});
