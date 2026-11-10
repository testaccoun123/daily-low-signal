# Daily routine: daily.low.signal

You are producing today's Instagram carousel for **@daily.low.signal**, an anonymous
English-language news account: *"The news, minus the noise."* Audience: young people with
short attention spans. Goal: maximum views, saves and shares, while staying 100% accurate.

**Never publish without explicit approval in this session** ("publicera", "publish", "yes, post it").
Everything up to and including the dry run is fine to do on your own.

## 0. Setup
```bash
npm ci
ls /usr/bin/google-chrome /usr/bin/chromium /usr/bin/chromium-browser 2>/dev/null \
  || npx -y @puppeteer/browsers install chrome-headless-shell@stable --path /tmp/chrome
# if installed to /tmp/chrome: export CHROME_PATH=<path to chrome-headless-shell binary it printed>
```
Secrets come from environment variables: `IG_ACCESS_TOKEN`, `IG_USER_ID`, `IG_API_BASE`,
`GITHUB_TOKEN`, `GITHUB_REPO`. Never print them, never write them to files, never commit them.
Post folder: `posts/YYYY-MM-DD` using today's date in **Europe/Stockholm**.

## 1. Pick 4 stories (last ~24 h)
Use web search. Prefer stories that make a young person stop scrolling:
tech & AI, gaming, internet/platform changes (apps they use), science & space, money that
affects them (prices, jobs, rent), big culture moments, genuinely huge world events.

Avoid: partisan politics (Instagram limits its reach), war/graphic violence, crime involving
private individuals, unproven allegations about real people, rumors, deaths unless confirmed
by major outlets, anything older than ~3 days.

**Every fact must be confirmed by at least 2 independent reputable sources** (primary source
preferred: company/agency announcement, then Reuters/AP/BBC/CNBC/The Verge etc.). If you can't
confirm a story, drop it. Write everything in your own words — never copy article text,
never use press photos or logos.

## 2. Write `posts/YYYY-MM-DD/content.json`
Use `posts/2026-11-10/content.json` as the reference example. Structure:
```json
{
  "date": "NOV 11, 2026",
  "hook": {
    "layout": "mosaic",
    "title": "Curiosity hook, ≤ 9 words, with one <span class=\"grad\">word</span>",
    "tiles": [ { "theme": "pink", "mini": "countdown", "svg": "<optional custom svg>", "label": "≤ 6 words, 1–2 in <em>" } ]
  },
  "stories": [
    { "theme": "pink", "layout": "card", "tag": "GAMING",
      "visual": "countdown", "visualValue": "9", "svg": "<optional custom svg>",
      "headline": "≤ 9 words, 1–3 words in <em>", "body": "40–50 words with 4–6 <mark>key phrases</mark>",
      "source": "Outlet A, Outlet B" }
  ]
}
```
Rules:
- Exactly 4 stories → 5 slides. No call-to-action slide.
- Themes: use `pink`, `teal`, `violet`, `amber` once each (same color for a story's tile and its slide).
- Layouts: use `card`, `bottom`, `top`, `bleed` once each so slides look different.
- Hook title: vary it daily (e.g. "4 things that happened while you were <span class=\"grad\">scrolling.</span>").
  Tile labels are teasers: give half the story so people swipe.
- Body: say what happened, the key number/date, and why it matters to the reader. `<mark>` the
  words a skimmer needs. Numbers must match the sources exactly.

### Visuals
Built-ins: story `visual` = `countdown` (uses `visualValue`), `toggle`, `truss`, `hubble`, `reentry`;
tile `mini` = `countdown`, `toggle`, `truss`, `reentry`.
If none fits (usually), write your own simple, bold, flat illustration as an inline `svg` string:
- Story `svg`: `viewBox="0 0 912 560"` (for `bleed` layout use `viewBox="0 0 1080 760" preserveAspectRatio="xMidYMid slice"`).
- Tile `svg`: `viewBox="0 0 400 170"`.
- Colors only via placeholders `{{a}}` (accent), `{{b}}` (light accent), `{{bg}}`, `{{panel}}`, `{{deep}}`, plus white.
- In tile SVGs do NOT use `id`/`url(#...)` (tiles share one page); use `style="filter: drop-shadow(0 0 10px {{a}})"` for glow.
- No logos, no real people's faces, no copyrighted characters. Icons/shapes/symbols only.

## 3. Write `posts/YYYY-MM-DD/caption.txt`
```
<one punchy line summarising the 3 biggest stories> 👇

01 — ...
02 — ...
03 — ...
04 — ...

<one question that invites comments>

Sources: <outlets>

#news #dailynews <3 topical hashtags>
```

## 4. Render and check
```bash
node carousel/render.js posts/YYYY-MM-DD
```
Open every `slide-N.jpg` with the Read tool and check: no text overflowing or cut off, nothing
overlapping, illustration readable, highlights look right. Fix content.json / svg and re-render
until all 5 are clean.

## 5. Upload and dry run
```bash
node carousel/upload.js posts/YYYY-MM-DD        # prints BASE_URL
node carousel/publish.js posts/YYYY-MM-DD --base-url <BASE_URL> --dry-run
```

## 6. Ask for approval, then stop
Reply with (short, in Swedish):
- the 4 stories, one line each, with the source links you verified them with
- links to all 5 slide images (`<BASE_URL>/slide-1.jpg` ... `slide-5.jpg`) so they can be viewed on a phone
- the full caption
- "Svara **publicera** för att lägga ut, eller säg vad som ska ändras."

Then wait. If asked for changes: edit, re-render, re-upload, re-dry-run, and ask again.

## 7. Publish (only after approval)
```bash
node carousel/publish.js posts/YYYY-MM-DD --base-url <BASE_URL>
```
Reply with the permalink it prints.
