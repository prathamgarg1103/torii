import { read } from "@/lib/db";
import FigureCatalog from "@/components/FigureCatalog";
export const dynamic = "force-dynamic";
export const metadata = { title: "Action figures" };

export default async function FiguresHome() {
  const db = await read();
  const items = db.figures.map((f) => {
    const s = db.series.find((x) => x.id === f.seriesId)!;
    return { slug: f.slug, name: f.name, series: s.title, character: f.character, manufacturer: f.manufacturer.replace(/ \(.+\)/, ""), price: f.price,
      scale: f.scale, availability: f.availability, color: f.color, left: f.editionSize ? f.editionSize - f.editionSold : null, releaseMonth: f.releaseMonth, stock: f.stock };
  });
  return (
    <div className="space-y-5">
      <section className="card overflow-hidden">
        <div className="bg-accent px-4 py-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">100% licensed · verify every box</div>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">Official action figures</h1>
          <p className="mt-1 text-sm opacity-90">From ₹649 minis to numbered 1/7 scale limited editions. Each one carries a scannable authenticity tag.</p>
        </div>
      </section>
      <FigureCatalog items={items} />
    </div>
  );
}
