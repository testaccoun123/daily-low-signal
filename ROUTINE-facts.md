# Daily routine: daily.low.signal — FACT reel (one incredible fact, visualized)

You are producing and publishing today's **fact Reel** for **@daily.low.signal** (posted daily at 12:30
Stockholm time; the news reel goes out at 10:00 and follows `ROUTINE.md`). One reel = **one incredible,
true fact**, explained by **one continuous, satisfying visualization** — the viewer stays to see how the
picture resolves the paradox. Audience: young people with short attention spans. Goal: watch time,
re-watches (loop), saves and shares, while staying 100% accurate.

**Style: cosy, smooth and satisfying — never aggressive.** No screen shake, no white flashes, no slams,
booms or harsh clicks. Calm dark palette with one accent colour, slow camera, soft tuned sounds over a
warm pad. Surprise comes from the idea and the visual, not from violent motion or volume.

This routine **publishes automatically** — nobody reviews the reel first, so the quality gate in step 8
is the only check. When in doubt, don't publish: notify instead.

## 0. Setup
```bash
npm ci
cd reel && npm ci && npx remotion browser ensure && cd ..
```
Secrets come from environment variables (`IG_ACCESS_TOKEN`, `IG_USER_ID`, `IG_API_BASE`, `GITHUB_TOKEN`,
`GITHUB_REPO`). Never print them, never write them to files, never commit them.
Post folder: `posts/fact-YYYY-MM-DD` (today in **Europe/Stockholm**); if it exists use `-2`, `-3`, ...
Never overwrite or delete an existing post folder.

**Study the worked example before you write anything:** `reel/examples/facts-deck/` — the approved
prototype ("Your shuffle is brand new", 52!): `content.json` (script, math, sources), `Deck.tsx` (scene)
and `cues.js` (sound). `reel/src/fact/today/` holds the previous fact; you will replace it.

## 1. Learn from past posts and never repeat a fact
```bash
node carousel/stats.js --posts 14 --json /tmp/stats.json
ls posts/fact-*/content.json reel/examples/facts-deck/content.json
```
- Read the `title` of every earlier fact — never repeat a fact or a near-duplicate angle.
- Compare fact reels by views, shares, saves (stats lag 24–48 h); lean toward topics and hook styles
  that performed best. If stats.js fails, continue without it.

## 2. Pick ONE fact
Good facts are **mind-blowing, easy to say in one line, true, and visualizable as something that grows,
counts, scales, splits, zooms or folds back on itself**. Topics: numbers & probability, space & physics,
the human body (no health advice), nature & animals, history & time scales, technology & the internet,
money at scale. Best of all: a fact tied to something in this week's news (still evergreen-true).

Avoid: health/medical advice, politics, war/violence, anything about private individuals, contested
science stated as settled, popular myths (verify! many viral "facts" are false), anything you can't
explain correctly in ~30 s.

**Every number and claim must be confirmed by at least 2 independent reputable sources that you
actually opened** (agency/university/encyclopedia/major science outlet). **Compute every derived number
yourself in code** (python/node) and write the calculation into `content.json` under `"math"`. Phrase the
voice-over exactly as strongly as the sources allow ("almost certainly", "about", "roughly"). If you can't
verify a fact, drop it and pick another. Write everything in your own words.

## 3. Write `posts/fact-YYYY-MM-DD/content.json`
Same shape as the example (the voice tool reads `hook` + `stories`):
```json
{
  "format": "fact", "date": "NOV 21, 2026", "title": "Your shuffle is brand new",
  "hook": { "onscreen": "Has this exact shuffle ever happened before?", "voiceover": "..." },
  "stories": [
    { "theme": "violet", "beat": "build",  "voiceover": "..." },
    { "theme": "violet", "beat": "number", "voiceover": "..." },
    { "theme": "violet", "beat": "twist",  "voiceover": "..." },
    { "theme": "violet", "beat": "payoff", "voiceover": "..." }
  ],
  "math": { "...": "every derived number with its calculation" },
  "sources": ["https://...", "https://..."]
}
```
- Structure: **hook** (a question or impossible-sounding claim) → **build** (set up the rule step by
  step) → **number** (the big reveal) → **twist** (the comparison that makes it unbelievable) →
  **payoff** (resolution + why it matters to *you*). 1–2 short sentences per line.
- `theme`: one of `pink`, `teal`, `violet`, `amber` for all four beats (it colours the captions); pick
  what suits the subject and vary it from yesterday.
- Total length **22–35 s**. Numbers written as spoken ("sixty-seven zeros").
- Never put sources, URLs or credits on screen or in the caption.
- Images are optional (`node carousel/fetch-image.js posts/fact-... --slot 1 --search "..."`, public
  domain / CC0 only, check it shows the subject); most facts work best fully drawn in code.

## 4. Voice-over and timings
```bash
cd reel && node prepare-kokoro.mjs ../posts/fact-YYYY-MM-DD && cd ..
```
Check the printed total (22–35 s); adjust the lines and re-run if needed.

## 5. Write the scene — the creative core
Replace the files in `reel/src/fact/today/`:
- one scene file (e.g. `Fact.tsx`) — a single component that runs across the whole reel (all 5 voice
  lines) as **one continuous visualization** that evolves; no hard cuts between unrelated shots.
- `index.ts` — `export { MyScene as FACT, ACCENT } from './Fact';` (`ACCENT` = the accent colour, used by
  the progress bar and brand line).
- `cues.js` — today's sounds (step 6).

Craft rules (the example does all of these — copy its techniques):
- Sync every beat to the voice: `S = TL.scenes.map(s => s.from)` and `W(scene, /^word$/i, fallback)` =
  `S[scene] + wordAt(...)` give absolute frames; land each reveal on its key word.
- The hook frame must work as the cover (question on screen + the object at rest), and the **last frame
  must return to the first frame's composition** so the reel loops seamlessly.
- Show the idea, don't just print it: things are counted, dealt, stacked, scaled, zoomed. Big readable
  numbers (Inter 900 / JetBrains Mono) for each key value; keep wording on screen short.
- Motion: `spring()` with `damping` ≥ 20 and `stiffness` ≤ 120, eased `interpolate()`, slow drift/push-in.
  **No shake, no white flashes** (soft coloured glow ≤ 0.15 instead), no strobe/glitch.
- Layout: keep the top ~150 px for the progress bar/brand, keep the caption band (y ≈ 1200–1460)
  readable, nothing important in the bottom ~400 px.
- Deterministic only: `rnd()` from `../../theme`, no `Math.random()`, no network, no timers.
- `FactReel.tsx`, `Overlay.tsx`, `theme.ts` are shared — don't edit them.

## 6. Sound — `reel/src/fact/today/cues.js`
`module.exports = (kit) => { ... }`, frames ABSOLUTE (`kit.S[i]` = start of line i). Like the example:
a warm pad bed (one `I.padNote` chord per voice line, low gain), and soft tuned hits — `I.marimba`,
`I.musicBox`, `I.bell`, `I.woodTick`, `I.paperFwip`, soft `I.pop`, low airy `whoosh`. Keep everything in
one key (the example uses D major) so it always sounds pleasant. Nothing should startle.

## 7. Build and review
```bash
node reel/build-fact.mjs posts/fact-YYYY-MM-DD --skip-voice
```
Then look at it: extract ~15 frames across the reel and view them with Read. Check every beat reads at a
glance, the key moments land on their words, no text is cut off or overlaps the captions, no
blank/black frames, nothing aggressive, and the last frame matches the first. Fix and rebuild.

Write `posts/fact-YYYY-MM-DD/caption.txt`:
```
<the hook as one punchy line> 🤯

<one sentence that adds a surprising detail>

<one question that invites comments>

#facts #mindblown <3 topical hashtags>
```
Dry-run: `node carousel/publish-reel.js posts/fact-YYYY-MM-DD --dry-run`

## 8. Quality gate (decide: publish or not)
Publish only if ALL of these are true:
- the fact is new (not in any earlier fact's `title`) and breaks nothing on the "Avoid" list
- every number and claim (voice, screen, caption) is backed by 2+ independent reputable sources you
  opened, and every derived number is computed in `"math"` and matches what is shown/said
- the wording is no stronger than the sources allow
- the reel built, is 20–40 s, your frame review passed, and the dry run succeeded

If anything fails: do NOT publish. Send a push notification (in Swedish) explaining what is wrong, and stop.

## 9. Publish
```bash
node carousel/publish-reel.js posts/fact-YYYY-MM-DD
```
Then, **only if `YT_CLIENT_ID`, `YT_CLIENT_SECRET` and `YT_REFRESH_TOKEN` are set**, also
`node carousel/publish-youtube.js posts/fact-YYYY-MM-DD` (a YouTube failure must not block anything —
just mention it). Send a push notification (in Swedish) with the permalink, the fact in one line, and
one short line on how the best recent fact reel performed. End your reply with the same summary plus the
source links. Do not git push.
