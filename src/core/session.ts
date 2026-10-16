import { initializeLandmarker, type InitializedLandmarker } from './landmarker';

/** Closes active and late-resolving tasks; never retains a cancelled initialization. */
export class LandmarkerOwner {
  private generation = 0;
  private active?: InitializedLandmarker;
  constructor(private initialize: () => Promise<InitializedLandmarker> = initializeLandmarker) {}
  async start(): Promise<InitializedLandmarker | null> {
    this.stop();
    const generation = this.generation;
    const result = await this.initialize();
    if (generation !== this.generation) {
      result.detector.close();
      return null;
    }
    this.active = result;
    return result;
  }
  stop() {
    this.generation++;
    const active = this.active;
    this.active = undefined;
    active?.detector.close();
  }
}
