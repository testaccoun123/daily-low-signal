// PROTOTYPE — "Your shuffle is brand new" (52!). One continuous visualization across all 5 voice lines.
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { INTER, MONO, TL, clamp, rnd, shake, wordAt } from '../../theme';

export const ACCENT = '#a78bff';
const GOLD = '#ffd27a';
const BG = '#05060c';
const S = TL.scenes.map((s) => s.from);
const W = (sc: number, re: RegExp, fb: number) => S[sc] + wordAt(sc, re, fb);

const DIGITS = '80658175170943878571660636856403766975289505440883277824000000000000'; // 52!, 68 digits
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const ORDER = Array.from({ length: 52 }, (_, i) => i).sort((a, b) => rnd(a * 7.7 + 3) - rnd(b * 7.7 + 3));

const Suit: React.FC<{ s: number; size: number }> = ({ s, size }) => {
  const col = s === 1 || s === 2 ? '#e0294a' : '#14141c';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {s === 0 && <path d="M12 2 C 19 9 22 12 22 15 A4 4 0 0 1 13 16.5 L14.5 22 H9.5 L11 16.5 A4 4 0 0 1 2 15 C2 12 5 9 12 2Z" fill={col} />}
      {s === 1 && <path d="M12 21 C 5 15 2 11 2 7.5 A4.5 4.5 0 0 1 12 5 A4.5 4.5 0 0 1 22 7.5 C22 11 19 15 12 21Z" fill={col} />}
      {s === 2 && <path d="M12 2 L20 12 L12 22 L4 12Z" fill={col} />}
      {s === 3 && <g fill={col}><circle cx="12" cy="7" r="4.4" /><circle cx="7" cy="13" r="4.4" /><circle cx="17" cy="13" r="4.4" /><path d="M11 12 L9.5 22 H14.5 L13 12Z" /></g>}
    </svg>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; rot?: number; id: number; back?: boolean; glow?: number; op?: number }> = ({ x, y, w, rot = 0, id, back, glow = 0, op = 1 }) => {
  const h = w * 1.4, suit = Math.floor(id / 13), rank = RANKS[id % 13];
  const red = suit === 1 || suit === 2;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, rotate: `${rot}deg`, borderRadius: w * 0.1, opacity: op,
      background: back ? `repeating-linear-gradient(45deg, #2b2366 0 ${w * 0.08}px, #3b2f8a ${w * 0.08}px ${w * 0.16}px)` : '#f7f5ef',
      border: back ? `${Math.max(2, w * 0.05)}px solid #f7f5ef` : '1px solid #0003',
      boxShadow: `0 ${w * 0.06}px ${w * 0.15}px #0009${glow ? `, 0 0 ${glow * 40}px ${ACCENT}` : ''}`, boxSizing: 'border-box', overflow: 'hidden' }}>
      {!back && (
        <>
          <div style={{ position: 'absolute', left: w * 0.08, top: w * 0.04, fontFamily: INTER, fontWeight: 900, fontSize: w * 0.3, color: red ? '#e0294a' : '#14141c', lineHeight: 1 }}>{rank}</div>
          <div style={{ position: 'absolute', left: w * 0.25, top: h * 0.38 }}><Suit s={suit} size={w * 0.5} /></div>
        </>
      )}
    </div>
  );
};

const Stars: React.FC<{ f: number; speed: number }> = ({ f, speed }) => (
  <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    {Array.from({ length: 90 }).map((_, k) => {
      const z = 0.3 + rnd(k * 3.3) * 0.7;
      // radial drift outward = slow camera dolly
      const a = rnd(k * 1.7) * Math.PI * 2, r0 = rnd(k * 7.1) * 1100;
      const r = (r0 + f * speed * z) % 1100;
      return <circle key={k} cx={540 + Math.cos(a) * r} cy={800 + Math.sin(a) * r} r={z * 2.4} fill="#fff" opacity={(0.2 + 0.6 * z) * Math.min(1, r / 200)} />;
    })}
  </svg>
);

// fan geometry (hook end + payoff)
const fanPos = (k: number) => {
  const a = interpolate(k, [0, 51], [-62, 62]) * (Math.PI / 180);
  return { x: 540 + Math.sin(a) * 430, y: 1080 - Math.cos(a) * 430, rot: (a * 180) / Math.PI };
};
// grid geometry (build)
const CW = 70, GX = 46 + CW / 2, GY = 640;
const gridPos = (k: number) => ({ x: GX + (k % 13) * 76, y: GY + Math.floor(k / 13) * 104 });

export const Deck: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TL.total;

  // ---- key beats (absolute frames, all from word timings) ----
  const history = W(0, /^history$/i, 103);
  const t52 = W(1, /^fiftytwo$/i, 167), t51 = W(1, /^fiftyone$/i, 218), t50 = W(1, /^fifty$/i, 250), allW = W(1, /^All$/i, 270), one = W(1, /^one$/i, 307);
  const mult = W(2, /^Multiply$/i, 320), eight = W(2, /^eight$/i, 389), sixty = W(2, /^sixtyseven$/i, 410), zeros = W(2, /^zeros$/i, 429), behind = W(2, /^behind$/i, 442);
  const person = W(3, /^person$/i, 490), shuf = W(3, /^shuffling$/i, 518), second = W(3, /^second$/i, 548), since = W(3, /^since$/i, 569), bang = W(3, /^Bang$/i, 585);
  const dent = W(4, /^dent$/i, 637), so = W(4, /^So$/, 652), hands = W(4, /^hands$/i, 679), never = W(4, /^never$/i, 732);

  // card k lands in the grid at land(k): 52 / 51 / 50 on their words, the rest accelerate down to "one".
  const land = (k: number) => (k === 0 ? t52 : k === 1 ? t51 : k === 2 ? t50 : Math.round(interpolate(k, [3, 51], [allW, one + 2], { easing: Easing.out(Easing.quad) })));
  const landed = Array.from({ length: 52 }).filter((_, k) => f >= land(k)).length;

  const phase = f < S[1] ? 0 : f < S[2] ? 1 : f < S[3] ? 2 : f < S[4] ? 3 : 4;
  const [hx, hy] = shake(f, history, 22, 4);
  const [bx, by] = shake(f, bang, 40, 6);
  const [dx, dy] = shake(f, never, 26, 4);
  const [ex, ey] = shake(f, eight, 18, 3);
  void hx; void hy; void bx; void by; void dx; void dy; void ex; void ey;
  const camX = Math.sin(f / 70) * 6, camY = Math.cos(f / 90) * 5;
  const breathe = 1 + Math.sin(f / 60) * 0.006;

  // ---------- HOOK: stack splits, riffles twice, fans out on "history" ----------
  const hook = () => {
    const qWords = 'Has this exact shuffle ever happened before?'.split(' ');
    const fanS = (k: number) => spring({ frame: f - history - k * 0.25, fps, config: { damping: 22, stiffness: 110 } });
    const cards: React.ReactNode[] = [];
    if (f < history) {
      const P = 40, c = Math.floor(f / P), t = f - c * P;
      const split = interpolate(t, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const dropped = Math.max(0, Math.min(52, Math.floor((t - 9) / 0.55)));
      // side halves
      for (let side = 0; side < 2; side++) {
        const remain = 26 - Math.ceil(dropped / 2) + (side && dropped % 2 ? 0 : 0);
        for (let j = 0; j < Math.min(6, remain); j++) cards.push(<Card key={`s${side}${j}`} back id={0} w={150} x={540 + (side ? 1 : -1) * 230 * split} y={800 - j * 3} rot={(side ? 1 : -1) * 8 * split} />);
      }
      // falling interleaved cards
      for (let k = Math.max(0, dropped - 6); k < dropped; k++) {
        const age = (t - 9 - k * 0.55) / 4;
        const side = k % 2 ? 1 : -1;
        const p = Math.min(1, age);
        cards.push(<Card key={`d${k}`} back id={0} w={150} x={540 + side * 230 * (1 - p)} y={800 - 60 * Math.sin(p * Math.PI) - 20} rot={side * 8 * (1 - p)} />);
      }
      // centre pile
      const pile = Math.min(6, Math.ceil(dropped / 8));
      for (let j = 0; j < pile; j++) cards.push(<Card key={`p${j}`} back id={0} w={150} x={540} y={800 - j * 3} />);
      if (t < 9) for (let j = 0; j < 6; j++) cards.push(<Card key={`c${j}`} back id={0} w={150} x={540} y={800 - j * 3} op={1 - split} />);
    } else {
      for (let k = 0; k < 52; k++) {
        const s = fanS(k), p = fanPos(k);
        cards.push(<Card key={k} id={ORDER[k]} w={110} x={interpolate(s, [0, 1], [540, p.x])} y={interpolate(s, [0, 1], [800, p.y])} rot={p.rot * s} back={s < 0.5} glow={interpolate(f - history, [0, 30], [0.6, 0], clamp)} />);
      }
    }
    return (
      <>
        <div style={{ position: 'absolute', left: 70, right: 70, top: 200, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px', fontFamily: INTER, fontWeight: 900, fontSize: 82, lineHeight: 1.06, color: '#fff', textAlign: 'center' }}>
          {qWords.map((w, k) => {
            const s = spring({ frame: f - 2 - k * 3, fps, config: { damping: 22, stiffness: 110 } });
            const em = /shuffle|before/.test(w);
            return <span key={k} style={{ display: 'inline-block', opacity: s, translate: `0 ${(1 - s) * 50}px`, color: em ? ACCENT : '#fff' }}>{w}</span>;
          })}
        </div>
        {cards}
        <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [history, history + 6, history + 30], [0, 0.08, 0], clamp) }} />
      </>
    );
  };

  // ---------- BUILD: cards fly from the fan into a 13x4 grid, choices count down 52 -> 1 ----------
  const build = () => {
    const fall = interpolate(f, [mult, mult + 30], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    const choices = Math.max(1, 52 - landed);
    const cs = spring({ frame: f - (landed > 0 ? land(landed - 1) : S[1]), fps, config: { damping: 22, stiffness: 110 } });
    const terms = Array.from({ length: Math.min(landed + 1, 52) }, (_, k) => 52 - k);
    const shown = terms.length > 5 ? [...terms.slice(0, 3), '…', ...terms.slice(-2)] : terms;
    return (
      <>
        {f < mult + 8 && (
          <div style={{ opacity: interpolate(f, [mult, mult + 6], [1, 0], clamp) }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.22em', color: '#fffa' }}>
              {landed >= 52 ? 'EVERY CARD PLACED' : `CHOICES FOR CARD #${Math.min(52, landed + 1)}`}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 210, lineHeight: 1, color: ACCENT, textShadow: `0 0 60px ${ACCENT}`,
              scale: String(interpolate(cs, [0, 1], [1.08, 1])) }}>{choices}</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 44, color: '#fff' }}>{shown.join(' × ')}</div>
          </div>
        )}
        {Array.from({ length: 52 }).map((_, k) => {
          const L = land(k), from = fanPos(k), to = gridPos(k);
          const p = interpolate(f, [L - 14, L], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
          const g = gridPos(k);
          const dropY = fall * (900 + rnd(k) * 600) ;
          const flash = interpolate(f, [L, L + 18], [0.7, 0], clamp);
          if (f < L - 14 && f >= S[1]) return <Card key={k} id={ORDER[k]} w={110} x={from.x} y={from.y + interpolate(f, [S[1], S[1] + 20], [0, 260], { ...clamp, easing: Easing.inOut(Easing.cubic) })} rot={from.rot} op={0.9} />;
          return <Card key={k} id={ORDER[k]} w={interpolate(p, [0, 1], [110, CW])} x={interpolate(p, [0, 1], [from.x, to.x]) + (fall ? (rnd(k * 3) - 0.5) * 300 * fall : 0)}
            y={interpolate(p, [0, 1], [from.y + 260, g.y]) + dropY - Math.sin(p * Math.PI) * 60} rot={interpolate(p, [0, 1], [from.rot, 0]) + fall * (rnd(k * 9) - 0.5) * 200} glow={flash} op={1 - fall * 0.6} />;
        })}
      </>
    );
  };

  // ---------- NUMBER: 68 digits stream in, the 8 lights up, the rest become "zeros", collapse to 8 x 10^67 ----------
  const number = () => {
    const per = 12, startF = mult + 6, endF = eight - 2;
    const collapse = spring({ frame: f - behind + 4, fps, config: { damping: 22, stiffness: 110 } });
    const sci = spring({ frame: f - behind, fps, config: { damping: 22, stiffness: 110 } });
    const [sx, sy] = shake(f, behind, 30, 4);
    return (
      <>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.22em', color: '#fffa', opacity: (1 - collapse) * interpolate(f, [mult + 6, mult + 12], [0, 1], clamp) }}>
          52 × 51 × 50 × … × 1 =
        </div>
        {DIGITS.split('').map((d, i) => {
          const at = startF + (i / 67) * (endF - startF);
          if (f < at) return null;
          const s = spring({ frame: f - at, fps, config: { damping: 22, stiffness: 110 } });
          const row = Math.floor(i / per), col = i % per;
          const x = 540 + (col - (per - 1) / 2) * 66, y = 330 + row * 108;
          const isEight = i === 0;
          const zeroAt = zeros - 8 + (i / 67) * 14;
          const showZero = !isEight && f >= zeroAt;
          const zs = spring({ frame: f - zeroAt, fps, config: { damping: 22, stiffness: 110 } });
          const lit = isEight ? interpolate(f, [eight, eight + 4], [0, 1], clamp) : f >= sixty ? interpolate(f, [sixty, sixty + 10], [0, 1], clamp) : 0;
          const cx = interpolate(collapse, [0, 1], [x, 540]), cy = interpolate(collapse, [0, 1], [y, 700]);
          return (
            <div key={i} style={{ position: 'absolute', left: cx - 33, top: cy - 50, width: 66, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 92, lineHeight: 1,
              color: isEight ? (lit ? GOLD : '#fff') : lit ? ACCENT : '#fff', textShadow: isEight && lit ? `0 0 40px ${GOLD}` : 'none',
              scale: String(interpolate(s, [0, 1], [1.12, 1]) * (isEight ? 1 + lit * 0.35 : 1) * (showZero ? interpolate(zs, [0, 1], [1.06, 1]) : 1)), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) * (1 - collapse) }}>
              {showZero ? '0' : d}
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', translate: `${sx}px ${sy}px`,
          scale: String(Math.max(0.9, interpolate(sci, [0, 1], [1.15, 1]))), opacity: interpolate(sci, [0, 0.2], [0, 1], clamp) }}>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 230, lineHeight: 1, color: '#fff', textShadow: `0 0 70px ${ACCENT}`, whiteSpace: 'nowrap' }}>
            <span style={{ color: '#fff8' }}>≈</span>8×10<sup style={{ fontSize: 120, color: GOLD }}>67</sup>
          </div>
          <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: '0.2em', color: '#fffc' }}>POSSIBLE ORDERS</div>
        </div>
      </>
    );
  };

  // ---------- TWIST: Earth, 8 billion people, a shuffle every second since the Big Bang ----------
  const twist = () => {
    const e = spring({ frame: f - S[3], fps, config: { damping: 22, stiffness: 100 } });
    const ppl = interpolate(f, [person - 6, person + 16], [0, 1], clamp);
    const lbl1 = spring({ frame: f - person, fps, config: { damping: 22, stiffness: 110 } });
    const lbl2 = spring({ frame: f - second, fps, config: { damping: 22, stiffness: 110 } });
    const years = interpolate(f, [since, bang], [0, 13.8], { ...clamp, easing: Easing.in(Easing.cubic) });
    const yrs = spring({ frame: f - since, fps, config: { damping: 22, stiffness: 90 } });
    const shufs = spring({ frame: f - bang - 6, fps, config: { damping: 22, stiffness: 110 } });
    const target = spring({ frame: f - S[3], fps, config: { damping: 22, stiffness: 110 } });
    const N = 110;
    return (
      <>
        <Stars f={f - S[3]} speed={f > since ? 2 + (f - since) * 0.22 : 1.5} />
        {/* the giant number parked at the top as the target */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: interpolate(target, [0, 1], [560, 200]), textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: interpolate(target, [0, 1], [230, 70]), color: '#fffc', whiteSpace: 'nowrap' }}>
          ≈8×10<sup style={{ fontSize: '0.52em', color: GOLD }}>67</sup> <span style={{ fontFamily: MONO, fontSize: 30, letterSpacing: '0.15em', opacity: target }}>ORDERS</span>
        </div>
        {/* Earth */}
        <div style={{ position: 'absolute', left: 540 - 190, top: 760 - 190, width: 380, height: 380, borderRadius: '50%', scale: String(e), rotate: `${(f - S[3]) * 0.4}deg`,
          background: 'radial-gradient(circle at 35% 30%, #6fb2ff 0%, #2a6fd0 30%, #0d2f6e 70%, #061533 100%)', boxShadow: '0 0 80px #4f8fe099, inset -30px -30px 60px #000a', overflow: 'hidden' }}>
          {[[60, 90, 120, 70], [200, 60, 90, 110], [120, 220, 150, 80], [250, 230, 70, 60]].map(([x, y, w, h], k) => <div key={k} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: '45%', background: '#3fa86b', opacity: 0.85 }} />)}
        </div>
        {/* people + their flicked cards */}
        {Array.from({ length: N }).map((_, k) => {
          const a = (k / N) * Math.PI * 2 + rnd(k) * 0.05, show = ppl * N > k;
          if (!show) return null;
          const px = 540 + Math.cos(a) * 205, py = 760 + Math.sin(a) * 205;
          const out: React.ReactNode[] = [<div key={`p${k}`} style={{ position: 'absolute', left: px - 5, top: py - 5, width: 10, height: 10, borderRadius: 5, background: '#fff', boxShadow: `0 0 8px ${ACCENT}` }} />];
          if (f >= shuf) {
            const period = f > since ? 14 : 26;
            const t = ((f - shuf + rnd(k * 3) * period) % period) / period;
            const r = 205 + t * (f > since ? 420 : 160);
            out.push(<div key={`c${k}`} style={{ position: 'absolute', left: 540 + Math.cos(a) * r - 7, top: 760 + Math.sin(a) * r - 10, width: 14, height: 20, borderRadius: 2, background: '#f7f5ef', rotate: `${a * 57 + t * 300}deg`, opacity: 1 - t }} />);
          }
          return out;
        })}
        <div style={{ position: 'absolute', left: 60, top: 400, fontFamily: INTER, fontWeight: 900, fontSize: 64, color: '#fff', lineHeight: 1.05, opacity: interpolate(lbl1, [0, 0.3], [0, 1], clamp), translate: `${(1 - lbl1) * -200}px 0` }}>8 BILLION+<br /><span style={{ color: ACCENT }}>PEOPLE</span></div>
        <div style={{ position: 'absolute', right: 60, top: 400, textAlign: 'right', fontFamily: INTER, fontWeight: 900, fontSize: 64, color: '#fff', lineHeight: 1.05, opacity: interpolate(lbl2, [0, 0.3], [0, 1], clamp), translate: `${(1 - lbl2) * 200}px 0` }}>1 SHUFFLE<br /><span style={{ color: ACCENT }}>/ SECOND</span></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', opacity: yrs }}>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: f >= bang ? GOLD : '#fff', fontVariantNumeric: 'tabular-nums' }}>{years.toFixed(1)} BILLION YEARS</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: '0.12em', color: '#fff', opacity: interpolate(shufs, [0, 0.3], [0, 1], clamp), scale: String(Math.max(0.9, interpolate(shufs, [0, 1], [1.12, 1]))) }}>
          = ~3.6×10<sup style={{ fontSize: 24 }}>27</sup> SHUFFLES
        </div>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${GOLD}, transparent 70%)`, opacity: interpolate(f, [bang - 4, bang + 6, bang + 40], [0, 0.18, 0], clamp) }} />
      </>
    );
  };

  // ---------- PAYOFF: bar vs invisible sliver, endless zoom, then the deck returns: BRAND NEW ----------
  const payoff = () => {
    const bars = spring({ frame: f - S[4], fps, config: { damping: 22, stiffness: 110 } });
    const still = W(4, /^still$/i, 605);
    const zoom = interpolate(f, [still, so - 4], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    const exp = Math.floor(zoom * 40);
    const out = interpolate(f, [so - 4, so + 4], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    const pct = '0.' + '0'.repeat(38) + '44%';
    const fanIn = (k: number) => spring({ frame: f - so - k * 0.3, fps, config: { damping: 22, stiffness: 110 } });
    const stamp = spring({ frame: f - never, fps, config: { damping: 22, stiffness: 110 } });
    const close = interpolate(f, [T - 26, T - 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    return (
      <>
        {f < so + 4 && (
          <div style={{ opacity: 1 - out }}>
            <div style={{ position: 'absolute', left: 60, top: 300, fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: '0.16em', color: '#fffc' }}>ALL POSSIBLE ORDERS</div>
            <div style={{ position: 'absolute', left: 60, top: 350, height: 110, width: 960 * bars, background: ACCENT, borderRadius: 12, boxShadow: `0 0 50px ${ACCENT}88` }} />
            <div style={{ position: 'absolute', left: 60, top: 540, fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: '0.16em', color: '#fffc', opacity: bars }}>EVERY SHUFFLE, EVER</div>
            <div style={{ position: 'absolute', left: 60, top: 590, height: 110, width: 3, background: GOLD, opacity: bars * (0.4 + 0.6 * Math.abs(Math.sin(f / 4))) }} />
            {/* zoom ticks rushing past */}
            {zoom > 0 && Array.from({ length: 16 }).map((_, k) => <div key={k} style={{ position: 'absolute', left: 60 + (((k * 70 - f * 8 * (1 + zoom * 3)) % 1120) + 1120) % 1120, top: 330, width: 2, height: 400, background: '#ffffff22' }} />)}
            {zoom > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: interpolate(zoom, [0, 0.08], [0, 1], clamp) }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: '#fff' }}>ZOOM ×10<sup style={{ fontSize: 32, color: GOLD }}>{exp}</sup></div>
                <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: '0.12em', color: '#fffc' }}>SHARE ALREADY SHUFFLED</div>
                <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: GOLD, wordBreak: 'break-all', padding: '0 20px', opacity: f >= dent ? 1 : 0 }}>{pct}</div>
              </div>
            )}
          </div>
        )}
        {f >= so && Array.from({ length: 52 }).map((_, k) => {
          const s = fanIn(k), p = fanPos(k);
          const c = close;
          return <Card key={k} id={ORDER[51 - k]} w={110} back={c > 0.5}
            x={interpolate(c, [0, 1], [interpolate(s, [0, 1], [540, p.x]), 540])} y={interpolate(c, [0, 1], [interpolate(s, [0, 1], [800, p.y]), 800 - (k % 6) * 3])}
            rot={interpolate(c, [0, 1], [p.rot * s, 0])} />;
        })}
        {f >= so && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 70, color: '#fff', opacity: interpolate(f, [hands, hands + 8], [0, 1], clamp) * (1 - close) * (1 - interpolate(f, [never - 4, never], [0, 1], clamp)) }}>
            THE DECK IN <span style={{ color: ACCENT }}>YOUR HANDS</span>
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 320, display: 'flex', justifyContent: 'center', opacity: interpolate(stamp, [0, 0.2], [0, 1], clamp) * (1 - close),
          scale: String(Math.max(0.9, interpolate(stamp, [0, 1], [1.15, 1]))), rotate: `${interpolate(stamp, [0, 1], [-14, -4])}deg` }}>
          <div style={{ padding: '10px 36px', border: `10px solid ${GOLD}`, borderRadius: 20, fontFamily: INTER, fontWeight: 900, fontSize: 120, color: GOLD, background: '#05060ccc', textShadow: `0 0 30px ${GOLD}88` }}>BRAND NEW</div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.18em', color: '#fffc', opacity: interpolate(stamp, [0.3, 1], [0, 1], clamp) * (1 - close) }}>(ALMOST CERTAINLY)</div>
      </>
    );
  };

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, #151034 0%, ${BG} 68%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, translate: `${camX}px ${camY}px`, scale: String(breathe) }}>
        {phase === 0 && hook()}
        {(phase === 1 || (phase === 2 && f < mult + 30)) && build()}
        {phase === 2 && number()}
        {phase === 3 && twist()}
        {phase === 4 && payoff()}
      </div>
    </AbsoluteFill>
  );
};
