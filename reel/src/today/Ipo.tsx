import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Sequence } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, shake, wordAt } from '../theme';

const T = THEMES.pink;

const Rays: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <AbsoluteFill style={{ background: `repeating-conic-gradient(from ${f * 0.8}deg at 50% 42%, ${color}22 0deg 6deg, transparent 6deg 18deg)` }} />
);

const Ticker: React.FC<{ f: number; top: number }> = ({ f, top }) => (
  <div style={{ position: 'absolute', left: 0, top, width: 4000, height: 70, background: T.a, display: 'flex', alignItems: 'center', translate: `${-((f * 9) % 1000)}px 0`, rotate: '-4deg',
    fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: '0.2em', color: T.bg, whiteSpace: 'nowrap' }}>
    {Array.from({ length: 6 }).map((_, k) => <span key={k} style={{ marginRight: 60 }}>NASDAQ: ANT ▲ · IPO DAY ·</span>)}
  </div>
);

// Shot A: the Anthropic wordmark crashes in from deep space and lands on "Anthropic".
const Logo: React.FC<{ land: number }> = ({ land }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(f, [0, land], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const bounce = spring({ frame: f - land, fps, config: { damping: 20, stiffness: 120 } });
  const [sx, sy] = shake(f, land, 4, 12);
  const sub = spring({ frame: f - 2, fps, config: { damping: 20, stiffness: 100 } });
  const ring = interpolate(f, [land, land + 18], [0, 1], clamp);
  const zoom = interpolate(f, [land, land + 60], [1, 1.12], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${T.deep} 0%, ${T.bg} 65%)`, translate: `${sx}px ${sy}px`, overflow: 'hidden' }}>
      <Rays f={f} color={T.a} />
      <Ticker f={f} top={960} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.3em', color: T.b, opacity: sub, translate: `0 ${(1 - sub) * -40}px` }}>CLAUDE&apos;S MAKER</div>
      <div style={{ position: 'absolute', left: 540, top: 700, width: 10, height: 10, opacity: ring > 0 && ring < 1 ? 1 : 0 }}>
        <div style={{ position: 'absolute', left: -500 * ring, top: -500 * ring, width: 1000 * ring, height: 1000 * ring, borderRadius: '50%', border: `${26 * (1 - ring)}px solid ${T.a}`, opacity: 1 - ring }} />
      </div>
      <Img src={staticFile('photo-1.png')} style={{
        position: 'absolute', left: 90, top: 650, width: 900, filter: `invert(1) drop-shadow(0 0 30px ${T.a})`,
        scale: String((f < land ? interpolate(p, [0, 1], [0.05, 1.4]) : interpolate(bounce, [0, 1], [1.4, 1])) * zoom),
        rotate: `${f < land ? interpolate(p, [0, 1], [-25, 0]) : 0}deg`, opacity: interpolate(p, [0, 0.1], [0, 1], clamp),
      }} />
      <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [land, land + 5, land + 28], [0, 0.12, 0], clamp) }} />
    </AbsoluteFill>
  );
};

// Shot B: BIGGEST / IPO / EVER slam in one per word; "EVER" detonates a confetti blast + RECORD stamp.
const Record: React.FC<{ beats: number[] }> = ({ beats }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ['BIGGEST', 'IPO', 'EVER'];
  const last = beats[2];
  const sh = beats.map((b, i) => shake(f, b, [3, 4, 6][i], 12));
  const sx = sh.reduce((a, s) => a + s[0], 0), sy = sh.reduce((a, s) => a + s[1], 0);
  const stamp = spring({ frame: f - last - 4, fps, config: { damping: 20, stiffness: 120 } });
  const dutch = interpolate(f, [0, last], [-6, 4], clamp);
  return (
    <AbsoluteFill style={{ background: f >= last ? T.a : `radial-gradient(circle at 50% 45%, ${T.deep}, ${T.bg} 70%)`, overflow: 'hidden' }}>
      {f >= last && <Rays f={f * 2} color="#ffffff" />}
      <div style={{ position: 'absolute', inset: 0, translate: `${sx}px ${sy}px`, rotate: `${dutch}deg` }}>
        {words.map((w, i) => {
          const s = spring({ frame: f - beats[i], fps, config: { damping: 20, stiffness: 120 } });
          const big = i === 2;
          return (
            <div key={w} style={{ position: 'absolute', left: 0, right: 0, top: 330 + i * 250, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: big ? 300 : 210, lineHeight: 1, letterSpacing: '-0.04em',
              color: f >= last ? (big ? '#fff' : T.bg) : i === 1 ? T.a : '#fff', textShadow: f >= last ? '0 14px 0 #0006' : `0 0 50px ${T.a}`,
              scale: String(interpolate(s, [0, 1], [1.15, 1])), opacity: interpolate(s, [0, 0.15], [0, 1], clamp) }}>{w}</div>
          );
        })}
        {/* confetti / bill blast */}
        {f >= last && Array.from({ length: 60 }).map((_, k) => {
          const t = f - last;
          const a = rnd(k * 3.7) * Math.PI * 2, v = 14 + rnd(k * 5.1) * 34;
          return <div key={k} style={{ position: 'absolute', left: 540 + Math.cos(a) * v * t, top: 840 + Math.sin(a) * v * t + 0.8 * t * t, width: k % 3 ? 22 : 70, height: k % 3 ? 22 : 36, borderRadius: 4,
            background: k % 3 ? ['#fff', T.b, '#ffe08a'][k % 3] : '#7fe0a0', border: k % 3 ? 'none' : '3px solid #2f7a4a', rotate: `${t * (rnd(k) * 40 - 20)}deg` }} />;
        })}
      </div>
      <div style={{ position: 'absolute', left: 620, top: 210, padding: '10px 28px', border: '10px solid #fff', borderRadius: 18, fontFamily: MONO, fontWeight: 800, fontSize: 70, color: '#fff', letterSpacing: '0.1em',
        scale: String(interpolate(stamp, [0, 1], [1.15, 1])), opacity: interpolate(stamp, [0, 0.2], [0, 1], clamp), rotate: `${interpolate(stamp, [0, 1], [-30, 10])}deg` }}>RECORD</div>
    </AbsoluteFill>
  );
};

// Shot C: price chart idles at $83, then on "thirty-four" the line rockets up and SMASHES the top of the screen.
const Chart: React.FC<{ jump: number; opened: number }> = ({ jump, opened }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(f, [0, opened], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const up = interpolate(f, [jump - 6, jump], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const hit = jump;
  const [sx, sy] = shake(f, hit, 9, 18);
  const big = spring({ frame: f - hit - 2, fps, config: { damping: 20, stiffness: 120 } });
  const camY = interpolate(up, [0, 1], [0, 140]);
  const X0 = 80, BASE = 980;
  const flat = Array.from({ length: 12 }).map((_, k) => [X0 + k * 60, BASE + Math.sin(k * 1.7) * 14 + (rnd(k) - 0.5) * 18]);
  const n = Math.max(2, Math.floor(draw * flat.length));
  const tipX = flat[n - 1][0], tipY = flat[n - 1][1];
  const pts = [...flat.slice(0, n), ...(up > 0 ? [[tipX + 120 * up, tipY - (BASE + 200) * up]] : [])];
  const crack = f >= hit;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${T.panel}, ${T.bg})`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, translate: `${sx}px ${sy + camY}px` }}>
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {Array.from({ length: 14 }).map((_, k) => <line key={k} x1="0" x2="1080" y1={200 + k * 80} y2={200 + k * 80} stroke="#ffffff10" strokeWidth="2" />)}
          <line x1="0" x2="1080" y1={BASE} y2={BASE} stroke={T.b} strokeWidth="4" strokeDasharray="16 14" opacity="0.7" />
          <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={T.a} strokeWidth="16" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${18 + up * 30}px ${T.a})` }} />
          {up > 0 && up < 1 && <circle cx={tipX + 120 * up} cy={tipY - (BASE + 200) * up} r="26" fill="#fff" />}
        </svg>
        <div style={{ position: 'absolute', left: 80, top: BASE + 24, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: T.b, letterSpacing: '0.12em' }}>IPO PRICE $83</div>
      </div>
      {/* screen cracks radiating from the impact point at the top */}
      {crack && (
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 14 }).map((_, k) => {
            const a = Math.PI * (0.05 + (k / 13) * 0.9) + (rnd(k) - 0.5) * 0.2, L = 200 + rnd(k * 3) * 520 * Math.min(1, (f - hit + 2) / 4);
            const mx = 760 + Math.cos(a) * L * 0.5 + (rnd(k * 7) - 0.5) * 60, my = 170 + Math.sin(a) * L * 0.5;
            return <path key={k} d={`M 760 170 L ${mx} ${my} L ${760 + Math.cos(a) * L} ${170 + Math.sin(a) * L}`} stroke="#fff" strokeWidth={5 - (k % 3)} fill="none" opacity="0.85" />;
          })}
          <circle cx="760" cy="170" r="40" fill="#fff" opacity={interpolate(f - hit, [0, 8], [1, 0.3], clamp)} />
        </svg>
      )}
      {/* falling glass shards */}
      {crack && Array.from({ length: 22 }).map((_, k) => {
        const t = f - hit;
        return <div key={k} style={{ position: 'absolute', left: 760 + (rnd(k * 2.3) - 0.5) * 500 + (rnd(k) - 0.5) * t * 10, top: 160 + rnd(k * 4.1) * 80 + 1.4 * t * t, width: 20 + rnd(k) * 40, height: 14 + rnd(k * 9) * 30,
          background: '#ffffffcc', clipPath: 'polygon(0 0, 100% 30%, 60% 100%)', rotate: `${t * 20 * (rnd(k * 5) - 0.5)}deg`, opacity: interpolate(t, [10, 30], [1, 0], clamp) }} />;
      })}
      <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [hit, hit + 5, hit + 28], [0, 0.12, 0], clamp) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', translate: `${sx * 0.4}px ${sy * 0.4}px`,
        scale: String(Math.max(0.88, interpolate(big, [0, 1], [1.15, 1]))), opacity: interpolate(big, [0, 0.2], [0, 1], clamp) }}>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 290, lineHeight: 1, color: '#fff', letterSpacing: '-0.04em', textShadow: `0 0 70px ${T.a}, 0 12px 0 #000` }}>+34%</div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 800, fontSize: 46, color: '#fff', background: '#000b', padding: '8px 22px', letterSpacing: '0.12em' }}>AT THE OPEN</div>
      </div>
    </AbsoluteFill>
  );
};

export const Ipo: React.FC<{ dur: number }> = ({ dur }) => {
  const anth = wordAt(1, /^Anthropic$/i, 22);
  const big = wordAt(1, /^biggest$/i, 63) - 3;
  const ipo = wordAt(1, /^IPO$/i, 75);
  const ever = wordAt(1, /^ever$/i, 92);
  const shares = wordAt(1, /^Shares$/i, 105) - 3;
  const opened = wordAt(1, /^opened$/i, 116);
  const jump = wordAt(1, /^thirtyfour$/i, 133);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={big}><Logo land={anth} /></Sequence>
      <Sequence from={big} durationInFrames={shares - big}><Record beats={[3, ipo - big, ever - big]} /></Sequence>
      <Sequence from={shares} durationInFrames={dur - shares + 30}><Chart opened={opened - shares} jump={jump - shares} /></Sequence>
    </AbsoluteFill>
  );
};
