/** Call once per decoded frame. Timestamps are monotonic performance-clock milliseconds. */
export function startFrameLoop(
  video: HTMLVideoElement,
  process: (timestamp: number) => void,
  raf = {
    request: (callback: FrameRequestCallback) => requestAnimationFrame(callback),
    cancel: (handle: number) => cancelAnimationFrame(handle),
  },
): () => void {
  const useVideoFrames = typeof video.requestVideoFrameCallback === 'function';
  let stopped = false;
  let handle = 0;
  let lastMediaTime = -1;
  const schedule = () => {
    if (stopped) return;
    handle = useVideoFrames ? video.requestVideoFrameCallback(onVideo) : raf.request(onAnimation);
  };
  const run = (timestamp: number, mediaTime: number) => {
    if (stopped) return;
    if (video.readyState >= 2 && mediaTime !== lastMediaTime) {
      lastMediaTime = mediaTime;
      process(timestamp);
    }
    schedule();
  };
  const onVideo: VideoFrameRequestCallback = (timestamp, metadata) => run(timestamp, metadata.mediaTime);
  const onAnimation: FrameRequestCallback = timestamp => run(timestamp, video.currentTime);
  schedule();
  return () => {
    stopped = true;
    if (useVideoFrames) video.cancelVideoFrameCallback(handle); else raf.cancel(handle);
  };
}
