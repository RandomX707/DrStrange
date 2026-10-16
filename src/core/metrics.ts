const SAMPLE_LIMIT = 1800;
function percentile(values: number[], fraction: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}
export class SessionMetrics {
  private latencies: number[] = [];
  private renderGaps: number[] = [];
  private processedCount = 0;
  private renderedCount = 0;
  private previousRender?: number;
  constructor(private start: number) {}
  processed(latency: number) {
    this.processedCount++;
    this.latencies.push(latency);
    if (this.latencies.length > SAMPLE_LIMIT) this.latencies.shift();
  }
  rendered(timestamp: number) {
    this.renderedCount++;
    if (this.previousRender !== undefined) {
      this.renderGaps.push(timestamp - this.previousRender);
      if (this.renderGaps.length > SAMPLE_LIMIT) this.renderGaps.shift();
    }
    this.previousRender = timestamp;
  }
  snapshot(now: number) {
    const seconds = Math.max(0, now - this.start) / 1000;
    return {
      elapsedSeconds: seconds,
      processedFrames: this.processedCount,
      processedFps: seconds > 0 ? this.processedCount / seconds : 0,
      renderedCallbacks: this.renderedCount,
      renderedFps: seconds > 0 ? this.renderedCount / seconds : 0,
      inference: {
        latestMs: this.latencies.at(-1) ?? null,
        meanMs: this.latencies.length ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length : null,
        p50Ms: percentile(this.latencies, 0.5), p95Ms: percentile(this.latencies, 0.95),
        sampleCount: this.latencies.length,
      },
      renderGapP95Ms: percentile(this.renderGaps, 0.95),
    };
  }
}
export type MetricsSnapshot = ReturnType<SessionMetrics['snapshot']>;
