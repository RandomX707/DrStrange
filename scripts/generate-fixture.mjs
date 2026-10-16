import { mkdir, writeFile } from 'node:fs/promises';
// Original synthetic luma bars: no person, no hands, no external imagery.
const width = 640, height = 480, frames = 60;
const chunks = [Buffer.from(`YUV4MPEG2 W${width} H${height} F30:1 Ip A1:1 C420jpeg\n`)];
for (let frame = 0; frame < frames; frame++) {
  const y = Buffer.alloc(width * height);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) y[row * width + col] = 32 + ((Math.floor(col / 80) * 24 + frame * 2) % 190);
  }
  chunks.push(Buffer.from('FRAME\n'), y, Buffer.alloc(width * height / 2, 128));
}
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/no-hands.y4m', Buffer.concat(chunks));
console.log('Generated artifacts/no-hands.y4m: synthetic 640x480, 30 FPS, 60 frames; not a hand benchmark.');
