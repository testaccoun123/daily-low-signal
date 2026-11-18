// Finds a freely licensed photo on Wikimedia Commons, downloads it into a post folder and
// attaches it (with a credit line) to one story and its hook tile in content.json.
//
// Usage:
//   node carousel/fetch-image.js <post-dir> --slot <1-4> --search "Jensen Huang"
//   node carousel/fetch-image.js <post-dir> --slot <1-4> --file "File:Example.jpg"
//
// Only licenses that allow reuse on a commercial social account are accepted:
// public domain, CC0, CC BY and CC BY-SA. Everything else (NC, ND, fair use, GFDL-only, unknown) is skipped.

const fs = require('fs');
const path = require('path');

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'daily-low-signal-carousel/1.0 (automated news carousel renderer)';
const ALLOWED = /^(public domain|pd\b|pd-|cc0|cc by(-sa)? \d(\.\d)?)/i;
const BLOCKED = /(nc|nd|fair use|non-free)/i;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const dir = args[0];
const slot = parseInt(opt('--slot'), 10);
const search = opt('--search');
const fileTitle = opt('--file');
if (!dir || !(slot >= 1 && slot <= 4) || !(search || fileTitle)) {
  console.error('Usage: node carousel/fetch-image.js <post-dir> --slot <1-4> (--search "<query>" | --file "File:Name.jpg")');
  process.exit(1);
}

const strip = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function query(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ format: 'json', ...params })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

function pick(pages) {
  const candidates = Object.values(pages || {}).map((p) => {
    const ii = (p.imageinfo || [])[0];
    if (!ii) return null;
    const meta = ii.extmetadata || {};
    const license = strip(meta.LicenseShortName && meta.LicenseShortName.value);
    return {
      title: p.title, index: p.index ?? 0, license, mime: ii.mime, width: ii.width, height: ii.height,
      thumb: ii.thumburl || ii.url, page: ii.descriptionurl,
      artist: strip(meta.Artist && meta.Artist.value) || 'Unknown',
    };
  }).filter(Boolean);
  return candidates
    .filter((c) => /image\/(jpeg|png)/.test(c.mime) && c.width >= 600 && c.height >= 500)
    .filter((c) => ALLOWED.test(c.license) && !BLOCKED.test(c.license))
    .sort((a, b) => a.index - b.index);
}

(async () => {
  const common = { prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '1600' };
  const data = fileTitle
    ? await query({ action: 'query', titles: fileTitle, ...common })
    : await query({ action: 'query', generator: 'search', gsrsearch: `${search} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '15', ...common });
  const choices = pick(data.query && data.query.pages);
  if (!choices.length) {
    console.error('NO_LICENSED_IMAGE: nothing with an allowed license found. Use an illustration instead.');
    process.exit(2);
  }
  console.log('candidates:');
  choices.slice(0, 5).forEach((c, i) => console.log(`  ${i + 1}. ${c.title}  [${c.license}]  ${c.width}x${c.height}  by ${c.artist}`));

  const best = choices[0];
  const res = await fetch(best.thumb, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const ext = best.mime === 'image/png' ? 'png' : 'jpg';
  const fileName = `photo-${slot}.${ext}`;
  fs.writeFileSync(path.join(dir, fileName), Buffer.from(await res.arrayBuffer()));

  const artist = best.artist.replace(/^(photographer|photo|author)\s*:\s*/i, '').slice(0, 60);
  const credit = `Photo: ${artist} / ${best.license} / Wikimedia Commons`;
  const photo = { file: fileName, credit, source: best.page, license: best.license, portrait: best.height > best.width * 1.05 };

  const contentFile = path.join(dir, 'content.json');
  if (fs.existsSync(contentFile)) {
    const content = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
    if (content.stories && content.stories[slot - 1]) content.stories[slot - 1].photo = photo;
    if (content.hook && content.hook.tiles && content.hook.tiles[slot - 1]) content.hook.tiles[slot - 1].photo = photo;
    fs.writeFileSync(contentFile, JSON.stringify(content, null, 2));
  }
  console.log(`USING ${best.title}\n  ${credit}\n  ${best.page}\n  saved ${fileName} and attached to story/tile ${slot}`);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
