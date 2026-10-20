import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canRead } from "@/lib/catalog";
import { LANGS } from "@/lib/types";

// Generates placeholder manga pages as SVG. Locked chapters return 403, so pages can't be fetched directly.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const slug = u.searchParams.get("s") || "", c = Number(u.searchParams.get("c")), p = Number(u.searchParams.get("p")), l = u.searchParams.get("l") || "en";
  const db = read();
  const s = db.series.find((x) => x.slug === slug);
  const ch = s && db.chapters.find((x) => x.seriesId === s.id && x.number === c);
  if (!s || !ch || !(p >= 1 && p <= ch.pages)) return new Response("Not found", { status: 404 });
  if (!canRead(db, ch, currentUser())) return new Response("Locked", { status: 403 });
  const lang = LANGS.find((x) => x.code === l) ?? LANGS[0];
  const seed = (c * 31 + p * 7) % 4;
  const layouts = [
    [[20, 20, 560, 300], [20, 340, 270, 420], [310, 340, 270, 420]],
    [[20, 20, 270, 380], [310, 20, 270, 380], [20, 420, 560, 340]],
    [[20, 20, 560, 230], [20, 270, 560, 260], [20, 550, 560, 210]],
    [[20, 20, 360, 470], [400, 20, 180, 470], [20, 510, 560, 250]],
  ][seed];
  const panels = layouts.map(([x, y, w, h], i) => {
    const cx = x + w / 2, cy = y + h / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#111" stroke-width="4"/>
      <g opacity=".14">${Array.from({ length: 7 }, (_, k) => `<line x1="${cx}" y1="${cy}" x2="${x + (k * w) / 6}" y2="${y}" stroke="#111" stroke-width="2"/>`).join("")}</g>
      <circle cx="${cx}" cy="${cy + 10}" r="${Math.min(w, h) / 6}" fill="${s.color}" opacity=".85"/>
      <ellipse cx="${x + w * 0.72}" cy="${y + 52}" rx="${Math.min(110, w * 0.3)}" ry="34" fill="#fff" stroke="#111" stroke-width="3"/>
      <text x="${x + w * 0.72}" y="${y + 58}" font-size="17" text-anchor="middle" font-family="sans-serif" fill="#111">${i === 0 ? lang.native : "…!"}</text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 860" width="600" height="860">
    <rect width="600" height="860" fill="#f4f1ea"/>${panels}
    <text x="300" y="800" font-size="20" font-weight="700" text-anchor="middle" font-family="sans-serif" fill="#111">${esc(s.title)} · Chapter ${c} · Page ${p}/${ch.pages}</text>
    <text x="300" y="830" font-size="15" text-anchor="middle" font-family="sans-serif" fill="#666">Placeholder page · ${lang.name} edition · official artwork appears here</text></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "private, max-age=3600" } });
}
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
