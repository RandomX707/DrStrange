import { describe, expect, it } from 'vitest';
import { containRect, projectPoint } from '../src/core/geometry';

describe('display coordinates', () => {
  it('letterboxes 16:9 video in a square without cropping', () => {
    expect(containRect({ width: 1920, height: 1080 }, { width: 800, height: 800 }))
      .toEqual({ x: 0, y: 175, width: 800, height: 450 });
  });
  it('mirrors x once, preserving y and the source point', () => {
    const point = { x: 0.25, y: 0.2, z: -0.1 };
    expect(projectPoint(point, { width: 640, height: 480 }, { width: 800, height: 800 }, false))
      .toEqual({ x: 200, y: 220 });
    expect(projectPoint(point, { width: 640, height: 480 }, { width: 800, height: 800 }, true))
      .toEqual({ x: 600, y: 220 });
    expect(point.x).toBe(0.25);
  });
  it('handles portrait source and rejects unavailable dimensions', () => {
    expect(containRect({ width: 480, height: 640 }, { width: 800, height: 600 }))
      .toEqual({ x: 175, y: 0, width: 450, height: 600 });
    expect(() => containRect({ width: 0, height: 0 }, { width: 800, height: 600 })).toThrow();
  });
});
