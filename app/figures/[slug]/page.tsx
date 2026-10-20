import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { FigureArt } from "@/components/Art";
import AddToCart from "@/components/AddToCart";
import { IconShield } from "@/components/Icons";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const f = (await read()).figures.find((x) => x.slug === params.slug);
  return { title: f?.name ?? "Not found" };
}

export default async function FigurePage({ params }: { params: { slug: string } }) {
  const db = await read();
  const f = db.figures.find((x) => x.slug === params.slug);
  if (!f) notFound();
  const s = db.series.find((x) => x.id === f.seriesId)!;
  const user = await currentUser();
  const left = f.editionSize ? f.editionSize - f.editionSold : null;
  const soldOut = left === 0 || f.stock === 0;
  const owned = user ? db.ownership.some((o) => o.userId === user.id && o.kind === "figure" && o.refId === f.id) : false;
  const related = db.figures.filter((x) => x.seriesId === f.seriesId && x.id !== f.id).slice(0, 4);
  const specs: [string, string][] = [
    ["Series", s.title], ["Character", f.character], ["Manufacturer", f.manufacturer], ["Licensor", f.licensor],
    ["Scale", f.scale], ["Height", `${f.heightCm} cm`], ["Material", f.material],
    ["Availability", f.availability === "preorder" ? `Pre-order · releases ${f.releaseMonth}` : f.availability === "limited" ? `Limited edition of ${f.editionSize}` : "In stock"],
  ];

  return (
    <div className="space-y-5">
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4">
        {[["Front", 0], ["Side", 1], ["Box", 2]].map(([l, v]) => (
          <div key={l} className="w-[85%] shrink-0 snap-center sm:w-[45%]"><FigureArt color={f.color} variant={v as number} label={String(l)} /></div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-1 text-[11px] font-bold text-ok"><IconShield className="h-3.5 w-3.5" /> Official licensed product</span>
          {f.availability === "limited" && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">#{String(f.editionSold + 1).padStart(4, "0")} of {f.editionSize}</span>}
        </div>
        <h1 className="h-title">{f.name}</h1>
        <div className="text-sm text-muted">{s.title} · {f.manufacturer}</div>
        <div className="text-2xl font-extrabold text-accent">{inr(f.price)}</div>
        {f.availability === "limited" && left !== null && (
          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded bg-line"><div className="h-full bg-accent" style={{ width: `${(f.editionSold / f.editionSize!) * 100}%` }} /></div>
            <div className="text-xs text-muted">{left} of {f.editionSize} numbered pieces left. Your number is assigned at checkout.</div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <AddToCart kind="figure" refId={f.id} signedIn={!!user} className="btn-primary flex-1" disabled={soldOut}
          label={soldOut ? "Sold out" : f.availability === "preorder" ? `Pre-order · ${inr(f.price)}` : "Add to cart"} />
      </div>
      {owned && <div className="rounded-xl bg-accentsoft px-3 py-2 text-sm text-accent">This figure is on your shelf.</div>}
      <div className="card divide-y divide-line">
        {specs.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-3 py-2.5 text-sm"><span className="text-muted">{k}</span><span className="text-right font-medium">{v}</span></div>)}
      </div>
      <div className="card flex items-start gap-3 p-3 text-sm">
        <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
        <div>Every box ships with a unique, signed Torii code. Scan it in <Link href="/verify" className="font-semibold underline">Verify</Link> to confirm it's genuine and register it to your shelf. A copied code shows up as already registered.</div>
      </div>
      {related.length > 0 && (
        <section>
          <h2 className="mb-2 font-bold">More from {s.title}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id} href={`/figures/${r.slug}`} className="card overflow-hidden">
                <FigureArt color={r.color} />
                <div className="p-2 text-xs"><div className="line-clamp-2 font-semibold">{r.name}</div><div className="font-bold text-accent">{inr(r.price)}</div></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
