import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Audio } from '@remotion/media';
import { TransitionSeries, springTiming, linearTiming } from '@remotion/transitions';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { wipe } from '@remotion/transitions/wipe';
import { iris } from '@remotion/transitions/iris';
import { TL } from './theme';
import { Captions, Chrome, Grain } from './Overlay';
import { SCENES } from './today';

// Zoom-through: outgoing scene rushes past the camera, incoming one settles from behind.
const ZoomComp: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => (
  <AbsoluteFill style={presentationDirection === 'exiting'
    ? { scale: String(1 + p * 3), opacity: 1 - p, filter: `blur(${p * 24}px)` }
    : { scale: String(0.7 + 0.3 * p), opacity: Math.min(1, p * 1.6) }}>{children}</AbsoluteFill>
);
const zoomThrough = (): TransitionPresentation<Record<string, never>> => ({ component: ZoomComp, props: {} });

// Whip pan: both scenes slide sideways with a horizontal smear.
const WhipComp: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const blur = Math.sin(p * Math.PI) * 40;
  const x = presentationDirection === 'exiting' ? -p * 1080 : (1 - p) * 1080;
  return <AbsoluteFill style={{ translate: `${x}px 0`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
};
const whip = (): TransitionPresentation<Record<string, never>> => ({ component: WhipComp, props: {} });

const TRANSITIONS = [
  { p: zoomThrough(), t: linearTiming({ durationInFrames: 12 }) },
  { p: whip(), t: springTiming({ config: { damping: 200 }, durationInFrames: 12 }) },
  { p: iris({ width: 1080, height: 1920 }), t: springTiming({ config: { damping: 200 }, durationInFrames: 14 }) },
  { p: wipe({ direction: 'from-top' }), t: linearTiming({ durationInFrames: 10 }) },
];

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: '#07070d' }}>
    <TransitionSeries>
      {SCENES.map((Scene, i) => {
        const sc = TL.scenes[i];
        const tr = TRANSITIONS[i];
        // Lengthen each scene by its outgoing transition so the next scene still starts exactly on its voice line.
        const extra = tr ? tr.t.getDurationInFrames({ fps: 30 }) : 0;
        return (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={sc.dur + extra}>
              <Scene dur={sc.dur} />
            </TransitionSeries.Sequence>
            {tr && <TransitionSeries.Transition presentation={tr.p as TransitionPresentation<Record<string, unknown>>} timing={tr.t} />}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
    <Grain />
    <Chrome />
    <Captions />
    <Audio src={staticFile('vo.wav')} />
    {/* Sound effects: synthesized in code by sfx/song.js from today's cues (src/today/cues.js), every cue
        pinned to frames computed from the same word timings and springs the scenes use.
        Regenerate with `node sfx/song.js` after changing timeline.json, the scenes or the cues. */}
    <Audio src={staticFile('sfx/sfx.wav')} />
  </AbsoluteFill>
);
