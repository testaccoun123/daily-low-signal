# Clip routine: streamer game clips → Reels (@daily.low.signal)

You publish ONE short Reel made from today's best Twitch clip of **the streamer named in your prompt**.
Only these streamers are allowed — the account owner has **written permission** from each to repost
their clips on all platforms (Instagram and YouTube, incl. monetization):

| Streamer | Twitch channel | Default game | Streamer hashtag |
|---|---|---|---|
| xQc | `xqc` | Grand Theft Auto VI | `#xqc` |
| ohnePixel | `ohnepixel` | Counter-Strike | `#ohnepixel` |

Below, `<channel>`, `<default game>`, `<Streamer>` and `<#tag>` mean that streamer's row. If your prompt
names no streamer, or one not in this table, stop without publishing. Never use clips from any other
streamer, and never mix streamers in one run.
If several of the streamer's most-viewed clips today are from **another game**, the routine pivots to that
game (decided automatically by `clip.mjs list`, step 1). Never non-game categories (Just Chatting, IRL...).
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
cd reel && node clip.mjs list --channel <channel> --game auto --default "<default game>" --n 20 && cd ..
```
The first line is the **game decision**: `{"decision": {"game", "pivot", "reason"}}`. The default game stays
unless another game has ≥ 2 of the top-5 clips AND more views in the top 10 than it (or it has no clips today).
Then it prints that game's clips by views as JSON lines, with **every clip already posted removed**
(it checks the `posts/clip-*-<slug>` folders in the GitHub repo — that is the duplicate guard).
Use the decided game for the rest of the run; mention a pivot in the push notification.

## 2. Pick one
Take the most-viewed candidate unless it is: shorter than ~10 s, just menus/loading/nothing happening,
sexual, a slur or hateful (judge by the title and what you see/hear — skip it if in doubt), or the same moment as a clip already posted today (compare titles with today's `posts/clip-<today>-*`
folders in the repo, e.g. "part 2" of the same thing). If nothing good is left, **stop without publishing**
(no notification needed) — never post a weak or duplicate clip.

## 3. Build
Write a hook (max ~7 words, ALL the punch up front, can end with ":" or "?") and a short label (2–4 words)
based on the clip title and what happens. No streamer credit text and no sources on screen.
```bash
cd reel && node clip.mjs build "<clip url>" --hook "<Streamer> after 24 HOURS of GTA 6:" --label "<Streamer>'s GTA 6 verdict" && cd ..
```
It downloads Twitch's vertical version, trims to ≤ 30 s at a natural pause, renders
`posts/clip-YYYY-MM-DD-<slug>/reel.mp4` + `cover.jpg` + `content.json`.

## 4. Review + caption
Extract a few frames (e.g. at 0.5 s, 2 s, 10 s, end) with ffmpeg and look at them with Read: hook readable,
nothing broken. Write `posts/clip-YYYY-MM-DD-<slug>/caption.txt`:
```
<one line about what happens in the clip> <1 emoji>

<one short question to the viewer>

<#tag> <2 hashtags for the game, e.g. #gta6 #gtavi or #cs2 #counterstrike> #gaming #twitch
```
The hook and label name the streamer and the actual game (e.g. "xQc vs ELDEN RING's hardest boss").
Do not mention permission, licensing or credit in the caption. Then:
```bash
node carousel/publish-reel.js posts/clip-YYYY-MM-DD-<slug> --dry-run
```

## 5. Gate → publish
Publish only if: it is a clip from the streamer named in your prompt (check `channel` in content.json, ignoring case), its category is the game decided in step 1 (a real game, not Just Chatting/IRL),
not already posted (step 1 list), build + review OK,
dry run OK. Then:
```bash
node carousel/publish-reel.js posts/clip-YYYY-MM-DD-<slug>
```
(uploads, publishes, archives the folder record to the repo so it is never posted again, then uploads it
as a YouTube Short by itself — the streamer's permission covers all platforms — and archives `youtube.json`).
Do not run `publish-youtube.js` separately. The last output line is `YOUTUBE OK <link>`, `YOUTUBE FAILED: <reason>`
or `YOUTUBE SKIPPED: <reason>`; a YouTube failure does not undo the Instagram post.
Send a push notification in Swedish: "Nytt <Streamer>-klipp publicerat: <permalink> — <clip title>", plus the YouTube
link, or one line on why YouTube failed/was skipped.
If something failed, do not publish; send a short Swedish push notification saying why. Do not git push.
