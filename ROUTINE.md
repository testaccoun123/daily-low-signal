# Daily routine: daily.low.signal

You are producing today's Instagram carousel for **@daily.low.signal**, an anonymous
English-language news account: *"The news, minus the noise."* Audience: young people with
short attention spans. Goal: maximum views, saves and shares, while staying 100% accurate.

This routine **publishes automatically** — nobody reviews the post before it goes live, so the
quality gate in step 6 is the only check. When in doubt, don't publish: notify instead.

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
If that folder already exists (e.g. an extra post on the same day), use the next free suffix:
`posts/YYYY-MM-DD-2`, `posts/YYYY-MM-DD-3`, ... Never overwrite or delete an existing post folder.
`posts/2026-11-10` is the reference example of a finished post.

## 0b. Learn from past posts
```bash
node carousel/stats.js --posts 14 --json /tmp/stats.json
```
Read the report (and /tmp/stats.json if useful):
- **Don't repeat**: the captions list every story already posted — never cover the same story again
  unless there is a genuinely new development (then say what's new).
- **Do more of what works**: compare posts by shares, saves, reach and the "BEST" line. Note which
  categories (gaming, AI, space, apps...) and which hook styles (question, number, "while you were
  scrolling", bold claim) performed best, and lean today's story mix and hook toward them — while
  still keeping 4 different topics. Stats can lag 24–48 h; with fewer than ~5 posts or all zeros,
  ignore performance and just avoid repeats.
- If stats.js fails (e.g. missing insights permission), continue without it.

## 1. Pick 4 stories (last ~24 h)
Use web search. Prefer stories that make a young person stop scrolling:
tech & AI, gaming, internet/platform changes (apps they use), science & space, money that
affects them (prices, jobs, rent), big culture moments, genuinely huge world events.

Avoid: partisan politics (Instagram limits its reach), war/graphic violence, crime involving
private individuals, unproven allegations about real people, rumors, deaths unless confirmed
by major outlets, anything older than ~3 days.

Be persistent — finding 4 good stories normally takes 10–20 searches. Search each category
separately (e.g. "AI news today", "PlayStation Xbox Nintendo news", "Apple Google Meta announcement",
"NASA SpaceX news", "TikTok Instagram YouTube update", "Reuters business news today"), use
`mode: "extended"` for fresh results, and use WebFetch to open articles and confirm their date and
details. Stories from the last 48 hours are fine if still fresh. Only give up if after ~20 searches
you truly cannot find 4 verifiable stories — then stop and explain, never invent anything.

**Every fact must be confirmed by at least 2 independent reputable sources that you actually
opened with WebFetch** (search-result snippets alone do not count) (primary source
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
- Every story has a `"topic"` from this fixed list (used for the topic statistics):
  `gaming`, `ai-tech`, `apps-social`, `space`, `science`, `money`, `culture`, `world`.
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

## 6. Quality gate (decide: publish or not)
Publish only if ALL of these are true:
- 4 stories, each confirmed by 2+ independent reputable sources you opened (step 1)
- every number, date and name on the slides and in the caption matches those sources
- no story breaks the "Avoid" list in step 1
- all 5 slides passed your visual check, and the dry run succeeded

If anything fails: do NOT publish. Send a push notification (in Swedish) explaining what is
wrong and stop. A skipped day is far better than a wrong post.

## 7. Publish
```bash
node carousel/publish.js posts/YYYY-MM-DD --base-url <BASE_URL>
```
Then send a push notification (in Swedish) with: the permalink it printed and the 4 stories in
one line each, plus one short line on how the best recent post performed (from step 0b) if stats were available. End your reply with the same summary plus the source links.

If the user later writes in this session asking for a fix: you cannot edit a published
carousel via the API — explain that, and offer to make a corrected post if they want.
