# Daily routine: daily.low.signal (Reels)

You are producing and publishing today's **Instagram Reel** for **@daily.low.signal**, an anonymous
English-language news account: *"The news, minus the noise."* Audience: young people with short
attention spans. Goal: maximum views, watch time, saves and shares, while staying 100% accurate.

The reel is a ~20–25 s vertical video built with **Remotion** (React) in `reel/`: a hook scene, then
4 news stories, each with its **own custom animation tied to that news**, a British AI voice-over
(Kokoro, voice `bm_george`), word-by-word captions and synthesized sound effects.

**Style (owner's decision, 2026-11-20): cosy, smooth and satisfying — never aggressive.** No screen
shake at all, no white flashes, no slams/booms/harsh clicks. Motion glides and settles; sounds are soft,
tuned and pleasant. Surprise comes from *what* happens, not from violence of motion or volume.

This routine **publishes automatically** — nobody reviews the reel before it goes live, so the
quality gate in step 8 is the only check. When in doubt, don't publish: notify instead.

(The old carousel routine is in `ROUTINE-carousel.md`; do not use it unless told to.)

## 0. Setup
```bash
npm ci
cd reel && npm ci && npx remotion browser ensure && cd ..
```
Secrets come from environment variables: `IG_ACCESS_TOKEN`, `IG_USER_ID`, `IG_API_BASE`,
`GITHUB_TOKEN`, `GITHUB_REPO`. Never print them, never write them to files, never commit them.
Post folder: `posts/YYYY-MM-DD` using today's date in **Europe/Stockholm**. If it already exists, use
`posts/YYYY-MM-DD-2`, `-3`, ... Never overwrite or delete an existing post folder.

**Study the worked example before you write anything:** `reel/examples/2026-11-20-cosy/` (scenes + cues)
is the approved reel in the current cosy style (Anthropic IPO / Steam Machine / Instagram edit / Google
Suncatcher). Its content is in `posts/2026-11-20/content.json`. The older `reel/examples/2026-11-18/` shows
useful techniques (word sync, camera, images) but its aggressive look and sounds are **retired** — don't copy
its shakes, flashes or slams. `reel/src/today/` contains the previous day's files; you will replace them.

## 1. Learn from past posts
```bash
node carousel/stats.js --posts 14 --json /tmp/stats.json
```
- **Don't repeat**: the captions list every story already posted — never cover the same story again
  unless there is a genuinely new development (then say what's new).
- **Do more of what works**: compare posts by views, shares, saves and the "BEST" line; lean today's
  story mix and hook toward the categories and hook styles that performed best (still 4 different topics).
  Stats lag 24–48 h; with fewer than ~5 posts or all zeros, just avoid repeats.
- If stats.js fails, continue without it.

## 2. Pick 4 stories (last ~24–48 h)
Use web search. Prefer stories that make a young person stop scrolling: tech & AI, gaming,
internet/platform changes (apps they use), science & space, money that affects them (prices, jobs,
rent), big culture moments, genuinely huge world events. **Also prefer stories that suggest a
striking visual** (something falls, launches, breaks, switches off, races, explodes, counts down).

Avoid: partisan politics (Instagram limits its reach), war/graphic violence, crime involving private
individuals, unproven allegations about real people, rumors, deaths unless confirmed by major outlets,
anything older than ~3 days.

Be persistent — finding 4 good stories normally takes 10–20 searches. Search each category separately,
use `mode: "extended"` for fresh results, and open articles with WebFetch to confirm date and details.
Only give up if after ~20 searches you truly cannot find 4 verifiable stories — then stop and notify.

**Every fact must be confirmed by at least 2 independent reputable sources that you actually opened
with WebFetch** (primary source preferred: company/agency announcement, then Reuters/AP/BBC/CNBC/The
Verge etc.). If you can't confirm a story, drop it. Write everything in your own words.

## 3. Write `posts/YYYY-MM-DD/content.json`
```json
{
  "date": "NOV 19, 2026",
  "hook": { "voiceover": "Here are four things you missed today." },
  "stories": [
    { "theme": "pink", "topic": "gaming", "tag": "GAMING",
      "headline": "GTA 6 is 9 days away",
      "voiceover": "GTA 6 is just nine days away. Rockstar says November nineteenth is still locked in.",
      "concept": "counter slams 99→9, logo spins in, calendar flips to NOV 19, padlock snaps shut",
      "source": "Outlet A, Outlet B (our records only — never shown in the reel or caption)" }
  ]
}
```
Rules:
- Exactly 4 stories. Themes `pink`, `teal`, `violet`, `amber` — once each, in story order.
- `topic` from: `gaming`, `ai-tech`, `apps-social`, `space`, `science`, `money`, `culture`, `world`.
- **Voice lines**: hook = one short line (vary it daily). Each story = 1–2 short spoken sentences,
  ~14–20 words, punchy, the key fact + why it matters. Write numbers the way they are said where it
  matters for speech ("November nineteenth"). Total reel must land at **20–25 s**.
- Never put news sources, URLs or photo credits on screen or in the caption.

### Images (optional but great)
Real images of the subject only via `carousel/fetch-image.js` (Wikimedia Commons, **public domain /
CC0 only**, so no credit is needed):
```bash
node carousel/fetch-image.js posts/YYYY-MM-DD --slot <1-4> --search "Nvidia logo"
node carousel/fetch-image.js posts/YYYY-MM-DD --slot <1-4> --file "File:Exact name.svg"
```
It saves `photo-<slot>.png|jpg` in the post folder. **Check it really shows the subject** (search
results can be wrong — read the candidate titles, use `--file` for the right one, look at it).
Most tech CEOs have no public-domain photo → use the company logo/product instead. You may make
derived assets such as cut-outs and save them as `asset-<name>.png` in the post folder (e.g. remove a
black background with ffmpeg `colorkey`). Never: images from news sites/Google/Getty/Reuters/AP/social
media, edited or caricatured faces of real people, AI-generated images of real people, or a person's
photo next to an unproven allegation.

## 4. Voice-over and timings
```bash
cd reel && node prepare-kokoro.mjs ../posts/YYYY-MM-DD && cd ..
```
Writes `reel/public/vo.wav`, copies the images into `reel/public/`, and writes
`reel/src/timeline.json` (scene start frames + every word's frame). Check the printed total: if it is
outside 20–25 s, shorten/lengthen the voice lines in content.json and run it again.

## 5. Write today's scenes — the creative core
Replace the files in `reel/src/today/`:
- `Hook.tsx` — the 2×2 tile mosaic teasing today's 4 stories (adapt the example: each tile gets a tiny
  live animation + a half-told teaser label; title words spring in).
- One `.tsx` per story (any names), each `export const X: React.FC<{ dur: number }>`.
- `index.ts` — `export const SCENES: React.FC<{ dur: number }>[] = [Hook, Story1, Story2, Story3, Story4];`
- `cues.js` — today's sound effects (see step 6).

**What each story animation must be:** a short, **surprising and satisfying** visual tied to *that*
news, so the viewer wants to keep watching to see what happens — e.g. a chart line glides up and breaks
through the top of the frame; a shutter rolls down over a waitlist; a pencil fixes a typo and the letters
float back into place; a ring is built by a robot arm piece by piece; a rocket lifts off and unfolds its
solar wings. Think "oddly satisfying", not "explosion". Dramatise freely, but **never show
something as fact that didn't happen** — the voice line must carry any hedge ("could", "if").

Craft rules (the example does all of these — copy its techniques):
- Sync every beat to the voice: `wordAt(sceneIndex, /^word$/i, fallback)` from `../theme` gives the
  frame (relative to the scene) when a word is spoken. Land the big moment on the key word.
- Use Remotion `spring()` and `interpolate()` with easing — no linear, mechanical motion. Springs must
  settle without hard bounce: `damping` ≥ 20, `stiffness` ≤ 120. Scale-ins start at ≤ 1.2×, never 3–5×.
- Something new on screen every ~1.5–2 s inside each story (cut, slow camera move, new element).
- Camera: slow push-ins, gentle drift, soft glows and calm particles. **No screen shake** (`shake()` now
  always returns [0, 0] — don't fake it with manual jitter/rumble), **no white flashes** (use a soft
  coloured glow ≤ 0.15 opacity over ~1 s instead), no strobing or glitch effects.
- Big bold on-screen text for the key number/fact (Inter 900 / JetBrains Mono), in the scene's theme
  color: `THEMES.pink|teal|violet|amber` (`a` accent, `b` light, `bg`, `panel`, `deep`).
- Layout: keep the top ~150 px for the progress bar/brand, keep the caption band (y ≈ 1200–1460)
  readable, and nothing important in the bottom ~400 px (Instagram UI).
- Images: `<Img src={staticFile('photo-1.png')} />` etc. (only files that exist in `reel/public/`).
- Deterministic only: no `Math.random()` (use `rnd()` from `../theme`), no network, no timers.
- `Reel.tsx`, `Overlay.tsx` (captions, progress bar), `theme.ts` and transitions are fixed — don't edit.

## 6. Sound effects — `reel/src/today/cues.js`
The kit runs in **cosy mode by default** (`reel/sfx/cosy.js`): a warm pad bed under the whole reel, and
slam/boom/click/glass/clank are automatically swapped for soft tuned sounds. Still choose gentle sounds
yourself: marimba, music box (`kit.I.musicBox`), bells, wood ticks, paper, soft pops, low airy whooshes.
Export `module.exports = (kit) => { ... }` that places today's sounds. Compute every cue frame with
the same formulas your scenes use (`kit.wordAt`, `kit.land` for spring landings, `kit.interpolate`);
frames are ABSOLUTE (`kit.S[i]` = start frame of scene i). Use the ready-made sounds in
`reel/sfx/kit.js` — `whoosh`, `click`, `metalClank`, `sparks`, `spinWhoosh`, `powerDown`,
`glitchSlice`, `slam`, `boom`, `roar` and the raw instruments `kit.I.*` (thud, pop, bell, glass,
crash, paperFwip, launchWhistle...) — with `kit.put(kit.hits|kit.beds, buffer, frame, gain, pan, reverb)`.
Every transition gets a soft whoosh, every landing a gentle tuned note, every count a soft tick. Follow
the cosy example's levels; nothing should startle.

## 7. Build and review
```bash
node reel/build.mjs posts/YYYY-MM-DD --skip-voice
```
(type-checks the scenes, renders the sound effects, renders `reel.mp4` and `cover.jpg` into the post
folder). Fix any error and rebuild. Then **look at it**: extract frames and view them with Read, e.g.
```bash
F=$(node -e "process.stdout.write(require('./reel/node_modules/ffmpeg-static'))")
for s in 1 3 5 7 9 11 13 15 17 19 21 23; do $F -v error -y -ss $s -i posts/YYYY-MM-DD/reel.mp4 -frames:v 1 -vf scale=360:-1 /tmp/f$s.jpg; done
```
Check: every scene's animation is visible and reads at a glance, the key moment lands, no text is cut
off or overlapping the captions, images are the right subject, no blank/black frames, and nothing looks
aggressive (no shake, flash, strobe). Fix and rebuild.

Write `posts/YYYY-MM-DD/caption.txt`:
```
<one punchy line teasing the 3 biggest stories> 👇

<one question that invites comments>

#news #dailynews <3 topical hashtags>
```
Then dry-run: `node carousel/publish-reel.js posts/YYYY-MM-DD --dry-run`

## 8. Quality gate (decide: publish or not)
Publish only if ALL of these are true:
- 4 stories, each confirmed by 2+ independent reputable sources you opened (step 2)
- every number, date and name in the voice-over, on screen and in the caption matches those sources
- no story breaks the "Avoid" list, no animation presents an invented event as fact
- the reel built, is 18–30 s, your frame review passed, and the dry run succeeded

If anything fails: do NOT publish. Send a push notification (in Swedish) explaining what is wrong and stop.

## 9. Publish
```bash
node carousel/publish-reel.js posts/YYYY-MM-DD
```
(uploads the video directly to Instagram, waits for processing, publishes, archives content.json,
caption and cover to the repo). Then, **only if the env vars `YT_CLIENT_ID`, `YT_CLIENT_SECRET` and
`YT_REFRESH_TOKEN` are set**, also post it as a YouTube Short:
```bash
node carousel/publish-youtube.js posts/YYYY-MM-DD
```
A YouTube failure must not undo or block the Instagram post — just mention it in the notification.
Then send a push notification (in Swedish) with the permalink (and the YouTube link if uploaded), the 4
stories in one line each, and one short line on how the best recent post performed (from step 1).
End your reply with the same summary plus the source links. Do not git push.

If the user later asks for a fix: a published reel can't be edited via the API — explain that and
offer to make a corrected post.
