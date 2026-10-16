import { initializeLandmarker, type Delegate, type InitializedLandmarker } from './landmarker';

/** Closes active and late-resolving tasks; never retains a cancelled initialization. */
export class LandmarkerOwner {
  private generation = 0;
  private active?: InitializedLandmarker;
  constructor(private initialize: (preferred?: Delegate) => Promise<InitializedLandmarker> = preferred => initializeLandmarker(undefined, preferred)) {}
  async start(preferred?: Delegate): Promise<InitializedLandmarker | null> {
    this.stop();
    const generation = this.generation;
    const result = await this.initialize(preferred);
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
