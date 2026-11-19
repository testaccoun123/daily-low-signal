# Clip routine: xQc GTA 6 clips → Reels (@daily.low.signal)

You publish ONE short Reel made from today's best **xQc** Twitch clip of **Grand Theft Auto VI**.
The account owner has **written permission from xQc** to repost his clips on Instagram (incl. monetization).
Only xQc, only GTA 6 clips. Never use clips from any other streamer.
This routine **publishes automatically**; the checks in step 5 are the only gate.

## 0. Setup
```bash
npm ci
cd reel && npm ci && npx remotion browser ensure && cd ..
pip install -q -U yt-dlp 2>/dev/null || (curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp && chmod +x /tmp/yt-dlp && echo "export YTDLP=/tmp/yt-dlp")
```
(if the curl fallback was used: `export YTDLP=/tmp/yt-dlp`). Secrets are env vars (`IG_ACCESS_TOKEN`,
`IG_USER_ID`, `IG_API_BASE`, `GITHUB_TOKEN`, `GITHUB_REPO`) — never print or write them.

## 1. Candidates
```bash
cd reel && node clip.mjs list --channel xqc --game "Grand Theft Auto VI" --n 20 && cd ..
```
Prints today's GTA 6 clips by views as JSON lines, with **every clip already posted removed**
(it checks the `posts/clip-*-<slug>` folders in the GitHub repo — that is the duplicate guard).

## 2. Pick one
Take the most-viewed candidate unless it is: shorter than ~10 s, just menus/loading/nothing happening,
or the same moment as a clip already posted today (compare titles with today's `posts/clip-<today>-*`
folders in the repo, e.g. "part 2" of the same thing). If nothing good is left, **stop without publishing**
(no notification needed) — never post a weak or duplicate clip.

## 3. Build
Write a hook (max ~7 words, ALL the punch up front, can end with ":" or "?") and a short label (2–4 words)
based on the clip title and what happens. No streamer credit text and no sources on screen.
```bash
cd reel && node clip.mjs build "<clip url>" --hook "xQc after 24 HOURS of GTA 6:" --label "xQc's GTA 6 verdict" && cd ..
```
It downloads Twitch's vertical version, trims to ≤ 30 s at a natural pause, renders
`posts/clip-YYYY-MM-DD-<slug>/reel.mp4` + `cover.jpg` + `content.json`.

## 4. Review + caption
Extract a few frames (e.g. at 0.5 s, 2 s, 10 s, end) with ffmpeg and look at them with Read: hook readable,
nothing broken. Write `posts/clip-YYYY-MM-DD-<slug>/caption.txt`:
```
<one line about what happens in the clip> <1 emoji>

<one short question to the viewer>

#xqc #gta6 #gtavi #gaming #twitch
```
Do not mention permission, licensing or credit in the caption. Then:
```bash
node carousel/publish-reel.js posts/clip-YYYY-MM-DD-<slug> --dry-run
```

## 5. Gate → publish
Publish only if: it is an xQc clip, category GTA 6, not already posted (step 1 list), build + review OK,
dry run OK. Then:
```bash
node carousel/publish-reel.js posts/clip-YYYY-MM-DD-<slug>
```
(uploads, publishes, archives the folder record to the repo so it is never posted again).
Send a push notification in Swedish: "Nytt xQc-klipp publicerat: <permalink> — <clip title>".
If something failed, do not publish; send a short Swedish push notification saying why. Do not git push.
