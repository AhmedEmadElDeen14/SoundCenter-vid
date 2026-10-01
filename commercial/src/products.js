/* Sound Center — product illustrations (vector, studio-lit). viewBox 0 0 800 600 each.
   Palette: #CE1E20 / #111111 / #FFFFFF and neutral tints of black & white only. */

const DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="gMetalD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset=".45" stop-color="#1d1d1d"/><stop offset="1" stop-color="#2e2e2e"/></linearGradient>
  <linearGradient id="gMetalL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f2f2"/><stop offset=".35" stop-color="#b9b9b9"/><stop offset=".7" stop-color="#8d8d8d"/><stop offset="1" stop-color="#c9c9c9"/></linearGradient>
  <linearGradient id="gMetalH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset=".25" stop-color="#f4f4f4"/><stop offset=".55" stop-color="#9c9c9c"/><stop offset="1" stop-color="#555"/></linearGradient>
  <linearGradient id="gPanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3b3b"/><stop offset=".5" stop-color="#242424"/><stop offset="1" stop-color="#171717"/></linearGradient>
  <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#585858"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>
  <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ee3033"/><stop offset=".5" stop-color="#CE1E20"/><stop offset="1" stop-color="#8a1112"/></linearGradient>
  <linearGradient id="gScreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1c1c"/><stop offset="1" stop-color="#050505"/></linearGradient>
  <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".42" stop-color="#fff" stop-opacity=".05"/><stop offset=".43" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".06"/></linearGradient>
  <radialGradient id="gCone" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#555"/><stop offset=".6" stop-color="#1e1e1e"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient>
  <radialGradient id="gCap" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#d8d8d8"/><stop offset=".4" stop-color="#6c6c6c"/><stop offset="1" stop-color="#151515"/></radialGradient>
  <radialGradient id="gDome" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#4b4b4b"/><stop offset=".45" stop-color="#171717"/><stop offset="1" stop-color="#040404"/></radialGradient>
  <radialGradient id="gLens" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#6d6d6d"/><stop offset=".3" stop-color="#1b1b1b"/><stop offset="1" stop-color="#000"/></radialGradient>
  <radialGradient id="gKnob" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#8e8e8e"/><stop offset=".5" stop-color="#2d2d2d"/><stop offset="1" stop-color="#0d0d0d"/></radialGradient>
  <radialGradient id="gGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#CE1E20" stop-opacity=".9"/><stop offset="1" stop-color="#CE1E20" stop-opacity="0"/></radialGradient>
  <radialGradient id="gShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <pattern id="pMesh" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#0c0c0c"/><circle cx="4.5" cy="4.5" r="2.2" fill="#3c3c3c"/></pattern>
  <pattern id="pMeshL" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#111"/><circle cx="3.5" cy="3.5" r="1.9" fill="#8b8b8b"/></pattern>
  <pattern id="pBrush" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="none"/><line x1="0" y1="2" x2="4" y2="2" stroke="#fff" stroke-opacity=".07"/></pattern>
  <filter id="fBlur6"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="fBlur14"><feGaussianBlur stdDeviation="14"/></filter>
</defs></svg>`;

const shadow = (cx, cy, rx, ry, o = 1) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gShadow)" opacity="${o}"/>`;

const screws = (pts, r = 5) => pts.map(([x, y]) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gKnob)" stroke="#000" stroke-opacity=".5"/><line x1="${x - r * .6}" y1="${y - r * .3}" x2="${x + r * .6}" y2="${y + r * .3}" stroke="#000" stroke-opacity=".7" stroke-width="1.4"/>`).join('');

const PRODUCTS = {
  /* 1 — Flip-down screen */
  screen: `
    ${shadow(400, 560, 330, 26, .8)}
    <g>
      <rect x="215" y="14" width="370" height="46" rx="8" fill="url(#gMetalL)"/>
      <rect x="215" y="14" width="370" height="46" rx="8" fill="url(#pBrush)"/>
      ${screws([[240, 37], [560, 37]], 6)}
      <rect x="318" y="48" width="164" height="30" rx="6" fill="url(#gMetalD)" stroke="#fff" stroke-opacity=".15"/>
      <rect x="150" y="60" width="26" height="30" rx="5" fill="url(#gMetalH)"/><rect x="624" y="60" width="26" height="30" rx="5" fill="url(#gMetalH)"/>
      <rect x="70" y="76" width="660" height="392" rx="26" fill="url(#gMetalD)" stroke="#fff" stroke-opacity=".22" stroke-width="1.5"/>
      <rect x="70" y="76" width="660" height="6" rx="3" fill="#fff" opacity=".28"/>
      <rect x="92" y="98" width="616" height="348" rx="14" fill="#030303"/>
      <rect x="100" y="106" width="600" height="332" rx="9" fill="url(#gScreen)"/>
      <g id="scrContent">
        <ellipse cx="400" cy="470" rx="360" ry="120" fill="url(#gGlow)" opacity=".5"/>
        <g stroke="#fff" stroke-opacity=".10" stroke-width="2"><line x1="100" y1="300" x2="700" y2="300"/><line x1="100" y1="360" x2="700" y2="360"/></g>
        <circle cx="400" cy="262" r="64" fill="#CE1E20"/><path d="M382 232 L382 292 L434 262 Z" fill="#fff"/>
        <rect x="140" y="398" width="520" height="7" rx="3.5" fill="#fff" opacity=".22"/>
        <rect id="scrBar" x="140" y="398" width="300" height="7" rx="3.5" fill="#CE1E20"/>
        <circle id="scrKnob" cx="440" cy="401.5" r="9" fill="#fff"/>
      </g>
      <path d="M100 106 H520 L340 438 H100 Z" fill="url(#gGlass)"/>
      <circle cx="400" cy="458" r="4" fill="#CE1E20"/><circle cx="400" cy="458" r="10" fill="url(#gGlow)" opacity=".8"/>
    </g>`,

  /* 2 — Speakers */
  speaker: `
    ${shadow(300, 548, 250, 26, .8)}${shadow(615, 540, 150, 18, .7)}
    <g id="spkBig">
      <circle cx="300" cy="300" r="238" fill="url(#gMetalL)"/>
      <circle cx="300" cy="300" r="238" fill="url(#pBrush)"/>
      <circle cx="300" cy="300" r="224" fill="url(#gMetalD)" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
      <circle cx="300" cy="300" r="205" fill="url(#pMesh)"/>
      <circle cx="300" cy="300" r="205" fill="none" stroke="#CE1E20" stroke-width="5"/>
      <circle cx="300" cy="300" r="205" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.5" transform="scale(1)"/>
      ${screws([[300, 36], [300, 564], [36, 300], [564, 300]], 8)}
    </g>
    <g id="spkCone" style="transform-origin:300px 300px">
      <circle cx="300" cy="300" r="150" fill="url(#gCone)" stroke="#000" stroke-width="3"/>
      <circle cx="300" cy="300" r="132" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
      <circle cx="300" cy="300" r="108" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3"/>
      <circle cx="300" cy="300" r="88" fill="none" stroke="#fff" stroke-opacity=".10" stroke-width="2"/>
      <circle cx="300" cy="300" r="62" fill="url(#gCap)"/>
      <circle cx="300" cy="300" r="62" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
      <ellipse cx="280" cy="278" rx="22" ry="12" fill="#fff" opacity=".5" transform="rotate(-35 280 278)"/>
    </g>
    <path d="M110 140 A 205 205 0 0 1 330 96 L 300 300 Z" fill="#fff" opacity=".05"/>
    <g>
      <circle cx="615" cy="340" r="146" fill="url(#gMetalL)"/>
      <circle cx="615" cy="340" r="138" fill="url(#gMetalD)"/>
      <circle cx="615" cy="340" r="124" fill="url(#pMesh)"/>
      <circle cx="615" cy="340" r="124" fill="none" stroke="#CE1E20" stroke-width="4"/>
      <circle cx="615" cy="340" r="86" fill="url(#gCone)" stroke="#000" stroke-width="2"/>
      <circle cx="615" cy="340" r="36" fill="url(#gCap)"/>
      <ellipse cx="604" cy="326" rx="12" ry="7" fill="#fff" opacity=".5" transform="rotate(-35 604 326)"/>
      ${screws([[615, 212], [615, 468], [487, 340], [743, 340]], 6)}
    </g>`,

  /* 3 — Amplifier */
  amp: `
    ${shadow(400, 470, 340, 30, .9)}
    <g>
      <rect x="86" y="446" width="60" height="22" rx="6" fill="url(#gMetalD)"/><rect x="654" y="446" width="60" height="22" rx="6" fill="url(#gMetalD)"/>
      <polygon points="64,196 736,196 706,128 94,128" fill="url(#gTop)" stroke="#fff" stroke-opacity=".15"/>
      ${Array.from({ length: 17 }, (_, i) => { const x0 = 100 + i * 37.5, x1 = 76 + i * 40; return `<line x1="${x0.toFixed(1)}" y1="134" x2="${x1.toFixed(1)}" y2="192" stroke="#fff" stroke-opacity=".16" stroke-width="3"/><line x1="${(x0 + 3).toFixed(1)}" y1="134" x2="${(x1 + 3).toFixed(1)}" y2="192" stroke="#000" stroke-opacity=".5" stroke-width="2"/>`; }).join('')}
      <rect x="64" y="196" width="672" height="252" rx="10" fill="url(#gMetalL)" stroke="#000" stroke-opacity=".4"/>
      <rect x="64" y="196" width="672" height="252" rx="10" fill="url(#pBrush)"/>
      <rect x="64" y="196" width="672" height="5" fill="#fff" opacity=".6"/>
      <rect x="84" y="222" width="632" height="202" rx="8" fill="url(#gPanel)" stroke="#000" stroke-opacity=".7"/>
      <rect x="84" y="222" width="632" height="3" fill="#fff" opacity=".12"/>
      <g id="ampKnobs">
        ${[0, 1, 2].map(i => { const cx = 150 + i * 96, cy = 330; return `<circle cx="${cx}" cy="${cy}" r="40" fill="#000" opacity=".5"/><circle cx="${cx}" cy="${cy}" r="34" fill="url(#gKnob)" stroke="#fff" stroke-opacity=".3"/><line x1="${cx}" y1="${cy - 6}" x2="${cx}" y2="${cy - 30}" stroke="#fff" stroke-width="4" stroke-linecap="round" transform="rotate(${[-40, 20, 65][i]} ${cx} ${cy})"/>${Array.from({ length: 9 }, (_, k) => { const a = (-135 + k * 33.75) * Math.PI / 180; return `<circle cx="${(cx + Math.sin(a) * 50).toFixed(1)}" cy="${(cy - Math.cos(a) * 50).toFixed(1)}" r="2" fill="#fff" opacity=".5"/>`; }).join('')}`; }).join('')}
      </g>
      <rect x="460" y="262" width="226" height="108" rx="6" fill="#050505" stroke="#fff" stroke-opacity=".2"/>
      <g id="ampBars">${Array.from({ length: 14 }, (_, i) => `<rect class="ampSeg" data-i="${i}" x="${474 + i * 15.2}" y="280" width="10" height="34" rx="2" fill="#fff" opacity=".18"/><rect class="ampSeg2" data-i="${i}" x="${474 + i * 15.2}" y="322" width="10" height="34" rx="2" fill="#fff" opacity=".18"/>`).join('')}</g>
      <circle cx="136" cy="256" r="9" fill="#CE1E20"/><circle cx="136" cy="256" r="22" fill="url(#gGlow)"/>
      ${Array.from({ length: 22 }, (_, i) => `<rect x="${106 + i * 6}" y="404" width="3" height="10" fill="#000" opacity=".8"/>`).join('')}
      <text x="460" y="402" font-family="Montserrat" font-weight="700" font-size="14" letter-spacing="3" fill="#fff" opacity=".55">CH 1</text>
      <text x="636" y="402" font-family="Montserrat" font-weight="700" font-size="14" letter-spacing="3" fill="#fff" opacity=".55">CH 2</text>
    </g>`,

  /* 4 — Media player / DVD */
  dvd: `
    ${shadow(400, 510, 340, 26, .9)}
    <g id="dvdDisc" transform="translate(400 206)">
      <g transform="scale(1 .33)"><g id="dvdSpin">
        ${Array.from({ length: 24 }, (_, i) => { const a0 = i * 15, a1 = a0 + 15, c = [`#e8e8e8`, `#7a7a7a`, `#cfcfcf`, `#4d4d4d`][i % 4], p = a => [Math.cos(a * Math.PI / 180) * 200, Math.sin(a * Math.PI / 180) * 200]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M0 0 L${x0.toFixed(1)} ${y0.toFixed(1)} A200 200 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${c}"/>`; }).join('')}
      </g><circle r="200" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/><circle r="64" fill="#111" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><circle r="22" fill="#000"/><circle r="120" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/></g>
    </g>
    <g>
      <polygon points="70,360 730,360 706,310 94,310" fill="url(#gTop)" stroke="#fff" stroke-opacity=".15"/>
      <rect x="70" y="360" width="660" height="124" rx="9" fill="url(#gMetalL)" stroke="#000" stroke-opacity=".4"/>
      <rect x="70" y="360" width="660" height="124" rx="9" fill="url(#pBrush)"/>
      <rect x="70" y="360" width="660" height="4" fill="#fff" opacity=".6"/>
      <rect x="86" y="374" width="628" height="96" rx="7" fill="url(#gPanel)" stroke="#000" stroke-opacity=".7"/>
      <rect x="104" y="392" width="270" height="12" rx="6" fill="#000"/><rect x="104" y="392" width="270" height="3" fill="#fff" opacity=".18"/>
      <rect x="104" y="418" width="150" height="38" rx="4" fill="#030303" stroke="#fff" stroke-opacity=".18"/>
      <text id="dvdTime" x="116" y="447" font-family="Montserrat" font-weight="800" font-size="25" letter-spacing="2" fill="#CE1E20">00:00:00</text>
      ${[0, 1, 2].map(i => `<circle cx="${440 + i * 62}" cy="436" r="22" fill="url(#gKnob)" stroke="#fff" stroke-opacity=".3"/>`).join('')}
      <path d="M432 425 L432 447 L452 436 Z" fill="#fff"/><rect x="487" y="426" width="18" height="20" fill="#fff" opacity=".85"/><path d="M553 446 L563 428 L573 446 Z M553 450 H573 V453 H553Z" fill="#fff" opacity=".85"/>
      <circle cx="680" cy="398" r="5" fill="#CE1E20"/>
    </g>`,

  /* 5 — Microphones */
  mic: `
    ${shadow(300, 560, 160, 18, .8)}${shadow(610, 556, 150, 20, .8)}
    <g transform="translate(290 300) rotate(-16)">
      <rect x="-36" y="-12" width="72" height="320" rx="22" fill="url(#gMetalH)" transform="translate(0 70) scale(1 .01) translate(0 0)" opacity="0"/>
      <path d="M-44 -64 L44 -64 L34 250 Q0 276 -34 250 Z" fill="url(#gMetalH)" stroke="#000" stroke-opacity=".5"/>
      <path d="M-44 -64 L44 -64 L34 250 Q0 276 -34 250 Z" fill="url(#pBrush)"/>
      <rect x="-45" y="48" width="90" height="30" rx="6" fill="url(#gRed)"/><rect x="-45" y="48" width="90" height="5" rx="2" fill="#fff" opacity=".4"/>
      <rect x="-20" y="108" width="40" height="64" rx="10" fill="url(#gPanel)" stroke="#fff" stroke-opacity=".3"/><circle cx="0" cy="140" r="9" fill="#CE1E20"/>
      <rect x="-52" y="-86" width="104" height="30" rx="8" fill="url(#gMetalL)" stroke="#000" stroke-opacity=".4"/>
      <circle cx="0" cy="-150" r="86" fill="url(#pMeshL)"/>
      <circle cx="0" cy="-150" r="86" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3"/>
      <circle cx="0" cy="-150" r="86" fill="url(#gGlass)"/>
      <path d="M-70 -190 A 90 90 0 0 1 -10 -232" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g>
      <ellipse cx="610" cy="534" rx="96" ry="22" fill="url(#gMetalD)" stroke="#fff" stroke-opacity=".25"/>
      <ellipse cx="610" cy="526" rx="96" ry="22" fill="url(#gMetalL)"/><ellipse cx="610" cy="526" rx="62" ry="13" fill="url(#gMetalD)"/>
      <circle cx="610" cy="526" r="5" fill="#CE1E20"/>
      <path d="M610 516 C 610 410, 500 420, 520 300 C 535 215, 610 200, 640 150" fill="none" stroke="#000" stroke-width="20" stroke-linecap="round" opacity=".7"/>
      <path d="M610 516 C 610 410, 500 420, 520 300 C 535 215, 610 200, 640 150" fill="none" stroke="url(#gMetalH)" stroke-width="14" stroke-linecap="round"/>
      <path d="M610 516 C 610 410, 500 420, 520 300 C 535 215, 610 200, 640 150" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 7"/>
      <g transform="translate(646 116) rotate(14)">
        <rect x="-26" y="40" width="52" height="22" rx="5" fill="url(#gRed)"/>
        <rect x="-30" y="-58" width="60" height="104" rx="30" fill="url(#pMeshL)" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
        <rect x="-30" y="-58" width="60" height="104" rx="30" fill="url(#gGlass)"/>
      </g>
    </g>`,

  /* 6 — Cameras */
  camera: `
    ${shadow(300, 556, 250, 24, .7)}${shadow(640, 552, 120, 16, .7)}
    <g>
      <circle cx="300" cy="300" r="250" fill="url(#gMetalL)"/><circle cx="300" cy="300" r="250" fill="url(#pBrush)"/>
      <circle cx="300" cy="300" r="232" fill="url(#gMetalD)" stroke="#000" stroke-opacity=".5"/>
      <circle cx="300" cy="300" r="206" fill="url(#gDome)" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
      <circle cx="300" cy="300" r="118" fill="#080808" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>
      <circle cx="300" cy="300" r="92" fill="url(#gMetalD)" stroke="#000" stroke-width="3"/>
      <circle cx="300" cy="300" r="72" fill="#000" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
      <circle cx="300" cy="300" r="56" fill="url(#gLens)" stroke="#CE1E20" stroke-width="3"/>
      <circle cx="300" cy="300" r="34" fill="url(#gLens)" stroke="#fff" stroke-opacity=".25"/>
      <circle cx="288" cy="288" r="10" fill="#fff" opacity=".65"/><circle cx="318" cy="318" r="4" fill="#fff" opacity=".4"/>
      ${Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return `<circle cx="${(300 + Math.cos(a) * 105).toFixed(1)}" cy="${(300 + Math.sin(a) * 105).toFixed(1)}" r="4.5" fill="#2a2a2a" stroke="#fff" stroke-opacity=".3"/>`; }).join('')}
      <path d="M130 170 A 206 206 0 0 1 330 96 C 250 150 200 220 130 280 Z" fill="#fff" opacity=".13"/>
      <path d="M470 430 A 206 206 0 0 1 400 500" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>
      ${screws([[300, 36], [300, 564], [36, 300], [564, 300]], 7)}
      <circle id="camRec" cx="468" cy="168" r="8" fill="#CE1E20"/><circle cx="468" cy="168" r="22" fill="url(#gGlow)"/>
    </g>
    <g transform="translate(640 330)">
      <rect x="-14" y="150" width="28" height="60" fill="url(#gMetalH)"/>
      <ellipse cx="0" cy="220" rx="52" ry="12" fill="url(#gMetalD)" stroke="#fff" stroke-opacity=".2"/>
      <circle cx="0" cy="150" r="22" fill="url(#gKnob)"/>
      <g transform="rotate(-14)">
        <rect x="-110" y="-62" width="230" height="124" rx="34" fill="url(#gMetalL)"/>
        <rect x="-110" y="-62" width="230" height="124" rx="34" fill="url(#pBrush)"/>
        <path d="M-120 -78 L 80 -78 L 90 -58 L -110 -58 Z" fill="url(#gMetalD)"/>
        <rect x="-96" y="-44" width="196" height="88" rx="26" fill="url(#gPanel)"/>
        <circle cx="-62" cy="0" r="38" fill="#050505" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
        <circle cx="-62" cy="0" r="28" fill="url(#gLens)" stroke="#CE1E20" stroke-width="3"/><circle cx="-70" cy="-9" r="6" fill="#fff" opacity=".6"/>
        <rect x="-12" y="-10" width="96" height="20" rx="10" fill="#050505"/>
        ${Array.from({ length: 6 }, (_, i) => `<circle cx="${2 + i * 15}" cy="0" r="3.4" fill="#fff" opacity=".35"/>`).join('')}
      </g>
    </g>`
};

const PRODUCT_LIST = [
  { key: 'screen',  en: 'FLIP DOWN SCREENS', ar: 'شاشات' },
  { key: 'speaker', en: 'SPEAKERS',          ar: 'سماعات' },
  { key: 'amp',     en: 'AMPLIFIERS',        ar: 'مكبّرات صوت' },
  { key: 'dvd',     en: 'MEDIA PLAYERS / DVD', ar: 'مشغّلات وسائط' },
  { key: 'mic',     en: 'MICROPHONES',       ar: 'مايكروفونات' },
  { key: 'camera',  en: 'CAMERAS',           ar: 'كاميرات' },
];
