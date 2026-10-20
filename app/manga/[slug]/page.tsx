import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ownedVolumes, publisherName } from "@/lib/catalog";
import { Cover } from "@/components/Art";
import AddToCart from "@/components/AddToCart";
import VolumeGrid from "@/components/VolumeGrid";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = (await read()).series.find((x) => x.slug === params.slug);
  return { title: s ? `${s.title} volumes` : "Not found" };
}

export default async function SeriesShop({ params }: { params: { slug: string } }) {
  const db = await read();
  const s = db.series.find((x) => x.slug === params.slug);
  if (!s) notFound();
  const user = await currentUser();
  const owned = user ? ownedVolumes(db, user.id, s.id) : new Set<number>();
  const inCart = new Set(user ? db.cart.filter((c) => c.userId === user.id && c.kind === "volume").map((c) => c.refId) : []);
  const vols = db.volumes.filter((v) => v.seriesId === s.id).sort((a, b) => a.number - b.number);
  const missing = vols.filter((v) => !owned.has(v.number) && v.stock > 0 && !inCart.has(v.id));
  const missingTotal = missing.reduce((a, v) => a + v.price, 0);
  const boxes = db.boxSets.filter((b) => b.seriesId === s.id);
  const prog = user ? db.progress.find((p) => p.userId === user.id && p.seriesId === s.id) : undefined;
  const readVol = prog ? db.chapters.find((c) => c.seriesId === s.id && c.number === prog.chapter)?.volumeNumber ?? 0 : 0;

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="w-28 shrink-0"><Cover title={s.title} color={s.color} sub="Vol. 1" /></div>
        <div className="space-y-1">
          <h1 className="h-title">{s.title}</h1>
          <div className="text-sm text-muted">{s.author} · {publisherName(db, s.publisherId)}</div>
          <div className="text-sm">{s.totalVolumes} volumes · {s.status === "ongoing" ? "Ongoing" : "Completed"}</div>
          {user && <div className="text-sm font-semibold text-accent">You own {owned.size} of {s.totalVolumes}</div>}
          <Link href={`/read/${s.slug}`} data-section="read" className="inline-block text-sm font-semibold text-accent underline">Read it first →</Link>
        </div>
      </div>

      {readVol > 0 && owned.size < readVol && (
        <div className="rounded-xl bg-accentsoft px-3 py-2.5 text-sm text-accent">
          You've read up to chapter {prog!.chapter} (Volume {readVol}){owned.size ? ` but own ${owned.size} volume${owned.size > 1 ? "s" : ""}` : " but don't own any volumes yet"}.
        </div>
      )}

      {missing.length > 0 && (
        <div className="card flex items-center gap-3 p-3">
          <div className="flex-1 text-sm"><div className="font-bold">Complete your shelf</div><div className="text-muted">{missing.length} missing volume{missing.length > 1 ? "s" : ""} in stock · {inr(missingTotal)}</div></div>
          <AddToCart items={missing.map((v) => ({ kind: "volume", refId: v.id }))} label={`Add ${missing.length} missing`} signedIn={!!user} className="btn-primary" />
        </div>
      )}

      {boxes.length > 0 && (
        <div className="space-y-2">
          {boxes.map((b) => {
            const full = vols.filter((v) => v.number >= b.fromVol && v.number <= b.toVol).reduce((a, v) => a + v.price, 0);
            return (
              <div key={b.id} className="card flex items-center gap-3 p-3">
                <div className="flex-1 text-sm">
                  <div className="font-bold">{b.title}</div>
                  <div className="text-muted">Vol. {b.fromVol}–{b.toVol} · <span className="font-semibold text-accent">{inr(b.price)}</span> <span className="line-through">{inr(full)}</span></div>
                </div>
                <AddToCart kind="box" refId={b.id} label="Add" signedIn={!!user} className="btn-ghost" />
              </div>
            );
          })}
        </div>
      )}

      <VolumeGrid title={s.title} color={s.color} signedIn={!!user}
        vols={vols.map((v) => ({ id: v.id, number: v.number, price: v.price, edition: v.edition, stock: v.stock, owned: owned.has(v.number), inCart: inCart.has(v.id) }))} />
    </div>
  );
}
