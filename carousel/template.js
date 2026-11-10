// Builds the HTML for each carousel slide (1080x1350, Instagram 4:5).
// Each slide gets its own color theme and layout so the carousel doesn't feel repetitive.

const THEMES = {
  blue:   { a: '#4da3ff', b: '#9bd8ff', bg: '#050912', deep: '#1d4c9a', panel: '#0c1526' },
  pink:   { a: '#ff4fa3', b: '#ffb8dc', bg: '#10040c', deep: '#7a1d5a', panel: '#1e0a18' },
  teal:   { a: '#2ee6b8', b: '#a8ffe8', bg: '#03100d', deep: '#0f5c4c', panel: '#08201b' },
  violet: { a: '#a78bff', b: '#dcd2ff', bg: '#07051a', deep: '#3b2a8a', panel: '#130f30' },
  amber:  { a: '#ff8a3d', b: '#ffd2ad', bg: '#110703', deep: '#7a2e0c', panel: '#221008' },
};

const css = (t) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&family=JetBrains+Mono:wght@500;700&display=block');
:root { --a: ${t.a}; --b: ${t.b}; --bg: ${t.bg}; --panel: ${t.panel}; --text: #f2f5ff; --muted: #8a93ab; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1350px; }
body {
  background:
    radial-gradient(900px 700px at 50% 20%, color-mix(in srgb, var(--a) 20%, transparent), transparent 70%),
    radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--a) 9%, transparent), transparent 70%),
    var(--bg);
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: var(--text);
  padding: 68px 80px 64px; display: flex; flex-direction: column; position: relative; overflow: hidden;
}
body::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(color-mix(in srgb, var(--b) 4%, transparent) 1px, transparent 1px),
                    linear-gradient(90deg, color-mix(in srgb, var(--b) 4%, transparent) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: radial-gradient(800px 700px at 50% 30%, #000 30%, transparent 80%);
}
.top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; }
.brand { display: flex; align-items: center; gap: 16px; font-family: 'JetBrains Mono', monospace; font-size: 24px; letter-spacing: 4px; color: var(--muted); }
.bars { display: flex; align-items: flex-end; gap: 5px; height: 28px; }
.bars i { display: block; width: 7px; background: #2a2f3d; border-radius: 2px; }
.bars i:nth-child(1) { height: 30%; background: var(--a); box-shadow: 0 0 12px var(--a); }
.bars i:nth-child(2) { height: 55%; } .bars i:nth-child(3) { height: 80%; } .bars i:nth-child(4) { height: 100%; }
.meta { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: var(--muted); letter-spacing: 2px; }

em { font-style: normal; color: var(--a); text-shadow: 0 0 40px color-mix(in srgb, var(--a) 55%, transparent); }
mark { background: color-mix(in srgb, var(--a) 20%, transparent); color: var(--b); font-weight: 700; padding: 0 8px; border-radius: 8px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }

.visual { display: flex; align-items: center; justify-content: center; position: relative; }
.visual svg { width: 100%; height: 100%; overflow: visible; }
.text { position: relative; z-index: 2; display: flex; flex-direction: column; }
.tag { align-self: flex-start; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 22px; letter-spacing: 4px; color: var(--bg); background: var(--a); padding: 9px 16px; border-radius: 999px; margin-bottom: 26px; box-shadow: 0 0 30px color-mix(in srgb, var(--a) 45%, transparent); }
h1 { font-size: 104px; line-height: 0.98; font-weight: 900; letter-spacing: -4px; }
h2 { font-size: 74px; line-height: 1.0; font-weight: 900; letter-spacing: -2.5px; margin-bottom: 28px; }
.body { font-size: 33px; line-height: 1.5; color: #c9cfdf; font-weight: 500; }
.sub { margin-top: 36px; font-size: 38px; font-weight: 500; color: var(--b); display: flex; align-items: center; gap: 18px; }
.sub b { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: var(--a); color: var(--bg); font-size: 34px; box-shadow: 0 0 30px color-mix(in srgb, var(--a) 60%, transparent); }
.source { margin-top: 24px; font-family: 'JetBrains Mono', monospace; font-size: 20px; color: var(--muted); letter-spacing: 1px; }

/* ---- layouts ---- */
.l-hook .visual { height: 560px; margin: 20px 0 10px; }
.l-hook .text { flex: 1; justify-content: flex-end; }

.l-top .visual { height: 400px; margin: 10px 0 18px; }
.l-top .text { flex: 1; justify-content: flex-end; }

.l-bottom .text { margin-top: 64px; }
.l-bottom .visual { flex: 1; margin-top: 12px; min-height: 0; }

.l-card .card { margin: 34px 0 34px; height: 440px; border-radius: 36px; background: linear-gradient(135deg, var(--panel), color-mix(in srgb, var(--a) 22%, var(--panel))); border: 2px solid color-mix(in srgb, var(--a) 40%, transparent); position: relative; overflow: hidden; display: flex; align-items: center; }
.l-card .card .visual { height: 360px; width: 100%; }
.l-card .text { flex: 1; justify-content: flex-end; }

.l-bleed .visual { position: absolute; left: 0; top: 0; width: 1080px; height: 760px; }
.l-bleed .visual { z-index: 0; }
.l-bleed .text { flex: 1; justify-content: flex-end; }
body.l-bleed::after { content: ''; position: absolute; left: 0; right: 0; top: 600px; bottom: 0; z-index: 1;
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--bg) 85%, transparent) 30%, var(--bg) 60%); }
`;

// ---------- visuals (inline SVG, drawn with code; colors come from theme t) ----------
const defs = (t) => `
<defs>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.b}"/><stop offset="1" stop-color="${t.a}"/></linearGradient>
  <radialGradient id="earth" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="${t.deep}"/><stop offset="0.6" stop-color="${t.panel}"/><stop offset="1" stop-color="${t.bg}"/></radialGradient>
  <linearGradient id="trail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}" stop-opacity="0"/><stop offset="0.7" stop-color="${t.a}" stop-opacity="0.7"/><stop offset="1" stop-color="#fff3e0"/></linearGradient>
</defs>`;

function stars(n, w, h, seed = 7, color = '#e6eeff') {
  let s = seed, out = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) out += `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(rnd() * 2 + 0.6).toFixed(1)}" fill="${color}" opacity="${(rnd() * 0.6 + 0.2).toFixed(2)}"/>`;
  return out;
}

const telescope = (t) => `
  <rect x="-150" y="-62" width="90" height="124" rx="6" fill="${t.panel}" stroke="${t.a}" stroke-width="4"/>
  <line x1="-150" y1="-20" x2="-60" y2="-20" stroke="${t.a}" stroke-width="2" opacity="0.6"/><line x1="-150" y1="20" x2="-60" y2="20" stroke="${t.a}" stroke-width="2" opacity="0.6"/>
  <rect x="150" y="-62" width="90" height="124" rx="6" fill="${t.panel}" stroke="${t.a}" stroke-width="4"/>
  <line x1="150" y1="-20" x2="240" y2="-20" stroke="${t.a}" stroke-width="2" opacity="0.6"/><line x1="150" y1="20" x2="240" y2="20" stroke="${t.a}" stroke-width="2" opacity="0.6"/>
  <line x1="-60" y1="0" x2="-40" y2="0" stroke="${t.b}" stroke-width="5"/><line x1="130" y1="0" x2="150" y2="0" stroke="${t.b}" stroke-width="5"/>
  <rect x="-40" y="-46" width="170" height="92" rx="14" fill="url(#grad)"/>
  <rect x="-70" y="-38" width="34" height="76" rx="8" fill="${t.b}"/>
  <ellipse cx="-70" cy="0" rx="10" ry="38" fill="${t.bg}"/>`;

const visuals = {
  hubble: (t) => `
<svg viewBox="0 0 912 560">${defs(t)}
  ${stars(60, 912, 380)}
  <ellipse cx="456" cy="1180" rx="900" ry="720" fill="url(#earth)"/>
  <ellipse cx="456" cy="1180" rx="900" ry="720" fill="none" stroke="${t.a}" stroke-width="4" filter="url(#glow)"/>
  <path d="M 120 120 C 330 120, 520 210, 640 400" fill="none" stroke="${t.b}" stroke-width="4" stroke-dasharray="4 18" stroke-linecap="round" opacity="0.8"/>
  <g transform="translate(560 250) rotate(32)" filter="url(#glow)">${telescope(t)}</g>
  <g stroke="${t.a}" stroke-linecap="round" opacity="0.5">
    <line x1="410" y1="150" x2="330" y2="110" stroke-width="5"/><line x1="440" y1="200" x2="350" y2="160" stroke-width="3"/><line x1="470" y1="120" x2="400" y2="80" stroke-width="3"/>
  </g>
</svg>`,

  reentry: (t) => `
<svg viewBox="0 0 1080 760" preserveAspectRatio="xMidYMid slice">${defs(t)}
  ${stars(70, 1080, 420, 11, '#ffe9d6')}
  <ellipse cx="540" cy="1500" rx="1250" ry="920" fill="url(#earth)"/>
  <ellipse cx="540" cy="1500" rx="1250" ry="920" fill="none" stroke="${t.a}" stroke-width="6" filter="url(#glow)"/>
  <ellipse cx="540" cy="1500" rx="1290" ry="960" fill="none" stroke="${t.a}" stroke-width="40" opacity="0.12"/>
  <!-- burning trail -->
  <path d="M 40 60 Q 380 160 690 470" fill="none" stroke="url(#trail)" stroke-width="70" stroke-linecap="round" opacity="0.35" filter="url(#soft)"/>
  <path d="M 120 110 Q 400 200 690 470" fill="none" stroke="url(#trail)" stroke-width="16" stroke-linecap="round"/>
  <path d="M 200 90 Q 440 190 670 440" fill="none" stroke="${t.b}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
  <path d="M 150 170 Q 420 250 660 480" fill="none" stroke="${t.b}" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
  <circle cx="700" cy="480" r="120" fill="${t.a}" opacity="0.45" filter="url(#soft)"/>
  <circle cx="700" cy="480" r="60" fill="#ffe2c4" opacity="0.6" filter="url(#soft)"/>
  <g transform="translate(720 492) rotate(42) scale(0.62)" filter="url(#glow)">${telescope(t)}</g>
  <!-- debris -->
  <g fill="${t.b}">
    <circle cx="610" cy="360" r="5"/><circle cx="560" cy="330" r="3"/><circle cx="640" cy="410" r="4"/><circle cx="520" cy="290" r="2.5"/>
  </g>
</svg>`,

  countdown: (t, v) => `
<svg viewBox="0 0 912 300">${defs(t)}
  <g transform="translate(250 150)">
    <circle r="130" fill="${t.a}" opacity="0.25" filter="url(#soft)"/>
    <circle r="118" fill="none" stroke="#2a1426" stroke-width="16"/>
    <circle r="118" fill="none" stroke="url(#grad)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 118).toFixed(0)}" stroke-dashoffset="${(2 * Math.PI * 118 * 0.30).toFixed(0)}" transform="rotate(-90)" filter="url(#glow)"/>
    <text y="42" text-anchor="middle" font-family="Inter" font-weight="900" font-size="130" fill="#fff" letter-spacing="-4">${v}</text>
  </g>
  <text x="430" y="130" font-family="JetBrains Mono" font-weight="700" font-size="70" fill="${t.b}" letter-spacing="10">DAYS</text>
  <text x="430" y="190" font-family="JetBrains Mono" font-weight="500" font-size="30" fill="#c9cfdf" letter-spacing="4">UNTIL NOV 19</text>
  <g transform="translate(790 250) scale(0.9)" fill="none" stroke="${t.a}" stroke-width="5" stroke-linejoin="round" filter="url(#glow)">
    <path d="M -62 -22 Q -40 -34 -18 -26 L 18 -26 Q 40 -34 62 -22 Q 80 10 70 30 Q 60 44 44 30 L 28 14 L -28 14 L -44 30 Q -60 44 -70 30 Q -80 10 -62 -22 Z"/>
    <line x1="-44" y1="-10" x2="-44" y2="6"/><line x1="-52" y1="-2" x2="-36" y2="-2"/>
    <circle cx="40" cy="-8" r="3" fill="${t.a}"/><circle cx="50" cy="2" r="3" fill="${t.a}"/>
  </g>
</svg>`,

  toggle: (t) => `
<svg viewBox="0 0 912 440">${defs(t)}
  <g opacity="0.6">
    <rect x="96" y="20" width="720" height="110" rx="55" fill="${t.panel}" stroke="#1d3a33" stroke-width="4"/>
    <circle cx="170" cy="72" r="22" fill="none" stroke="#8a93ab" stroke-width="6"/>
    <line x1="186" y1="90" x2="204" y2="108" stroke="#8a93ab" stroke-width="7" stroke-linecap="round"/>
    <text x="236" y="88" font-family="Inter" font-weight="500" font-size="42" fill="#8a93ab">Ask AI anything…</text>
    <line x1="96" y1="135" x2="816" y2="15" stroke="${t.a}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  </g>
  <g transform="translate(456 290)">
    <rect x="-210" y="-100" width="420" height="200" rx="100" fill="${t.a}" opacity="0.18" filter="url(#soft)"/>
    <rect x="-200" y="-95" width="400" height="190" rx="95" fill="${t.panel}" stroke="${t.a}" stroke-width="6" filter="url(#glow)"/>
    <circle cx="-105" cy="0" r="72" fill="url(#grad)"/>
    <text x="80" y="22" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="64" fill="#8a93ab" letter-spacing="6">OFF</text>
    <text x="-105" y="16" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="44" fill="${t.bg}">AI</text>
  </g>
</svg>`,

  truss: (t) => {
    const cx = 456, cy = 290, R = 210, r = 165, n = 14;
    let seg = '', nodes = '';
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
      const P = (rad, a) => [(cx + Math.cos(a) * rad).toFixed(1), (cy + Math.sin(a) * rad * 0.62).toFixed(1)];
      const [ox1, oy1] = P(R, a1), [ox2, oy2] = P(R, a2), [ix1, iy1] = P(r, a1), [ix2, iy2] = P(r, a2);
      const st = i < 11 ? 'stroke="url(#grad)" stroke-width="6"' : `stroke="${t.a}" stroke-width="4" stroke-dasharray="6 10" opacity="0.6"`;
      seg += `<line x1="${ox1}" y1="${oy1}" x2="${ox2}" y2="${oy2}" ${st}/><line x1="${ix1}" y1="${iy1}" x2="${ix2}" y2="${iy2}" ${st}/><line x1="${ox1}" y1="${oy1}" x2="${ix2}" y2="${iy2}" ${st}/><line x1="${ox1}" y1="${oy1}" x2="${ix1}" y2="${iy1}" ${st}/>`;
      nodes += `<circle cx="${ox1}" cy="${oy1}" r="7" fill="#f2f5ff"/><circle cx="${ix1}" cy="${iy1}" r="5" fill="${t.b}"/>`;
    }
    return `
<svg viewBox="0 0 912 560">${defs(t)}
  ${stars(50, 912, 560, 3)}
  <ellipse cx="${cx}" cy="${cy}" rx="240" ry="150" fill="${t.a}" opacity="0.14" filter="url(#soft)"/>
  <g filter="url(#glow)">${seg}${nodes}</g>
  <path d="M 760 80 L 700 170 L 640 200" stroke="#f2f5ff" stroke-width="10" stroke-linecap="round" fill="none"/>
  <rect x="740" y="50" width="70" height="50" rx="10" fill="${t.panel}" stroke="${t.b}" stroke-width="5"/>
  <circle cx="700" cy="170" r="12" fill="${t.a}"/>
  <path d="M 640 200 l -26 -14 M 640 200 l -20 22" stroke="${t.b}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="626" cy="214" r="18" fill="${t.a}" opacity="0.6" filter="url(#glow)"/>
</svg>`;
  },
};

// ---------- mosaic hook (multi-color first slide) ----------
const glowStyle = (c) => `style="filter: drop-shadow(0 0 10px ${c})"`;
const minis = {
  countdown: (t) => `<svg viewBox="0 0 400 170">
    <g transform="translate(200 85)" ${glowStyle(t.a)}>
      <circle r="66" fill="none" stroke="${t.panel}" stroke-width="12"/>
      <circle r="66" fill="none" stroke="${t.a}" stroke-width="12" stroke-linecap="round" stroke-dasharray="415" stroke-dashoffset="125" transform="rotate(-90)"/>
      <text y="30" text-anchor="middle" font-family="Inter" font-weight="900" font-size="84" fill="#fff">9</text>
    </g></svg>`,
  toggle: (t) => `<svg viewBox="0 0 400 170">
    <g transform="translate(200 85)" ${glowStyle(t.a)}>
      <rect x="-120" y="-56" width="240" height="112" rx="56" fill="${t.panel}" stroke="${t.a}" stroke-width="5"/>
      <circle cx="-62" r="42" fill="${t.a}"/>
      <text x="-62" y="11" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="30" fill="${t.bg}">AI</text>
      <text x="52" y="14" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="40" fill="${t.b}" letter-spacing="3">OFF</text>
    </g></svg>`,
  truss: (t) => {
    let s = '';
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
      const x1 = 200 + Math.cos(a1) * 120, y1 = 85 + Math.sin(a1) * 60, x2 = 200 + Math.cos(a2) * 120, y2 = 85 + Math.sin(a2) * 60;
      const xi = 200 + Math.cos(a2) * 92, yi = 85 + Math.sin(a2) * 44;
      const dash = i >= 10 ? 'stroke-dasharray="5 8" opacity="0.6"' : '';
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${t.a}" stroke-width="5" ${dash}/><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${xi.toFixed(1)}" y2="${yi.toFixed(1)}" stroke="${t.b}" stroke-width="3" ${dash}/><circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="5" fill="#fff"/>`;
    }
    return `<svg viewBox="0 0 400 170"><g ${glowStyle(t.a)}>${s}</g>
      <path d="M 360 10 L 330 40 L 305 52" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="305" cy="52" r="8" fill="${t.a}"/></svg>`;
  },
  reentry: (t) => `<svg viewBox="0 0 400 170">
    <path d="M 10 165 Q 200 115 390 165" fill="none" stroke="${t.a}" stroke-width="4" ${glowStyle(t.a)}/>
    <path d="M 40 0 Q 170 25 245 85" stroke="${t.a}" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.35"/>
    <path d="M 60 8 Q 175 30 245 85" stroke="${t.b}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <g transform="translate(258 94) rotate(40)" ${glowStyle(t.a)}>
      <rect x="-48" y="-18" width="28" height="36" rx="3" fill="${t.panel}" stroke="${t.a}" stroke-width="3"/>
      <rect x="-16" y="-14" width="40" height="28" rx="6" fill="${t.b}"/>
      <rect x="28" y="-18" width="28" height="36" rx="3" fill="${t.panel}" stroke="${t.a}" stroke-width="3"/>
    </g></svg>`,
};

const MOSAIC_CSS = `
body.l-mosaic {
  background:
    radial-gradient(520px 420px at 0% 0%, rgba(255,79,163,0.30), transparent 70%),
    radial-gradient(520px 420px at 100% 10%, rgba(46,230,184,0.24), transparent 70%),
    radial-gradient(560px 460px at 0% 100%, rgba(167,139,255,0.30), transparent 70%),
    radial-gradient(560px 460px at 100% 100%, rgba(255,138,61,0.28), transparent 70%),
    #07070d;
}
.l-mosaic h1 { font-size: 92px; line-height: 1.0; letter-spacing: -3.5px; margin: 46px 0 40px; }
.grad { background: linear-gradient(90deg, #ff4fa3, #a78bff 35%, #2ee6b8 65%, #ff8a3d); -webkit-background-clip: text; background-clip: text; color: transparent; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; flex: 1; }
.tile { position: relative; border-radius: 30px; padding: 22px 26px 26px; display: flex; flex-direction: column;
  background: linear-gradient(160deg, color-mix(in srgb, var(--a) 26%, var(--panel)), var(--panel) 70%);
  border: 2px solid color-mix(in srgb, var(--a) 55%, transparent);
  box-shadow: 0 0 50px color-mix(in srgb, var(--a) 22%, transparent), inset 0 1px 0 rgba(255,255,255,0.08); }
.tile .num { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 24px; color: var(--a); letter-spacing: 2px; }
.tile .mini { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.tile .mini svg { width: 100%; height: 100%; overflow: visible; }
.tile .label { font-size: 36px; line-height: 1.08; font-weight: 800; letter-spacing: -1px; color: #fff; }
.tile .label em { color: var(--a); }
.swipe { margin-top: 30px; display: flex; align-items: center; justify-content: space-between; }
.swipe span { font-size: 34px; font-weight: 600; color: #e9ecf5; }
.swipe b { display: inline-flex; align-items: center; justify-content: center; height: 70px; padding: 0 34px; border-radius: 999px; font-size: 30px; font-weight: 800; color: #07070d; letter-spacing: 1px;
  background: linear-gradient(90deg, #ff4fa3, #a78bff, #2ee6b8, #ff8a3d); box-shadow: 0 0 40px rgba(167,139,255,0.5); }
`;

// Custom SVG from content.json: {{a}} {{b}} {{bg}} {{panel}} {{deep}} are replaced with theme colors.
const fillSvg = (svg, t) => svg.replace(/\{\{(a|b|bg|panel|deep)\}\}/g, (_, k) => t[k]);

function mosaicSlide(c, total) {
  const tiles = c.hook.tiles.map((tile, i) => {
    const t = THEMES[tile.theme];
    const art = tile.svg ? fillSvg(tile.svg, t) : (minis[tile.mini] ? minis[tile.mini](t) : '');
    return `<div class="tile" style="--a:${t.a};--b:${t.b};--panel:${t.panel}">
      <div class="num">0${i + 1}</div>
      <div class="mini">${art}</div>
      <div class="label">${tile.label}</div>
    </div>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(THEMES.violet)}${MOSAIC_CSS}</style></head><body class="l-mosaic">
${header(c.date, 1, total)}
<h1>${c.hook.title}</h1>
<div class="grid">${tiles}</div>
<div class="swipe"><span>The full story on each →</span><b>SWIPE</b></div>
</body></html>`;
}

// ---------- slides ----------
const header = (date, p, total) => `
<div class="top">
  <div class="brand"><div class="bars"><i></i><i></i><i></i><i></i></div>DAILY LOW SIGNAL</div>
  <div class="meta">${date} · ${p}/${total}</div>
</div>`;

const page = (t, layout, inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${css(t)}</style></head><body class="l-${layout}">${inner}</body></html>`;
const visual = (t, name, value) => `<div class="visual">${visuals[name] ? visuals[name](t, value) : ''}</div>`;

function hookSlide(c, total) {
  if (c.hook.layout === 'mosaic') return mosaicSlide(c, total);
  const t = THEMES[c.hook.theme || 'blue'];
  return page(t, 'hook', `${header(c.date, 1, total)}
${visual(t, c.hook.visual)}
<div class="text">
  <h1>${c.hook.title}</h1>
  <div class="sub"><b>→</b>${c.hook.sub}</div>
</div>`);
}

function storySlide(c, s, n, total) {
  const t = THEMES[s.theme || 'blue'];
  const layout = s.layout || 'top';
  const v = s.svg ? `<div class="visual">${fillSvg(s.svg, t)}</div>` : visual(t, s.visual, s.visualValue);
  const text = `<div class="text">
  <div class="tag">${s.tag}</div>
  <h2>${s.headline}</h2>
  <p class="body">${s.body}</p>
  <div class="source">SOURCE: ${s.source}</div>
</div>`;
  let inner;
  if (layout === 'bottom') inner = text + v;
  else if (layout === 'card') inner = `<div class="card">${v}</div>` + text;
  else inner = v + text; // top, bleed
  return page(t, layout, header(c.date, n, total) + inner);
}

function buildSlides(content) {
  const total = 1 + content.stories.length;
  return [hookSlide(content, total), ...content.stories.map((s, i) => storySlide(content, s, i + 2, total))];
}

module.exports = { buildSlides };
