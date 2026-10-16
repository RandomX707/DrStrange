export interface Size { width: number; height: number }

export function containRect(source: Size, viewport: Size) {
  if (![source.width, source.height, viewport.width, viewport.height].every(n => Number.isFinite(n) && n > 0)) {
    throw new RangeError('Video and viewport dimensions must be positive and finite.');
  }
  const scale = Math.min(viewport.width / source.width, viewport.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return { x: (viewport.width - width) / 2, y: (viewport.height - height) / 2, width, height };
}

export function projectPoint(point: { x: number; y: number }, source: Size, viewport: Size, mirrored: boolean) {
  const rect = containRect(source, viewport);
  return { x: rect.x + (mirrored ? 1 - point.x : point.x) * rect.width, y: rect.y + point.y * rect.height };
}
