/** Owns only streams acquired by this controller; late grants are immediately stopped. */
export class CameraController {
  private generation = 0;
  private stream?: MediaStream;
  private pending?: AbortController;
  private detachEnded?: () => void;

  constructor(
    private video: HTMLVideoElement,
    private media: Pick<MediaDevices, 'getUserMedia'>,
    private onEnded?: () => void,
  ) {}

  async start(deviceId?: string): Promise<boolean> {
    this.stop();
    const generation = this.generation;
    const pending = new AbortController();
    this.pending = pending;
    try {
      const stream = await this.media.getUserMedia({ audio: false, video: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
        width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 },
      } });
      if (generation !== this.generation) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      this.stream = stream;
      const ended = () => { this.stop(); this.onEnded?.(); };
      stream.getVideoTracks().forEach(track => track.addEventListener('ended', ended));
      this.detachEnded = () => stream.getVideoTracks().forEach(track => track.removeEventListener('ended', ended));
      this.video.srcObject = stream;
      await this.waitForMetadata(pending.signal);
      if (generation !== this.generation) return false;
      await this.video.play();
      return generation === this.generation;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.stop();
      throw error;
    }
  }

  stop() {
    this.generation++;
    this.pending?.abort();
    this.pending = undefined;
    this.detachEnded?.();
    this.detachEnded = undefined;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = undefined;
    this.video.pause();
    this.video.srcObject = null;
  }

  private waitForMetadata(signal: AbortSignal): Promise<void> {
    if (this.video.readyState >= 1 && this.video.videoWidth > 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timeout);
        this.video.removeEventListener('loadedmetadata', loaded);
        this.video.removeEventListener('error', failed);
        signal.removeEventListener('abort', aborted);
        if (error) reject(error); else resolve();
      };
      const loaded = () => finish();
      const failed = () => finish(new Error('The camera video could not be decoded.'));
      const aborted = () => finish(new DOMException('Capture cancelled', 'AbortError'));
      const timeout = setTimeout(() => finish(new Error('Camera video did not become ready within 15 seconds.')), 15_000);
      this.video.addEventListener('loadedmetadata', loaded);
      this.video.addEventListener('error', failed);
      signal.addEventListener('abort', aborted, { once: true });
      if (signal.aborted) aborted();
    });
  }
}

export function cameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  const messages: Record<string, string> = {
    NotAllowedError: 'Camera permission was denied. Allow camera access in browser/site settings, then try again.',
    NotFoundError: 'No camera was found. Connect a camera and refresh the camera list.',
    NotReadableError: 'The camera is unavailable or in use by another application.',
    OverconstrainedError: 'The selected camera is unavailable. Refresh the list and select another camera.',
    SecurityError: 'Camera access is blocked by browser security. Use localhost or HTTPS.',
  };
  return messages[name] ?? (error instanceof Error ? error.message : 'An unknown camera error occurred.');
}
