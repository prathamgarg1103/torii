#!/usr/bin/env node
/*
 * Pulls the most popular Japanese manga from AniList's public GraphQL API into data/anilist.json.
 * Run it once on a machine with internet access:   npm run import
 * It then reseeds the catalogue. Commit data/anilist.json and data/catalog.json so deploys
 * don't need network access at build time.
 *
 * AniList API: https://docs.anilist.co (free, no key; rate-limited, so requests are spaced out).
 * Cover and banner images stay on AniList's CDN and load in the viewer's browser.
 */
import fs from "node:fs";
import path from "node:path";

const TARGET = Number(process.argv[2]) || 400;
const PER_PAGE = 50;
const OUT = path.join(process.cwd(), "data", "anilist.json");
const QUERY = `query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(type: MANGA, format: MANGA, countryOfOrigin: "JP", isAdult: false, sort: POPULARITY_DESC) {
      id
      title { romaji english native }
      description(asHtml: false)
      chapters volumes status
      startDate { year }
      genres
      tags { name rank isAdult }
      coverImage { extraLarge large color }
      bannerImage
      averageScore popularity
      staff(perPage: 6, sort: [RELEVANCE]) { edges { role node { name { full } } } }
    }
  }
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(n, attempt = 1) {
  const r = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { page: n, perPage: PER_PAGE } }),
  });
  if (r.status === 429 && attempt <= 5) {
    const wait = (Number(r.headers.get("retry-after")) || 60) * 1000;
    console.log(`  rate limited, waiting ${Math.round(wait / 1000)}s…`);
    await sleep(wait);
    return page(n, attempt + 1);
  }
  if (!r.ok) throw new Error(`AniList returned ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (j.errors) throw new Error(`AniList error: ${JSON.stringify(j.errors).slice(0, 300)}`);
  return j.data.Page;
}

const items = [];
const seen = new Set();
// Fetch extra pages because adult/ecchi titles are filtered out later.
for (let n = 1; items.length < TARGET + 80 && n <= 14; n++) {
  process.stdout.write(`Fetching page ${n}… `);
  const p = await page(n);
  for (const m of p.media) if (!seen.has(m.id)) { seen.add(m.id); items.push(m); }
  console.log(`${items.length} so far`);
  if (!p.pageInfo.hasNextPage) break;
  await sleep(2200);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ source: "AniList (anilist.co)", fetchedAt: new Date().toISOString(), target: TARGET, items }, null, 0));
console.log(`\nSaved ${items.length} titles to data/anilist.json. Rebuilding the catalogue…`);
