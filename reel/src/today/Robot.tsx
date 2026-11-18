import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, wordAt } from '../theme';

const T = THEMES.violet;
const N = 8, R = 250, L1 = 150, L2 = 150, STEP = 10, START = 4;
const BIN = { x: 0, y: 70 };

export const Stars: React.FC<{ f: number; n?: number; speed?: number }> = ({ f, n = 120, speed = 0.3 }) => (
  <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    {Array.from({ length: n }).map((_, k) => {
      const z = 0.3 + rnd(k * 3.3) * 0.7;
      const y = (rnd(k * 7.1) * 1920 + f * speed * z * 6) % 1920;
      return <circle key={k} cx={rnd(k * 1.7) * 1080} cy={y} r={z * 2.6} fill="#fff" opacity={0.3 + 0.7 * z * (0.6 + 0.4 * Math.sin(f / 6 + k))} />;
    })}
  </svg>
);

const ik = (x: number, y: number) => {
  const d = Math.min(L1 + L2 - 1, Math.max(1, Math.hypot(x, y)));
  const e = Math.acos((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2));
  const s = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(e), L1 + L2 * Math.cos(e));
  return { s, e };
};
const segPoint = (i: number) => { const a = -Math.PI / 2 + ((i + 0.5) / N) * Math.PI * 2; return { x: R * Math.cos(a), y: R * Math.sin(a) }; };
const arc = (i: number, r = R) => {
  const a0 = -Math.PI / 2 + (i / N) * Math.PI * 2 + 0.03, a1 = -Math.PI / 2 + ((i + 1) / N) * Math.PI * 2 - 0.03;
  return `M ${r * Math.cos(a0)} ${r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`;
};

export const Robot: React.FC<{ dur: number }> = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const done = wordAt(3, /^own$/i, 88);
  const no = wordAt(3, /^No$/, 103);
  const step = Math.max(STEP, Math.floor((done - START) / N));
  // Gripper target: bin -> segment i -> back.
  const k = Math.min(N - 1, Math.max(0, Math.floor((f - START) / step)));
  const lp = (f - START - k * step) / step;
  const tgt = segPoint(k);
  const going = interpolate(lp, [0, 0.55], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const back = interpolate(lp, [0.6, 1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const finished = f >= START + N * step;
  const px = finished ? BIN.x : BIN.x + (tgt.x - BIN.x) * (going - back);
  const py = finished ? BIN.y - 40 : BIN.y + (tgt.y - BIN.y) * (going - back);
  const { s, e } = ik(px, py);
  const ex = L1 * Math.cos(s), ey = L1 * Math.sin(s);
  const placed = (i: number) => f >= START + i * step + step * 0.55;
  const carrying = !finished && lp < 0.55 && f >= START;

  const mesh = spring({ frame: f - done, fps, config: { damping: 12, stiffness: 90 } });
  const pull = spring({ frame: f - no + 2, fps, config: { damping: 16, stiffness: 70 } });
  const tilt = interpolate(f, [0, done], [34, 14], clamp);
  const cam = interpolate(f, [0, done], [1.0, 1.18], { ...clamp, easing: Easing.in(Easing.quad) }) * interpolate(pull, [0, 1], [1, 0.42]);
  const stamp = spring({ frame: f - no - 2, fps, config: { damping: 9, stiffness: 220 } });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, ${T.panel}, ${T.bg} 70%)`, overflow: 'hidden' }}>
      <Stars f={f} />
      {/* Earth limb */}
      <div style={{ position: 'absolute', left: -700, top: interpolate(pull, [0, 1], [1700, 1250]), width: 2480, height: 2480, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 8%, #3b6fd6 0%, #123a7a 18%, #050b26 40%)', boxShadow: '0 -20px 120px #6aa0ff88, inset 0 30px 60px #9cc4ff55' }} />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div style={{ position: 'absolute', left: 540, top: interpolate(pull, [0, 1], [700, 560]), width: 0, height: 0, rotate: `x ${tilt}deg`, scale: String(cam) }}>
          <div style={{ rotate: `${f * 0.35}deg` }}>
            <svg width="800" height="800" viewBox="-400 -400 800 800" style={{ position: 'absolute', left: -400, top: -400, overflow: 'visible' }}>
              {/* reflective mesh unfolding */}
              <g opacity={mesh} transform={`scale(${mesh})`}>
                <circle r={R - 20} fill={`url(#meshg)`} />
                {Array.from({ length: 24 }).map((_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1="0" y1="0" x2={(R - 20) * Math.cos(a)} y2={(R - 20) * Math.sin(a)} stroke={T.b} strokeWidth="1.5" opacity="0.6" />; })}
                {[0.33, 0.66].map((q) => <circle key={q} r={(R - 20) * q} stroke={T.b} strokeWidth="1.5" fill="none" opacity="0.5" />)}
              </g>
              <defs>
                <radialGradient id="meshg"><stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="1" stopColor={T.a} stopOpacity="0.15" /></radialGradient>
              </defs>
              {/* ring slots + placed segments */}
              {Array.from({ length: N }).map((_, i) => <path key={`g${i}`} d={arc(i)} stroke="rgba(255,255,255,0.12)" strokeWidth="44" fill="none" strokeDasharray="8 10" />)}
              {Array.from({ length: N }).map((_, i) => {
                if (!placed(i)) return null;
                const at = START + i * step + step * 0.55;
                const fl = interpolate(f - at, [0, 6], [1, 0], clamp);
                return <path key={i} d={arc(i)} stroke={T.a} strokeWidth="44" fill="none" strokeLinecap="butt" style={{ filter: `drop-shadow(0 0 ${10 + fl * 40}px ${fl > 0.1 ? '#fff' : T.a})` }} />;
              })}
              {/* sparks at each lock */}
              {Array.from({ length: N }).map((_, i) => {
                const at = START + i * step + step * 0.55;
                const t = f - at;
                if (t < 0 || t > 10) return null;
                const p = segPoint(i);
                return Array.from({ length: 8 }).map((__, j) => {
                  const a = rnd(i * 10 + j) * Math.PI * 2, v = 6 + rnd(j + i) * 10;
                  return <line key={`${i}-${j}`} x1={p.x + Math.cos(a) * v * t * 0.6} y1={p.y + Math.sin(a) * v * t * 0.6} x2={p.x + Math.cos(a) * v * t} y2={p.y + Math.sin(a) * v * t} stroke="#fff" strokeWidth="4" opacity={1 - t / 10} strokeLinecap="round" />;
                });
              })}
              {/* carried segment */}
              {carrying && <path d={arc(k)} stroke={T.b} strokeWidth="44" fill="none" transform={`translate(${px - tgt.x} ${py - tgt.y})`} opacity="0.95" />}
              {/* robot arm */}
              <g opacity={interpolate(pull, [0, 0.5], [1, 0], clamp)} style={{ filter: `drop-shadow(0 0 14px ${T.a})` }}>
                <circle r="44" fill="#2a2450" stroke={T.a} strokeWidth="8" />
                <line x1="0" y1="0" x2={ex} y2={ey} stroke="#f2efff" strokeWidth="36" strokeLinecap="round" />
                <line x1={ex} y1={ey} x2={px} y2={py} stroke="#d6ceff" strokeWidth="28" strokeLinecap="round" />
                <circle cx={ex} cy={ey} r="18" fill={T.a} />
                <circle cx={px} cy={py} r="14" fill="#fff" />
                <path d={`M ${px} ${py} l ${16 * Math.cos(s + e + 0.6)} ${16 * Math.sin(s + e + 0.6)} M ${px} ${py} l ${16 * Math.cos(s + e - 0.6)} ${16 * Math.sin(s + e - 0.6)}`} stroke="#fff" strokeWidth="8" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      </AbsoluteFill>
      {/* readout */}
      <div style={{ position: 'absolute', left: 60, top: 190, fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.18em', color: T.b, opacity: interpolate(pull, [0, 0.4], [1, 0], clamp) }}>
        ASSEMBLY {Math.min(N, Array.from({ length: N }).filter((_, i) => placed(i)).length)}/{N}
        <div style={{ marginTop: 10, width: 300, height: 8, background: '#ffffff22', borderRadius: 4 }}>
          <div style={{ width: `${(Array.from({ length: N }).filter((_, i) => placed(i)).length / N) * 100}%`, height: '100%', background: T.a, borderRadius: 4 }} />
        </div>
      </div>
      {/* NO ASTRONAUTS stamp */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        scale: String(interpolate(stamp, [0, 1], [2.6, 1])), opacity: interpolate(stamp, [0, 0.25], [0, 1], clamp), rotate: `${interpolate(stamp, [0, 1], [10, -4])}deg` }}>
        <svg width="190" height="190" viewBox="0 0 100 100">
          <circle cx="50" cy="46" r="34" fill="#e8e6ff" /><rect x="28" y="32" width="44" height="26" rx="12" fill="#1c1640" /><rect x="34" y="78" width="32" height="14" rx="5" fill="#e8e6ff" />
          <line x1="10" y1="90" x2="90" y2="10" stroke="#ff4f6a" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 92, color: '#fff', padding: '6px 26px', border: `8px solid ${T.a}`, borderRadius: 18, background: '#07051acc' }}>NO ASTRONAUTS</div>
      </div>
    </AbsoluteFill>
  );
};
