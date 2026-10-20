import { read } from "@/lib/db";
import RevealScope from "@/components/RevealScope";
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
      <section className="paper-band bleed relative -mt-5 overflow-hidden border-b border-line px-4 pb-6 pt-7 dark:border-line">
        <div data-parallax="-36" className="tone pointer-events-none absolute -inset-y-12 inset-x-0 opacity-60" />
        <div className="relative grid grid-cols-[1fr_42%] items-center gap-4">
          <div>
            <h1 className="font-display text-[clamp(30px,9vw,48px)] leading-[0.98]">Real figures. Proven real.</h1>
            <p className="mt-3 text-[15px] leading-snug">Licensed from the studios, from ₹649 minis to numbered 1/7 scale pieces. Scan any box to check it.</p>
          </div>
          <div className="overflow-hidden rounded-panel border border-line shadow-panel dark:border-line dark:shadow-none"><FigureArt color={hero.color} name={hero.name} image={hero.image} rounded={false} /></div>
        </div>
      </section>
      <FigureCatalog items={items} />
      <RevealScope />
    </div>
  );
}
