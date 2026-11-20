import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import timeline from './timeline.json';

// Fonts are bundled in public/fonts (SIL Open Font License) so rendering never needs the network.
export const INTER = 'Inter';
export const MONO = 'JetBrains Mono';
for (const w of ['500', '700', '800', '900']) loadFont({ family: INTER, url: staticFile(`fonts/inter-latin-${w}-normal.woff2`), weight: w });
for (const w of ['500', '700', '800']) loadFont({ family: MONO, url: staticFile(`fonts/jetbrains-mono-latin-${w}-normal.woff2`), weight: w });

export type Theme = { a: string; b: string; bg: string; deep: string; panel: string };
export const THEMES: Record<string, Theme> = {
  hook: { a: '#ffffff', b: '#dcd2ff', bg: '#07070d', deep: '#2a2a40', panel: '#12121e' },
  pink: { a: '#ff4fa3', b: '#ffb8dc', bg: '#10040c', deep: '#7a1d5a', panel: '#1e0a18' },
  teal: { a: '#2ee6b8', b: '#a8ffe8', bg: '#03100d', deep: '#0f5c4c', panel: '#08201b' },
  violet: { a: '#a78bff', b: '#dcd2ff', bg: '#07051a', deep: '#3b2a8a', panel: '#130f30' },
  amber: { a: '#ff8a3d', b: '#ffd2ad', bg: '#110703', deep: '#7a2e0c', panel: '#221008' },
};
// Per-scene colour themes, written into timeline.json by prepare-kokoro.mjs from content.json.
export const SCENE_THEMES: string[] = (timeline as { themes?: string[] }).themes ?? ['hook', 'pink', 'teal', 'violet', 'amber'];
export const HOOK_GRAD = 'linear-gradient(90deg,#ff4fa3,#ff8a3d 35%,#2ee6b8 65%,#a78bff)';

export type Word = { w: string; s: number; e: number };
export type SceneT = { text: string; from: number; dur: number; words: Word[] };
export const TL = timeline as { fps: number; total: number; scenes: SceneT[] };

/** Frame (relative to scene start) at which the first word matching `re` is spoken. */
export const wordAt = (scene: number, re: RegExp, fallback = 0): number => {
  const sc = TL.scenes[scene];
  const w = sc.words.find((x) => re.test(x.w.replace(/[^\w]/g, '')));
  return w ? w.s - sc.from : fallback;
};

/** Deterministic hash noise in [0,1). */
export const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Screen shake is switched OFF by design (cosy style, owner's decision 2026-11-20): always returns [0, 0].
 *  Kept so older scenes still compile. Use a slow push-in, a soft glow or a gentle scale instead. */
export const shake = (_f: number, _at: number, _amp: number, _tau = 3): [number, number] => [0, 0];

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
