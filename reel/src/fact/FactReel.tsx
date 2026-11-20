// "Fact" format: ONE incredible fact visualized as one continuous animation (25–40 s).
// Shares the voice/timeline pipeline with the news reel (prepare-kokoro.mjs -> src/timeline.json),
// but has its own chrome: a single progress bar, the fact's own scene in src/fact/today, and sound cues
// in src/fact/today/cues.js (rendered by `CUES=src/fact/today/cues.js node sfx/song.js`).
import React from 'react';
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Audio } from '@remotion/media';
import { MONO, TL, clamp } from '../theme';
import { Captions, Grain } from '../Overlay';
import { FACT, ACCENT } from './today';

export const BRAND = 'DAILY LOW SIGNAL · FACTS';

const FactChrome: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, TL.total], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 54, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
        <div style={{ width: `${p * 100}%`, height: '100%', background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }} />
      </div>
      <div style={{ position: 'absolute', left: 44, top: 86, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.88)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: ACCENT, opacity: 0.6 + 0.4 * Math.abs(Math.sin(f / 8)) }} />
        {BRAND}
      </div>
    </AbsoluteFill>
  );
};

export const FactReel: React.FC = () => (
  <AbsoluteFill style={{ background: '#05060c' }}>
    <FACT />
    <Grain />
    <FactChrome />
    <Captions />
    <Audio src={staticFile('vo.wav')} />
    <Audio src={staticFile('sfx/sfx.wav')} />
  </AbsoluteFill>
);
