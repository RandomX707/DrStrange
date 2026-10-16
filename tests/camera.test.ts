import { describe, expect, it, vi } from 'vitest';
import { CameraController, cameraError } from '../src/core/camera';

function hardware() {
  const track = new EventTarget() as MediaStreamTrack;
  track.stop = vi.fn();
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream;
  const video = Object.assign(new EventTarget(), {
    srcObject: null, readyState: 2, videoWidth: 640, videoHeight: 480,
    play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(),
  }) as unknown as HTMLVideoElement;
  return { track, stream, video };
}

describe('camera resource ownership', () => {
  it('starts with explicit camera and stops/detaches every owned track', async () => {
    const { track, stream, video } = hardware();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    const camera = new CameraController(video, { getUserMedia });
    expect(await camera.start('camera-2')).toBe(true);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: false, video: {
      deviceId: { exact: 'camera-2' }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 },
    } });
    expect(video.srcObject).toBe(stream);
    camera.stop();
    camera.stop();
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(video.srcObject).toBeNull();
  });
  it('releases a late permission response after stop', async () => {
    const { track, stream, video } = hardware();
    let grant!: (stream: MediaStream) => void;
    const camera = new CameraController(video, { getUserMedia: () => new Promise(resolve => { grant = resolve; }) });
    const pending = camera.start();
    camera.stop();
    grant(stream);
    expect(await pending).toBe(false);
    expect(track.stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });
  it('prevents an old start from replacing a new camera', async () => {
    const first = hardware();
    const second = hardware();
    let grant!: (stream: MediaStream) => void;
    const getUserMedia = vi.fn().mockImplementationOnce(() => new Promise(resolve => { grant = resolve; }))
      .mockResolvedValueOnce(second.stream);
    const camera = new CameraController(first.video, { getUserMedia });
    const oldStart = camera.start();
    expect(await camera.start()).toBe(true);
    grant(first.stream);
    expect(await oldStart).toBe(false);
    expect(first.video.srcObject).toBe(second.stream);
    expect(first.track.stop).toHaveBeenCalledOnce();
    expect(second.track.stop).not.toHaveBeenCalled();
    camera.stop();
  });
  it('propagates permission denial without attaching a stream', async () => {
    const { video } = hardware();
    const camera = new CameraController(video, { getUserMedia: async () => { throw new DOMException('Denied', 'NotAllowedError'); } });
    await expect(camera.start()).rejects.toMatchObject({ name: 'NotAllowedError' });
    expect(video.srcObject).toBeNull();
    expect(cameraError(new DOMException('', 'NotAllowedError'))).toMatch(/permission/i);
  });
  it('cleans up when playback fails', async () => {
    const { video, track, stream } = hardware();
    vi.mocked(video.play).mockRejectedValue(new Error('play failed'));
    const camera = new CameraController(video, { getUserMedia: async () => stream });
    await expect(camera.start()).rejects.toThrow('play failed');
    expect(track.stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });
  it('aborts metadata waiting and reports camera disconnection', async () => {
    const { video, track, stream } = hardware();
    Object.defineProperty(video, 'readyState', { value: 0, configurable: true });
    const disconnected = vi.fn();
    const camera = new CameraController(video, { getUserMedia: async () => stream }, disconnected);
    const pending = camera.start();
    await Promise.resolve();
    camera.stop();
    expect(await pending).toBe(false);
    Object.defineProperty(video, 'readyState', { value: 2 });
    expect(await camera.start()).toBe(true);
    track.dispatchEvent(new Event('ended'));
    expect(disconnected).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });
});
