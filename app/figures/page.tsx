import { read } from "@/lib/db";
import FigureCatalog from "@/components/FigureCatalog";
import { FigureArt } from "@/components/Art";
export const dynamic = "force-dynamic";
export const metadata = { title: "Figures" };

export default async function FiguresHome() {
  const db = await read();
  const items = db.figures.map((f) => {
    const s = db.series.find((x) => x.id === f.seriesId)!;
    return { slug: f.slug, name: f.name, series: s.title, character: f.character, manufacturer: f.manufacturer.replace(/ \(.+\)/, ""), price: f.price,
      scale: f.scale, availability: f.availability, color: f.color, left: f.editionSize ? f.editionSize - f.editionSold : null, releaseMonth: f.releaseMonth, stock: f.stock, image: f.image };
  });
  const hero = db.figures.find((f) => f.availability === "limited")!;
  return (
    <div className="space-y-6">
      <section className="paper-band relative -mx-4 -mt-5 overflow-hidden border-b-2 border-ink px-4 pb-6 pt-7 dark:border-line">
        <div className="tone pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid grid-cols-[1fr_42%] items-center gap-4">
          <div>
            <h1 className="font-display text-[clamp(30px,9vw,48px)] leading-[0.98]">Real figures. Proven real.</h1>
            <p className="mt-3 text-[15px] leading-snug">Licensed from the studios, from ₹649 minis to numbered 1/7 scale pieces. Scan any box to check it.</p>
          </div>
          <div className="rotate-3 overflow-hidden rounded-panel border-2 border-ink shadow-panel dark:border-line dark:shadow-none"><FigureArt color={hero.color} name={hero.name} image={hero.image} rounded={false} /></div>
        </div>
      </section>
      <FigureCatalog items={items} />
    </div>
  );
}
