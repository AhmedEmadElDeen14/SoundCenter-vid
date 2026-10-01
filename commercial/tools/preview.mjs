import { chromium } from 'playwright-core';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const d = path.dirname(fileURLToPath(import.meta.url));
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CON', m.text()));
await p.goto('file://' + path.join(d, '../src/index.html'));
await p.evaluate(() => window.ready);
for (const t of times) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: `/tmp/w/a/f_${t.toFixed(2)}.png` }); console.log('shot', t); }
await b.close();
