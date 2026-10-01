// Parallel frame renderer → piped to ffmpeg. Usage: node render.mjs [workers] [fps]
import { chromium } from 'playwright-core';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const d = path.dirname(fileURLToPath(import.meta.url));
const WORKERS = +process.argv[2] || 4, FPS = +process.argv[3] || 30, DUR = 52.0;
const N = Math.round(DUR * FPS);
const out = path.join(d, '../build/frames'); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
let next = 0;
async function worker(id) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(d, '../src/index.html')); await p.evaluate(() => window.ready);
  for (;;) {
    const i = next++; if (i >= N) break;
    await p.evaluate(t => window.render(t), i / FPS);
    await p.screenshot({ path: path.join(out, `f_${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
    if (i % 60 === 0) console.log('frame', i, '/', N);
  }
  await b.close();
}
await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
console.log('done');
