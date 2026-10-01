/* Sound Center commercial — deterministic frame engine. window.render(t) draws video-time t (seconds).
   All timings are authored in VOICE-OVER time (v) — video time = v - OFF. */
const OFF = 1.2;
const END_V = 53.2;
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (v, a, b) => clamp((v - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  outCubic: x => 1 - Math.pow(1 - x, 3),
  outQuart: x => 1 - Math.pow(1 - x, 4),
  inCubic: x => x * x * x,
  inOutCubic: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  inOutQuart: x => x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  outBack: x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const rnd = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const env = v => { const i = Math.max(0, Math.min(ENV.length - 1, Math.round(v * 60))); return ENV[i] || 0; };
function tf(e, o) {
  const { x = 0, y = 0, s = 1, sx = s, sy = s, r = 0, op = 1 } = o;
  e.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${sx},${sy})`;
  e.style.opacity = op;
}
const show = (e, on) => { e.style.visibility = on ? 'visible' : 'hidden'; };
const rise = (e, p) => { e.style.transform = `translateY(${(1 - p) * 118}%)`; };

/* ---------- scene windows (voice time) ---------- */
const W = {
  A: [0, 9.95], B: [9.95, 11.65], C: [11.65, 20.9], D: [20.9, 26.0], E: [26.0, 31.3],
  F: [31.3, 38.45], G: [38.45, 41.7], H: [41.7, 48.55], I: [48.55, END_V],
};
const inW = (v, k) => v >= W[k][0] && v < W[k][1];

/* ---------- build static DOM ---------- */
document.body.insertAdjacentHTML('afterbegin', DEFS);

// product rail
const rail = $('prodWrap');
PRODUCT_LIST.forEach((p, i) => {
  const d = document.createElement('div'); d.className = 'prod'; d.id = 'pr' + i;
  d.innerHTML = `<svg viewBox="0 0 800 600">${PRODUCTS[p.key]}</svg>`;
  rail.appendChild(d);
});
const ticks = $('cTicks');
ticks.innerHTML = PRODUCT_LIST.map((_, i) => `<div style="position:absolute;left:${i * 88}px;top:0;width:76px;height:6px;background:rgba(255,255,255,.2)"><div class="tk" style="height:6px;background:#CE1E20;transform-origin:left;transform:scaleX(0)"></div></div>`).join('');

// grid cards
const GRID_POS = [[550, 400], [90, 400], [550, 812], [90, 812], [550, 1224], [90, 1224]]; // RTL: first card top-right
const gridWrap = $('cGridWrap');
const cards = PRODUCT_LIST.map((p, i) => {
  const c = document.createElement('div'); c.className = 'card';
  c.style.left = GRID_POS[i][0] + 'px'; c.style.top = GRID_POS[i][1] + 'px';
  c.innerHTML = `<svg viewBox="0 0 800 600">${PRODUCTS[p.key].replace(/ id="[^"]*"/g, '')}</svg><div class="cl"><div class="en">${p.en}</div><div class="ar">${p.ar}</div></div>`;
  gridWrap.appendChild(c); return c;
});
const gWire = $('gWire');
{
  const pts = GRID_POS.map(([x, y]) => [x + 220, y + 192]);
  const d = 'M' + [pts[0], pts[1], pts[3], pts[2], pts[4], pts[5]].map(p => p.join(' ')).join(' L');
  gWire.innerHTML = `<path id="gWireP" d="${d}" fill="none" stroke="#CE1E20" stroke-width="5" stroke-linejoin="round"/>` + pts.map((p, i) => `<circle class="gdot" cx="${p[0]}" cy="${p[1]}" r="11" fill="#CE1E20" stroke="#fff" stroke-width="3"/>`).join('');
}

// bus side-view blueprint (shared by D and H)
const NODE_DEFS = [
  { t: 'cam', x: 80, y: 66 }, { t: 'spk', x: 190, y: 62 }, { t: 'scr', x: 300, y: 62 }, { t: 'spk', x: 410, y: 62 },
  { t: 'scr', x: 520, y: 62 }, { t: 'spk', x: 630, y: 62 }, { t: 'scr', x: 740, y: 62 }, { t: 'cam', x: 830, y: 66 },
  { t: 'amp', x: 100, y: 196 }, { t: 'dvd', x: 180, y: 196 }, { t: 'mic', x: 888, y: 168 },
];
const glyph = {
  cam: `<path d="M-14 6 A14 14 0 0 1 14 6 Z" class="f"/><circle cy="-2" r="4" fill="#fff"/>`,
  spk: `<circle r="13" class="f"/><circle r="5" fill="#fff"/>`,
  scr: `<rect x="-20" y="-6" width="40" height="26" rx="3" class="f"/><rect x="-14" y="-1" width="28" height="16" fill="#111" opacity=".6"/>`,
  amp: `<rect x="-26" y="-12" width="52" height="24" rx="3" class="f"/><circle cx="-12" r="4" fill="#fff"/><circle cx="2" r="4" fill="#fff"/><rect x="12" y="-4" width="10" height="8" fill="#fff"/>`,
  dvd: `<rect x="-26" y="-9" width="52" height="18" rx="3" class="f"/><rect x="-16" y="-3" width="20" height="6" fill="#fff"/><circle cx="14" r="3.5" fill="#fff"/>`,
  mic: `<rect x="-7" y="-20" width="14" height="26" rx="7" class="f"/><path d="M-12 -2 Q-12 12 0 12 Q12 12 12 -2 M0 12 V22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
};
const WIRE_A = 'M100 196 V58 H830';
const WIRE_B = 'M180 196 V150 H100';
const WIRE_C = 'M830 58 H888 V160';
function busSVG(p) {
  const wins = Array.from({ length: 9 }, (_, i) => `<rect x="${70 + i * 86}" y="78" width="70" height="60" rx="8"/>`).join('');
  return `<svg viewBox="0 0 1000 330" width="1000" height="330" style="overflow:visible">
  <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <g class="${p}body" opacity=".85">
      <path id="${p}shell" d="M30 262 L30 66 Q30 34 62 34 L842 34 Q896 34 924 92 L968 178 Q978 200 978 224 L978 262 Z" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
      <g opacity=".5">${wins}</g>
      <path d="M858 78 H902 L942 150 H858 Z" opacity=".6"/>
      <rect x="868" y="158" width="62" height="64" rx="4" opacity=".6"/>
      <path d="M46 222 H978" opacity=".35"/><path d="M46 58 H850" opacity=".35" stroke-dasharray="10 8"/>
      <circle cx="190" cy="262" r="44" fill="#111"/><circle cx="190" cy="262" r="24"/><circle cx="760" cy="262" r="44" fill="#111"/><circle cx="760" cy="262" r="24"/>
      <path d="M0 306 H1000" opacity=".3" stroke-dasharray="4 10"/>
      <path d="M30 322 H978 M30 314 V330 M978 314 V330" opacity=".35" stroke-width="1.6"/>
    </g>
    <path id="${p}wA" d="${WIRE_A}" stroke="#CE1E20" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    <path id="${p}wB" d="${WIRE_B}" stroke="#CE1E20" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    <path id="${p}wC" d="${WIRE_C}" stroke="#CE1E20" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    <circle id="${p}pulse" r="9" fill="#fff" stroke="none" opacity="0"/>
  </g>
  ${NODE_DEFS.map((n, i) => `<g class="${p}nd" data-i="${i}" transform="translate(${n.x} ${n.y})" style="--lit:0"><g fill="rgb(206 30 32 / var(--lit))" stroke="#fff" stroke-width="2.4" style="--f:1">${glyph[n.t].replace(/class="f"/g, 'class="f"')}</g></g>`).join('')}
  </svg>`;
}
$('dBus').innerHTML = busSVG('d'); $('hBus').innerHTML = busSVG('h');
const busNodes = p => [...document.querySelectorAll('.' + p + 'nd')];
const nodeFill = (n, lit) => { n.style.setProperty('--lit', lit); n.style.opacity = 0.35 + 0.65 * Math.min(1, lit * 3 + 0.0); };

// services rows
const SVC = [
  { ar: 'توريد', en: 'Supply', n: '01', at: 22.0 },
  { ar: 'تركيب', en: 'Installation', n: '02', at: 22.78 },
  { ar: 'صيانة', en: 'Maintenance', n: '03', at: 23.42 },
];
const dRows = $('dRows');
dRows.innerHTML = SVC.map((s, i) => `<div class="svcRow" style="position:absolute;left:70px;top:${290 + i * 220}px;width:940px;height:190px;overflow:hidden">
  <div class="rbg" style="position:absolute;inset:0;background:var(--red);transform-origin:right;transform:scaleX(0)"></div>
  <div style="position:absolute;inset:0;border:1.5px solid rgba(255,255,255,.18)"></div>
  <div class="en" style="position:absolute;left:34px;top:40px;font-size:24px;letter-spacing:5px;font-weight:700;opacity:.8">${s.n}</div>
  <div class="en" style="position:absolute;left:34px;bottom:34px;font-size:30px;letter-spacing:6px;font-weight:700">${s.en}</div>
  <div class="ar rt" style="position:absolute;right:40px;top:0;font-size:150px;line-height:190px;height:190px">${s.ar}</div>
</div>`).join('');

// warranty
const SHIELD = 'M540 40 L860 140 L860 440 Q860 700 540 880 Q220 700 220 440 L220 140 Z';
$('eShield').innerHTML = `
  <defs><linearGradient id="gShield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E52A2C"/><stop offset="1" stop-color="#9c1416"/></linearGradient></defs>
  <path id="eFill" d="${SHIELD}" fill="url(#gShield)" opacity="0"/>
  <path d="M540 80 L822 168 L822 440 Q822 676 540 838 Q258 676 258 440 L258 168 Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" id="eInner" opacity="0"/>
  <path id="eStroke" d="${SHIELD}" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
  <path id="eCheck" d="M395 450 L503 560 L700 330" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`;
const pill = (ar, en) => `<div style="height:120px;border:1.5px solid rgba(255,255,255,.28);border-radius:60px;background:rgba(255,255,255,.06);position:relative;padding-top:12px">
  <div class="ar" style="font-size:54px;line-height:60px">${ar}</div><div class="tag" style="font-size:20px;letter-spacing:6px;margin-top:2px">${en}</div>
  <div class="ck" style="position:absolute;left:18px;top:30px;width:60px;height:60px;border-radius:50%;background:var(--red)"><svg width="60" height="60" viewBox="0 0 60 60"><path d="M16 31 L26 41 L44 20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`;
$('ePillL').innerHTML = pill('الجهاز', 'Equipment'); $('ePillR').innerHTML = pill('التركيب', 'Installation');
$('eStatus').innerHTML = `<div style="position:absolute;inset:0;border-radius:16px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.2)"></div>
  <svg width="940" height="150" style="position:absolute;left:0;top:0"><path id="eEkg" d="M30 90 H230 L262 90 L290 40 L326 130 L356 90 H470 L500 90 L528 54 L560 120 L586 90 H910" fill="none" stroke="#CE1E20" stroke-width="5" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
  <div class="ar" id="eStT" style="position:absolute;right:34px;top:18px;font-size:48px;line-height:56px">النظام شغّال</div>
  <div class="tag" id="eStE" style="position:absolute;left:34px;top:22px;font-size:20px;letter-spacing:6px"><span id="eDot" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--red);margin-right:12px;vertical-align:-1px"></span>System operational</div>`;

// climax stations
const STN = [
  { ar: 'المنتج', en: 'Product', at: 44.85 }, { ar: 'التركيب', en: 'Installation', at: 45.75 },
  { ar: 'الصيانة', en: 'Maintenance', at: 46.7 }, { ar: 'الضمان', en: 'Warranty', at: 47.62 },
];
$('hSt').innerHTML = `<svg width="1020" height="320" style="position:absolute;left:0;top:0;overflow:visible"><path id="hSLine" d="M990 60 H30" stroke="#CE1E20" stroke-width="6" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>` +
  STN.map((s, i) => `<div class="stn" style="position:absolute;left:${765 - i * 245}px;top:0;width:225px;height:320px">
    <div class="sd" style="position:absolute;left:92px;top:34px;width:52px;height:52px;border-radius:50%;background:#111;border:5px solid #fff"></div>
    <div class="sc" style="position:absolute;left:0;top:130px;width:225px;height:150px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.05);overflow:hidden">
      <div class="sbg" style="position:absolute;inset:0;background:var(--red);transform-origin:bottom;transform:scaleY(0)"></div>
      <div class="ar" style="position:absolute;left:0;right:0;top:20px;font-size:58px;line-height:66px">${s.ar}</div>
      <div class="en" style="position:absolute;left:0;right:0;bottom:22px;text-align:center;font-size:19px;letter-spacing:4px;font-weight:700">${s.en}</div></div></div>`).join('');

// lockup services
const LSV = ['توريد', 'تركيب', 'صيانة', 'ضمان'];
$('iSvc').innerHTML = LSV.map((w, i) => `${i ? '<span class="isep" style="display:inline-block;width:5px;height:48px;background:var(--red);margin:0 26px;transform-origin:center"></span>' : ''}<span class="ar isv" style="font-size:62px;display:inline-block">${w}</span>`).join('');
$('iFrame').innerHTML = `<svg width="988" height="1620" style="overflow:visible"><rect id="iFr" x="1" y="1" width="986" height="1618" fill="none" stroke="#CE1E20" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;

// waveform
const NB = 60;
$('wave').innerHTML = Array.from({ length: NB }, (_, i) => `<rect x="${i * 16}" y="46" width="8" height="8" rx="2" fill="#fff"/>`).join('');
const waveBars = [...$('wave').children];

// grain tiles
const gctx = $('grain').getContext('2d');
const grainTiles = Array.from({ length: 4 }, (_, k) => {
  const c = document.createElement('canvas'); c.width = 540; c.height = 960; const x = c.getContext('2d');
  const im = x.createImageData(540, 960);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd(i * 0.37 + k * 999) - .5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0); return c;
});

/* ---------- interior renderer ---------- */
const bus = $('bus'), bc = bus.getContext('2d');
function quad(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }
function drawBus(cfg) {
  const c = bc, cx = 540 + (cfg.dx || 0), cy = cfg.cy, f = cfg.f, zc = cfg.zc, T = cfg.T;
  const P = (X, Y, z) => [cx + X * f / z, cy + Y * f / z];
  const HW = 1.25, YC = -1.05, YF = 0.95, ZN = 1.2, ZF = 17;
  c.save(); c.globalAlpha = 1; c.fillStyle = '#060606'; c.fillRect(0, 0, 1080, 1920);
  // ceiling / floor / walls
  let g = c.createLinearGradient(0, 0, 0, cy); g.addColorStop(0, '#040404'); g.addColorStop(1, '#202020');
  c.fillStyle = g; quad(c, [P(-HW, YC, ZN), P(HW, YC, ZN), P(HW, YC, ZF), P(-HW, YC, ZF)]); c.fill();
  g = c.createLinearGradient(0, cy, 0, 1920); g.addColorStop(0, '#303030'); g.addColorStop(.5, '#0c0c0c'); g.addColorStop(1, '#030303');
  c.fillStyle = g; quad(c, [P(-HW, YF, ZN), P(HW, YF, ZN), P(HW, YF, ZF), P(-HW, YF, ZF)]); c.fill();
  [-1, 1].forEach(sd => {
    g = c.createLinearGradient(sd < 0 ? 0 : 1080, 0, cx, 0); g.addColorStop(0, '#050505'); g.addColorStop(1, '#262626');
    c.fillStyle = g; quad(c, [P(sd * HW, YC, ZN), P(sd * HW, YF, ZN), P(sd * HW, YF, ZF), P(sd * HW, YC, ZF)]); c.fill();
  });
  // rear window (end of the cabin, bright)
  const wb = cfg.bright;
  g = c.createLinearGradient(0, P(0, -0.8, ZF)[1], 0, P(0, 0.35, ZF)[1]); g.addColorStop(0, `rgba(255,255,255,${.95 * wb})`); g.addColorStop(1, `rgba(255,255,255,${.7 * wb})`);
  c.fillStyle = g; c.shadowColor = '#fff'; c.shadowBlur = 90; quad(c, [P(-1.15, -.85, ZF), P(1.15, -.85, ZF), P(1.15, .35, ZF), P(-1.15, .35, ZF)]); c.fill(); c.shadowBlur = 0;
  // windows (daylight) + floor light pools
  const wp = 1.6;
  for (let i = -1; i < 13; i++) {
    const z0 = 1.0 + i * wp - (zc % wp), z1 = z0 + 1.05; if (z1 < ZN || z0 > ZF) continue;
    const a = Math.pow(1 - clamp(z0 / ZF), .7) * .62 + .1;
    [-1, 1].forEach(sd => {
      const za = Math.max(z0, ZN), zb = Math.min(z1, ZF);
      c.fillStyle = `rgba(255,255,255,${a * wb})`; quad(c, [P(sd * HW, -.62, za), P(sd * HW, 0.05, za), P(sd * HW, 0.05, zb), P(sd * HW, -.62, zb)]); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.9)'; c.lineWidth = 3; c.stroke();
    });
  }
  // luggage racks + red LED guide lines
  [-1, 1].forEach(sd => {
    c.fillStyle = '#0c0c0c'; quad(c, [P(sd * .62, YC, ZN), P(sd * .62, YC + .3, ZN), P(sd * .62, YC + .3, ZF), P(sd * .62, YC, ZF)]); c.fill();
    c.fillStyle = '#171717'; quad(c, [P(sd * HW, YC + .3, ZN), P(sd * .62, YC + .3, ZN), P(sd * .62, YC + .3, ZF), P(sd * HW, YC + .3, ZF)]); c.fill();
    const lit = cfg.led;
    c.save(); c.shadowColor = '#CE1E20'; c.shadowBlur = 26; c.fillStyle = `rgba(206,30,32,${lit})`;
    const zEnd = lerp(ZN + .1, ZF, cfg.ledGrow == null ? 1 : cfg.ledGrow);
    quad(c, [P(sd * .62, YC + .3 - .014, ZN + .1), P(sd * .62, YC + .3 + .016, ZN + .1), P(sd * .62, YC + .3 + .016, zEnd), P(sd * .62, YC + .3 - .014, zEnd)]); c.fill(); c.restore();
  });
  // ceiling centre strip + flip-down screens
  c.fillStyle = 'rgba(255,255,255,.75)';
  for (let i = -1; i < 14; i++) { const z0 = 1.2 + i * 1.5 - (zc % 1.5), z1 = z0 + .75; if (z1 < ZN || z0 > ZF) continue; quad(c, [P(-.05, YC, Math.max(z0, ZN)), P(.05, YC, Math.max(z0, ZN)), P(.05, YC, z1), P(-.05, YC, z1)]); c.fill(); }
  const sp = 4.5;
  for (let i = 3; i >= -1; i--) {
    const z = 3.2 + i * sp - (zc % sp); if (z < ZN + .6 || z > ZF - .5) continue;
    const idx = Math.round((zc - (zc % sp)) / sp) + i;
    const lit = clamp((cfg.screens - (1 - clamp(z / ZF)) * 0) * 1, 0, 1) * clamp(1.4 - z / 14);
    const [x0, y0] = P(-.34, YC, z), [x1, y1] = P(.34, YC + .42, z);
    c.fillStyle = '#080808'; c.fillRect(x0 - 4, y0, x1 - x0 + 8, y1 - y0 + 6);
    c.save(); c.shadowColor = '#fff'; c.shadowBlur = 50 * lit; c.fillStyle = `rgba(255,255,255,${.12 + .85 * lit})`; c.fillRect(x0, y0 + 2, x1 - x0, y1 - y0 - 4); c.restore();
    c.fillStyle = `rgba(206,30,32,${.9 * lit})`; c.fillRect(x0, y1 - (y1 - y0) * .16, (x1 - x0) * (.3 + .6 * ((Math.sin(T * 1.3 + idx) + 1) / 2)), (y1 - y0) * .09);
  }
  // seats (far -> near)
  const ss = 1.35;
  for (let i = 12; i >= -1; i--) {
    const z = 1.45 + i * ss - (zc % ss); if (z < ZN + .15 || z > ZF - .2) continue;
    [-1, 1].forEach(sd => {
      const xa = .46 * sd, xb = 1.17 * sd;
      const [ax, ay] = P(Math.min(xa, xb), -.28, z), [bx, by] = P(Math.max(xa, xb), .62, z);
      const w = bx - ax, h = by - ay;
      let gg = c.createLinearGradient(sd < 0 ? ax : bx, 0, sd < 0 ? bx : ax, 0); gg.addColorStop(0, '#242424'); gg.addColorStop(1, '#0a0a0a');
      c.fillStyle = gg; c.beginPath(); c.roundRect(ax, ay, w, h, Math.min(w, h) * .12); c.fill();
      // base
      const [cx0, cy0] = P(Math.min(.58 * sd, 1.1 * sd), .62, z), [cx1, cy1] = P(Math.max(.58 * sd, 1.1 * sd), .95, z);
      c.fillStyle = '#080808'; c.fillRect(cx0, cy0 - 1, cx1 - cx0, cy1 - cy0 + 1);
      // headrest panel
      c.fillStyle = 'rgba(255,255,255,.055)'; c.beginPath(); c.roundRect(ax + w * .12, ay + h * .06, w * .76, h * .24, w * .06); c.fill();
      // rim light
      c.strokeStyle = `rgba(255,255,255,${.34 * (1 - z / ZF)})`; c.lineWidth = Math.max(1.5, 5 * 1.2 / z); c.beginPath(); c.moveTo(ax + 6, ay + 1); c.lineTo(bx - 6, ay + 1); c.stroke();
      // red stitching
      c.strokeStyle = `rgba(206,30,32,${.85 * (1 - z / (ZF + 3))})`; c.lineWidth = Math.max(1, 6 / z); c.beginPath(); c.moveTo(ax + w * .18, ay + h * .46); c.lineTo(bx - w * .18, ay + h * .46); c.stroke();
    });
  }
  // volumetric glow from the rear window
  c.globalCompositeOperation = 'screen';
  const vp = P(0, -0.2, ZF);
  g = c.createRadialGradient(vp[0], vp[1], 0, vp[0], vp[1], 560 * (cfg.glow || 1)); g.addColorStop(0, `rgba(255,255,255,${.5 * wb})`); g.addColorStop(.35, `rgba(255,255,255,${.12 * wb})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  // anamorphic streak
  g = c.createLinearGradient(0, 0, 1080, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.55 * wb * (cfg.streak == null ? 1 : cfg.streak)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, vp[1] - 2, 1080, 4);
  // dust
  for (let i = 0; i < 46; i++) {
    const px = rnd(i + 1) * 1080, py = ((rnd(i + 70) * 1920 - T * (14 + rnd(i + 9) * 22)) % 1920 + 1920) % 1920;
    c.fillStyle = `rgba(255,255,255,${.1 + rnd(i + 3) * .28})`; c.beginPath(); c.arc(px + Math.sin(T + i) * 6, py, .8 + rnd(i + 5) * 2, 0, 7); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  c.restore();
  if (cfg.dim) { c.fillStyle = `rgba(17,17,17,${cfg.dim})`; c.fillRect(0, 0, 1080, 1920); }
}

/* ---------- transitions ---------- */
const wipe = $('wipe');
wipe.innerHTML = `
  <div id="wR" style="position:absolute;top:-300px;height:2500px;width:1500px;background:#CE1E20;transform:skewX(-14deg)"></div>
  <div id="wK" style="position:absolute;top:-300px;height:2500px;width:1500px;background:#111;transform:skewX(-14deg)"></div>
  <div id="wW" style="position:absolute;top:-300px;height:2500px;width:14px;background:#fff;transform:skewX(-14deg)"></div>
  <div id="wF" style="position:absolute;inset:0;background:#fff;opacity:0"></div>
  <div id="wS" style="position:absolute;inset:0"></div>
  <div id="wC" style="position:absolute;left:540px;top:960px;width:10px;height:10px;margin:-5px;border-radius:50%;background:#CE1E20;opacity:0"></div>`;
const wR = $('wR'), wK = $('wK'), wW = $('wW'), wF = $('wF'), wS = $('wS'), wC = $('wC');
wS.innerHTML = Array.from({ length: 8 }, (_, i) => `<div style="position:absolute;left:0;width:1080px;top:${i * 240}px;height:241px;background:${i % 2 ? '#111' : '#CE1E20'};transform:translateX(-1100px)"></div>`).join('');
const slatEls = [...wS.children];
const SLASH = [[11.65, 1], [26.0, -1], [31.3, 1], [41.7, -1]];
const SLATS = [20.9, 38.45];
function drawWipes(v) {
  let any = false;
  [wR, wK, wW].forEach(e => e.style.display = 'none');
  SLASH.forEach(([t0, dir]) => {
    const p = seg(v, t0 - .3, t0 + .3);
    if (p > 0 && p < 1) {
      any = true; const q = E.inOutQuart(p);
      const x = dir > 0 ? lerp(-1900, 1900, q) : lerp(1900, -1900, q);
      wR.style.display = wK.style.display = wW.style.display = 'block';
      wR.style.left = x + 'px'; wK.style.left = (x - dir * 180) + 'px';
      wW.style.left = (x + (dir > 0 ? 1500 : -14)) + 'px';
    }
  });
  slatEls.forEach(s => s.style.transform = 'translateX(-1100px)');
  SLATS.forEach(t0 => {
    slatEls.forEach((s, i) => {
      const pin = seg(v, t0 - .34 + i * .018, t0 - .06 + i * .018), pout = seg(v, t0 + .02 + i * .018, t0 + .32 + i * .018);
      if (pin > 0 && pout < 1) s.style.transform = `translateX(${lerp(-1100, 0, E.outCubic(pin)) + lerp(0, 1100, E.inCubic(pout))}px)`;
    });
  });
  // flash A→B
  const fp = 1 - Math.abs(seg(v, 9.7, 10.0) * 2 - 1); wF.style.opacity = (v > 9.7 && v < 10.0) ? E.outCubic(fp) : 0;
  // red iris H→I
  const ip = seg(v, 48.25, 48.6), io = seg(v, 48.6, 48.95);
  if (v > 48.25 && v < 48.95) { const s = ip < 1 ? lerp(1, 330, E.inOutCubic(ip)) : 330; wC.style.opacity = 1; wC.style.transform = `scale(${io > 0 ? lerp(330, 0, E.inOutCubic(io)) : s})`; } else wC.style.opacity = 0;
}

/* ---------- scenes ---------- */
function sceneA(v) {
  const on = inW(v, 'A'); show($('sA'), on); if (!on) return;
  const fade = E.outCubic(seg(v, 0, 1.6));
  const rush = E.inCubic(seg(v, 8.6, 9.95));
  drawBus({ T: v, zc: v * .85 + rush * 6, f: lerp(1400, 1700, E.inOutCubic(seg(v, 0, 9.95))) + rush * 700, cy: 800 + Math.sin(v * .7) * 7, dx: Math.sin(v * .5) * 10,
    bright: fade * (1 + rush * .6), led: fade, ledGrow: E.outExpo(seg(v, .2, 2.2)), screens: E.outCubic(seg(v, 7.8, 9.3)) * .95, glow: 1 + rush, streak: 1 });
  // headline 1
  const p1 = E.outExpo(seg(v, 3.05, 3.65)), o1 = E.inCubic(seg(v, 6.0, 6.4));
  rise($('aQt'), p1 * (1 - o1)); $('aQbar').style.transform = `scaleX(${E.outExpo(seg(v, 3.5, 4.3)) * (1 - o1)})`;
  $('aQ').style.visibility = v > 3.0 && v < 6.45 ? 'visible' : 'hidden';
  // headline 2
  const q = v > 6.5; $('aOne').style.visibility = q ? 'visible' : 'hidden';
  rise($('aOneT'), E.outExpo(seg(v, 6.6, 7.2))); rise($('aOneS'), E.outExpo(seg(v, 8.0, 8.5)));
  tf($('aOneTag'), { op: E.outCubic(seg(v, 7.0, 7.6)) }); $('aOneTag').style.letterSpacing = lerp(24, 9, E.outExpo(seg(v, 7.0, 8.2))) + 'px';
  const exit = E.inCubic(seg(v, 9.4, 9.85)); $('aOne').style.opacity = 1 - exit;
}
function sceneB(v) {
  const on = inW(v, 'B'); show($('sB'), on); if (!on) return;
  const t = v - 10.28;
  const k = E.outBack(seg(v, 10.2, 10.6));
  const s = lerp(2.2, 1, E.outExpo(seg(v, 10.2, 10.7)));
  tf($('bLogo'), { s: s * (1 + .01 * Math.sin(v * 3)), op: seg(v, 10.2, 10.3) });
  $('bLogo').style.left = '290px';
  const rp = seg(v, 10.3, 11.0);
  ['bR1', 'bR2'].forEach((id, i) => { const e = $(id); e.setAttribute('r', 200 + E.outExpo(rp) * (i ? 520 : 760)); e.setAttribute('opacity', (1 - rp) * (i ? .7 : 1)); });
  tf($('bGlow'), { s: lerp(.6, 1.15, E.outCubic(seg(v, 10.2, 11.5))), op: E.outCubic(seg(v, 10.2, 10.6)) });
  rise($('bNameT'), E.outExpo(seg(v, 10.5, 10.95)));
  $('bNameT').style.letterSpacing = lerp(30, 6, E.outExpo(seg(v, 10.5, 11.3))) + 'px';
  tf($('bTag'), { op: E.outCubic(seg(v, 10.8, 11.2)), y: lerp(14, 0, E.outCubic(seg(v, 10.8, 11.2))) });
  $('sB').style.opacity = 1 - E.inCubic(seg(v, 11.4, 11.65));
  // slight camera creep
  $('bLogo').style.top = (480 - (v - 10.2) * 8) + 'px';
}
const BEATS = [11.65, 13.25, 14.15, 15.2, 16.25, 16.85, 17.5];
function sceneC(v) {
  const on = inW(v, 'C'); show($('sC'), on); if (!on) return;
  const inRail = v < 17.55;
  $('prodWrap').style.display = inRail ? 'block' : 'none'; $('cLabel').style.display = inRail ? 'block' : 'none';
  $('cGhost').style.display = inRail ? 'block' : 'none'; $('cFloor').style.display = inRail ? 'block' : 'none'; $('cTicks').style.display = inRail ? 'block' : 'none';
  $('cScan').style.display = inRail ? 'block' : 'none';
  $('spot').style.opacity = inRail ? 1 : .55; show($('spot'), true);
  let idx = 0; for (let i = 0; i < 6; i++) if (v >= BEATS[i]) idx = i;
  if (inRail) {
    const start = BEATS[idx], dur = .42;
    PRODUCT_LIST.forEach((p, i) => {
      const el = $('pr' + i);
      let vis = false, x = 0, s = 1, op = 1, rx = 0, ry = 0, blur = 0;
      if (i === idx) {
        vis = true; const pin = idx === 0 ? seg(v, start + .1, start + .6) : seg(v, start, start + dur);
        const e = E.outExpo(pin); x = lerp(i === 0 ? 0 : 380, 0, e); s = lerp(i === 0 ? 1 : 1.12, 1, e); op = idx === 0 ? 1 : clamp(pin * 3);
        ry = lerp(i === 0 ? 0 : -22, 0, e) + Math.sin(v * 1.4) * 4; rx = Math.cos(v * 1.1) * 2;
        blur = (1 - e) * 10;
      } else if (i === idx - 1) {
        const pout = seg(v, BEATS[idx], BEATS[idx] + .3);
        if (pout < 1) { vis = true; const e = E.inCubic(pout); x = -520 * e; s = 1 - .12 * e; op = 1 - e; ry = 24 * e; blur = e * 12; }
      }
      show(el, vis);
      if (vis) {
        let fy = Math.sin(v * 1.6 + i) * 9;
        el.style.transform = `translate(${x}px,${fy}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`; el.style.opacity = op; el.style.filter = blur > .5 ? `blur(${blur}px)` : 'none';
      }
    });
    // flip-down motion for the screen
    { const el = $('pr0').querySelector('svg'); const p = E.outBack(seg(v, 11.7, 12.35)); el.style.transformOrigin = '50% 4%'; el.style.transform = `perspective(1400px) rotateX(${lerp(-96, 0, p)}deg)`;
      const bar = $('pr0').querySelector('#scrBar'), kn = $('pr0').querySelector('#scrKnob'); const w = 140 + 200 + (v - 12) * 38; bar.setAttribute('width', w - 140); kn.setAttribute('cx', w); }
    // speaker cone + amp meters + dvd + mic + camera
    { const e = env(v); const cone = $('pr1').querySelector('#spkCone'); cone.style.transform = `scale(${1 + e * .07})`; }
    { const e = env(v), seg1 = [...$('pr2').querySelectorAll('.ampSeg')], seg2 = [...$('pr2').querySelectorAll('.ampSeg2')];
      seg1.forEach((s, i) => { const lit = i < Math.round(e * 14 * .95 + 1); s.setAttribute('fill', lit ? (i > 10 ? '#CE1E20' : '#fff') : '#fff'); s.setAttribute('opacity', lit ? 1 : .18); });
      seg2.forEach((s, i) => { const lit = i < Math.round(env(v + .05) * 14 * .85 + 1); s.setAttribute('fill', lit ? (i > 10 ? '#CE1E20' : '#fff') : '#fff'); s.setAttribute('opacity', lit ? 1 : .18); }); }
    { const d = $('pr3'); d.querySelector('#dvdSpin').setAttribute('transform', `rotate(${v * 260})`);
      const tt = Math.floor((v - 15) * 7 + 3600 * 0 + 72); d.querySelector('#dvdTime').textContent = `00:${String(Math.floor(tt / 60) % 60).padStart(2, '0')}:${String(tt % 60).padStart(2, '0')}`;
      const rs = E.outExpo(seg(v, 15.2, 15.75)); d.querySelector('#dvdDisc').setAttribute('transform', `translate(400 ${lerp(300, 206, rs)})`); }
    { const c = $('pr5').querySelector('#camRec'); c.setAttribute('opacity', Math.sin(v * 7) > 0 ? 1 : .25); }
    // label
    const p = PRODUCT_LIST[idx]; const lp = E.outExpo(seg(v, BEATS[idx] + .08, BEATS[idx] + .4));
    if ($('cAr').dataset.k !== p.key) { $('cAr').textContent = p.ar; $('cEn').textContent = p.en; $('cAr').dataset.k = p.key; $('cGhost').textContent = String(idx + 1).padStart(2, '0'); }
    rise($('cAr'), lp); rise($('cEn'), clamp(lp * 1.2 - .15));
    $('cEn').style.letterSpacing = lerp(16, 7, lp) + 'px';
    $('cEn').style.fontSize = (p.en.length > 14 ? 40 : 50) + 'px';
    // scan bar at each switch
    let sc = -1; BEATS.slice(1, 6).forEach(b => { const q = seg(v, b - .04, b + .34); if (q > 0 && q < 1) sc = q; });
    const scEl = $('cScan'); scEl.style.display = sc >= 0 ? 'block' : 'none'; if (sc >= 0) scEl.style.left = lerp(1300, -300, E.inOutCubic(sc)) + 'px';
    // ticks
    [...ticks.querySelectorAll('.tk')].forEach((t, i) => { t.style.transform = `scaleX(${i < idx ? 1 : i === idx ? E.outCubic(seg(v, BEATS[i], BEATS[i + 1])) : 0})`; });
    tf($('cGhost'), { x: lerp(60, 0, E.outCubic(seg(v, BEATS[idx], BEATS[idx] + .6))), op: 1 });
  }
  // grid
  const gOn = !inRail; $('cGridWrap').style.display = gOn ? 'block' : 'none';
  if (gOn) {
    cards.forEach((c, i) => { const p = E.outExpo(seg(v, 17.5 + i * .09, 17.95 + i * .09)); tf(c, { y: lerp(60, 0, p), op: p }); });
    rise($('gT'), E.outExpo(seg(v, 17.55, 18.0))); tf($('gTag'), { op: seg(v, 17.9, 18.3) });
    const wp = $('gWireP'); const len = 1; wp.setAttribute('pathLength', 1); wp.setAttribute('stroke-dasharray', 1); wp.setAttribute('stroke-dashoffset', 1 - E.inOutCubic(seg(v, 18.9, 19.9)));
    [...gWire.querySelectorAll('.gdot')].forEach((d, i) => d.setAttribute('opacity', seg(v, 18.9 + i * .12, 19.1 + i * .12)));
    // tiny life in cards
    cards.forEach((c, i) => { c.querySelector('svg').style.transform = `translateY(${Math.sin(v * 1.5 + i) * 4}px)`; });
    const out = E.inCubic(seg(v, 20.55, 20.9)); $('cGridWrap').style.opacity = 1 - out;
  }
}
function drawBlueprint(p, v, st) {
  // st: {shell, wA,wB,wC, pulse, lit[]}
  const q = id => document.getElementById(p + id);
  q('shell').setAttribute('stroke-dashoffset', 1 - st.shell);
  q('wA').setAttribute('stroke-dashoffset', 1 - st.wA); q('wB').setAttribute('stroke-dashoffset', 1 - st.wB); q('wC').setAttribute('stroke-dashoffset', 1 - st.wC);
  document.querySelector('.' + p + 'body').style.opacity = st.body == null ? .85 : st.body;
  busNodes(p).forEach((n, i) => { const L = st.lit(i); nodeFill(n, L); const y = NODE_DEFS[i].y - (st.drop ? (1 - st.drop(i)) * 60 : 0); n.setAttribute('transform', `translate(${NODE_DEFS[i].x} ${y})`); n.style.opacity = st.drop ? clamp(st.drop(i) * 2) * (.4 + .6 * clamp(L * 3)) : (.4 + .6 * clamp(L * 3)); });
  const pl = q('pulse'), pa = q('wA');
  if (st.pulse != null) { const L = pa.getTotalLength(); const pt = pa.getPointAtLength(((st.pulse % 1) + 1) % 1 * L); pl.setAttribute('cx', pt.x); pl.setAttribute('cy', pt.y); pl.setAttribute('opacity', st.pulseOp == null ? 1 : st.pulseOp); } else pl.setAttribute('opacity', 0);
}
function sceneD(v) {
  const on = inW(v, 'D'); show($('sD'), on); if (!on) return;
  $('spot').style.opacity = 0;
  const rows = [...dRows.children];
  SVC.forEach((s, i) => {
    const r = rows[i], pin = E.outExpo(seg(v, 21.0 + i * .1, 21.5 + i * .1));
    const nxt = i < 2 ? SVC[i + 1].at : 24.4, on2 = seg(v, s.at - .02, s.at + .25), off = seg(v, nxt, nxt + .3);
    r.style.transform = `translateX(${lerp(-80, 0, pin)}px)`; r.style.opacity = pin * (v >= s.at ? 1 : .5);
    const bg = r.querySelector('.rbg'); bg.style.transformOrigin = off > 0 ? 'left' : 'right';
    bg.style.transform = `scaleX(${off > 0 ? 1 - E.inOutCubic(off) : E.outExpo(on2)})`;
    r.querySelector('.rt').style.transform = `translateX(${lerp(60, 0, E.outExpo(on2))}px)`;
  });
  tf($('dTag'), { op: E.outCubic(seg(v, 21.0, 21.5)) });
  // team
  const tp = E.outExpo(seg(v, 24.5, 25.0)); rise($('dTeamT'), tp); tf($('dTeamE'), { op: seg(v, 24.8, 25.2) });
  $('dTeam').style.opacity = 1 - E.inCubic(seg(v, 25.7, 26.0));
  // blueprint
  const sup = seg(v, 22.0, 22.75), ins = seg(v, 22.78, 23.4), mnt = seg(v, 23.42, 24.2);
  drawBlueprint('d', v, {
    shell: E.outCubic(seg(v, 20.9, 22.2)),
    wA: E.inOutCubic(ins), wB: E.inOutCubic(seg(v, 23.0, 23.5)), wC: E.inOutCubic(seg(v, 23.1, 23.6)),
    drop: i => E.outBack(seg(v, 22.0 + i * .06, 22.45 + i * .06)),
    lit: i => E.outCubic(seg(v, 22.9 + i * .035, 23.2 + i * .035)) * (1 - .25 * 0),
    pulse: v > 23.5 ? (v - 23.5) * .7 : null, pulseOp: seg(v, 23.5, 23.8) * (1 - seg(v, 25.7, 26)),
  });
  $('dBus').style.opacity = 1;
  $('dBus').style.top = (1000 - E.outCubic(seg(v, 24.4, 25.0)) * 0) + 'px';
}
function sceneE(v) {
  const on = inW(v, 'E'); show($('sE'), on); if (!on) return;
  $('spot').style.opacity = 0;
  const sp = E.outCubic(seg(v, 26.25, 27.0));
  $('eStroke').setAttribute('stroke-dashoffset', 1 - sp);
  $('eFill').setAttribute('opacity', E.outCubic(seg(v, 26.7, 27.3)));
  $('eInner').setAttribute('opacity', E.outCubic(seg(v, 27.0, 27.6)));
  $('eCheck').setAttribute('stroke-dashoffset', 1 - E.outCubic(seg(v, 27.2, 27.8)));
  const pop = 1 + .04 * Math.sin(seg(v, 27.2, 27.8) * Math.PI);
  $('eShield').style.transform = `scale(${pop})`; $('eShield').style.transformOrigin = '540px 430px';
  tf($('eGlow'), { s: lerp(.7, 1.1, E.outCubic(seg(v, 26.2, 28))), op: E.outCubic(seg(v, 26.3, 27.3)) * (.8 + .2 * Math.sin(v * 3)) });
  rise($('eT'), E.outExpo(seg(v, 26.45, 27.0)));
  const pl = E.outExpo(seg(v, 27.55, 28.0)), pr = E.outExpo(seg(v, 28.45, 28.9));
  tf($('ePillL'), { x: lerp(-120, 0, pl), op: pl }); tf($('ePillR'), { x: lerp(120, 0, pr), op: pr });
  $('ePillL').querySelector('.ck').style.transform = `scale(${E.outBack(seg(v, 27.85, 28.2))})`;
  $('ePillR').querySelector('.ck').style.transform = `scale(${E.outBack(seg(v, 28.75, 29.1))})`;
  const sp2 = E.outExpo(seg(v, 29.4, 29.9)); tf($('eStatus'), { y: lerp(50, 0, sp2), op: sp2 });
  $('eEkg').setAttribute('stroke-dashoffset', 1 - seg(v, 29.7, 30.9));
  $('eDot').style.opacity = Math.sin(v * 8) > 0 ? 1 : .3;
  $('sE').style.opacity = 1 - E.inCubic(seg(v, 31.0, 31.3));
}
function sceneF(v) {
  const on = inW(v, 'F'); show($('sF'), on); if (!on) return;
  $('spot').style.opacity = 0;
  tf($('fTag'), { op: E.outCubic(seg(v, 31.4, 31.9)) }); $('fTag').style.letterSpacing = lerp(26, 9, E.outExpo(seg(v, 31.4, 32.4))) + 'px';
  rise($('fT'), E.outExpo(seg(v, 31.5, 32.1)));
  const reveal = (id, t0, dx) => {
    const e = $(id), p = E.outExpo(seg(v, t0, t0 + .55)), drift = Math.sin(v * .9 + t0) * 5;
    e.style.opacity = clamp(p * 4); e.style.transform = `translate(${lerp(dx, 0, p)}px,${drift}px) scale(${lerp(.94, 1, p)})`;
    e.style.clipPath = `inset(0 ${lerp(100, 0, E.outExpo(seg(v, t0, t0 + .5)))}% 0 0 round 20px)`;
    // flash edge
    const fl = 1 - seg(v, t0 + .4, t0 + .75); e.style.filter = `brightness(${1 + .0 * fl})`;
  };
  reveal('pGo', 33.1, 180); reveal('pBlue', 33.98, 180); reveal('pAhly', 34.84, -180);
  const bar = E.outExpo(seg(v, 35.5, 36.3)); $('fBar').style.transform = `scaleX(${bar})`;
  rise($('fMoreT'), E.outExpo(seg(v, 36.0, 36.5))); tf($('fMoreE'), { op: E.outCubic(seg(v, 36.4, 37)) });
  const out = E.inCubic(seg(v, 38.1, 38.45)); $('sF').style.opacity = 1 - out;
}
function sceneG(v) {
  const on = inW(v, 'G'); show($('sG'), on);
  if (!on) return; $('spot').style.opacity = 0;
  const t = v - 38.45;
  drawBus({ T: v, zc: 6 + t * .75, f: lerp(1500, 1650, seg(v, 38.45, 41.7)), cy: 760, dx: -Math.sin(v * .6) * 12, bright: 1, led: 1, ledGrow: 1, screens: 1, glow: 1.2, dim: 0 });
  rise($('gv1'), E.outExpo(seg(v, 39.25, 39.8))); rise($('gv2'), E.outExpo(seg(v, 40.2, 40.75)));
  tf($('gvTag'), { op: E.outCubic(seg(v, 39.6, 40.1)) }); $('gvTag').style.letterSpacing = lerp(24, 8, E.outExpo(seg(v, 39.6, 40.8))) + 'px';
  $('gvBar').style.transform = `scaleX(${E.outExpo(seg(v, 40.7, 41.3))})`;
  $('gv2').style.color = '#fff';
  // text plate darkening for legibility
  $('sG').style.background = `linear-gradient(to bottom,rgba(17,17,17,0) 0%,rgba(17,17,17,0) 52%,rgba(17,17,17,.82) 72%,rgba(17,17,17,.9) 100%)`;
}
function sceneH(v) {
  const on = inW(v, 'H'); show($('sH'), on); if (!on) return;
  $('spot').style.opacity = 0;
  rise($('hT1'), E.outExpo(seg(v, 41.9, 42.5))); rise($('hT2'), E.outExpo(seg(v, 42.6, 43.2)));
  tf($('hGlow'), { op: E.outCubic(seg(v, 41.9, 43)) * (.75 + .25 * Math.sin(v * 4)) });
  drawBlueprint('h', v, {
    shell: E.outCubic(seg(v, 41.7, 42.5)), wA: E.outCubic(seg(v, 42.0, 43.4)), wB: E.outCubic(seg(v, 42.6, 43.4)), wC: E.outCubic(seg(v, 42.6, 43.6)),
    lit: i => E.outCubic(seg(v, 42.3 + i * .08, 42.7 + i * .08)), pulse: (v - 42.5) * .85, pulseOp: seg(v, 42.8, 43.1),
  });
  // stations
  $('hSLine').setAttribute('stroke-dashoffset', 1 - seg(v, 44.85, 47.95));
  [...$('hSt').querySelectorAll('.stn')].forEach((s, i) => {
    const at = STN[i].at, a = E.outExpo(seg(v, 44.0 + i * .12, 44.5 + i * .12)), lit = E.outExpo(seg(v, at, at + .3));
    s.style.opacity = a; s.style.transform = `translateY(${lerp(40, 0, a)}px)`;
    s.querySelector('.sbg').style.transform = `scaleY(${lit})`;
    const d = s.querySelector('.sd'); d.style.background = lit > .1 ? '#CE1E20' : '#111'; d.style.transform = `scale(${1 + .35 * Math.sin(seg(v, at, at + .4) * Math.PI)})`;
  });
  $('hSt').style.opacity = 1;
}
function sceneI(v) {
  const on = inW(v, 'I'); show($('sI'), on); if (!on) return;
  $('spot').style.opacity = 0;
  const T0 = 48.7;
  const lg = E.outBack(seg(v, T0, T0 + .65));
  tf($('iLogoWrap'), { s: lerp(.6, 1, lg), op: clamp(seg(v, T0, T0 + .25) * 2) });
  $('iShine').style.left = lerp(-200, 700, E.inOutCubic(seg(v, 51.4, 52.4))) + 'px';
  tf($('iGlow'), { s: lerp(.7, 1.05, E.outCubic(seg(v, T0, T0 + 1.5))), op: E.outCubic(seg(v, T0, T0 + .8)) * (.8 + .2 * Math.sin(v * 2.5)) });
  rise($('iNameT'), E.outExpo(seg(v, 49.25, 49.7))); $('iNameT').style.letterSpacing = lerp(30, 8, E.outExpo(seg(v, 49.25, 50.2))) + 'px';
  tf($('iSub'), { op: E.outCubic(seg(v, 49.6, 50.1)), y: lerp(14, 0, E.outCubic(seg(v, 49.6, 50.1))) });
  $('iSubT').style.letterSpacing = lerp(30, 13, E.outExpo(seg(v, 49.6, 50.6))) + 'px';
  $('iRule').style.transform = `scaleX(${E.outExpo(seg(v, 49.9, 50.5))})`;
  [...$('iSvc').querySelectorAll('.isv')].forEach((e, i) => { const p = E.outExpo(seg(v, 50.1 + i * .13, 50.55 + i * .13)); e.style.opacity = p; e.style.transform = `translateY(${lerp(30, 0, p)}px)`; });
  [...$('iSvc').querySelectorAll('.isep')].forEach((e, i) => { e.style.transform = `scaleY(${E.outExpo(seg(v, 50.3 + i * .13, 50.7 + i * .13))})`; });
  [['iP1', 50.75], ['iP2', 50.95]].forEach(([id, t]) => { const p = E.outExpo(seg(v, t, t + .55)); tf($(id), { y: lerp(60, 0, p), op: p }); });
  $('iFr').setAttribute('stroke-dashoffset', 1 - E.inOutCubic(seg(v, 49.0, 52.2)));
  $('sI').style.opacity = 1;
}

/* ---------- global HUD ---------- */
function hud(v) {
  const secs = [[11.65, '01 — Products'], [20.9, '02 — Services'], [26.0, '03 — Warranty'], [31.3, '04 — Experience'], [41.7, '05 — One place']];
  let label = ''; secs.forEach(([t, s]) => { if (v >= t) label = s; });
  const showHud = v >= 11.7 && v < 38.45 || (v >= 41.7 && v < 48.3);
  $('hSec').textContent = label;
  const k = (v >= 11.65 && v < 48.3 && !(v >= 38.45 && v < 41.7)) ? 1 : 0;
  const a = k * E.outCubic(seg(v, 11.9, 12.4));
  $('hLogo').style.opacity = a; $('hSec').style.opacity = a; $('hLine').style.opacity = a;
  // waveform
  const wv = v >= 2.3 && v < 48.8; $('wave').style.display = wv ? 'block' : 'none';
  if (wv) {
    const a2 = E.outCubic(seg(v, 2.3, 3)) * (1 - E.inCubic(seg(v, 48.1, 48.7))) * (inW(v, 'G') ? .0 : 1);
    waveBars.forEach((b, i) => { const e = env(v - (NB - 1 - i) * .035); const h = 6 + e * 82; b.setAttribute('y', 50 - h / 2); b.setAttribute('height', h); b.setAttribute('fill', i > NB - 4 ? '#CE1E20' : '#fff'); b.setAttribute('opacity', (.12 + .5 * (i / NB)) * (i > NB - 4 ? 1.8 : 1)); });
    $('wave').style.opacity = a2;
  }
}

/* ---------- main ---------- */
let frameN = 0;
window.render = function (t) {
  const v = t + OFF; frameN = Math.round(t * 30);
  sceneA(v); sceneB(v); sceneC(v); sceneD(v); sceneE(v); sceneF(v); sceneG(v); sceneH(v); sceneI(v);
  // the interior canvas is only visible in A and G (and hidden elsewhere)
  bus.style.display = (inW(v, 'A') || inW(v, 'G')) ? 'block' : 'none';
  if (!(inW(v, 'C'))) { if (!inW(v, 'C')) $('spot').style.opacity = 0; }
  hud(v); drawWipes(v);
  gctx.drawImage(grainTiles[frameN % 4], 0, 0);
  $('grain').style.opacity = .16;
  // hide stray overlays when leaving C
  return true;
};
window.ready = (async () => { await Promise.all(['900 100px Cairo', '700 40px Cairo', '800 40px Montserrat', '900 40px Montserrat', '700 40px Montserrat', '500 40px Montserrat'].map(f => document.fonts.load(f, 'أبجد ABC 0123'))); await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => { }))); return true; })();
