import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { projectPoint, type Size } from './geometry';

// Anatomical chains and palm edges. Array positions describe one frame, not identities.
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];
export function drawOverlay(context: CanvasRenderingContext2D, result: HandLandmarkerResult, source: Size, viewport: Size, mirrored: boolean) {
  context.clearRect(0, 0, viewport.width, viewport.height);
  result.landmarks.forEach((landmarks, index) => {
    const points = landmarks.map(point => projectPoint(point, source, viewport, mirrored));
    context.save();
    context.strokeStyle = index === 0 ? '#9ce8c4' : '#ffc181';
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 2;
    context.beginPath();
    EDGES.forEach(([a, b]) => {
      if (!points[a] || !points[b]) return;
      context.moveTo(points[a].x, points[a].y);
      context.lineTo(points[b].x, points[b].y);
    });
    context.stroke();
    points.forEach(point => {
      context.beginPath(); context.arc(point.x, point.y, 3.5, 0, Math.PI * 2); context.fill();
    });
    if (points[0]) {
      context.font = '14px monospace';
      context.fillText(`Model: ${result.handedness[index]?.[0]?.categoryName ?? 'unknown'}`, points[0].x + 10, points[0].y - 10);
    }
    context.restore();
  });
}
