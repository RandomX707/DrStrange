import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
export type Detector = Pick<HandLandmarker, 'close' | 'detectForVideo'>;
export type Delegate = 'GPU' | 'CPU';
export interface InitializedLandmarker {
  detector: Detector;
  delegate: Delegate;
  initializationMs: number;
  fallbackReason?: string;
}

// A fresh task per attempt; no recognition model is loaded.
async function createDetector(delegate: Delegate): Promise<Detector> {
  const files = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
  return HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: '/models/hand_landmarker.task', delegate },
    runningMode: 'VIDEO', numHands: 2,
    minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5,
  });
}

export async function initializeLandmarker(
  create: (delegate: Delegate) => Promise<Detector> = createDetector,
): Promise<InitializedLandmarker> {
  const started = performance.now();
  try {
    const detector = await create('GPU');
    return { detector, delegate: 'GPU', initializationMs: performance.now() - started };
  } catch (gpuError) {
    const fallbackReason = gpuError instanceof Error ? gpuError.message : String(gpuError);
    try {
      const detector = await create('CPU');
      return { detector, delegate: 'CPU', initializationMs: performance.now() - started, fallbackReason };
    } catch (cpuError) {
      throw new Error(`Landmarker initialization failed. GPU: ${fallbackReason}; CPU: ${cpuError instanceof Error ? cpuError.message : String(cpuError)}. Run npm run assets:prepare and check the browser console.`, { cause: cpuError });
    }
  }
}
