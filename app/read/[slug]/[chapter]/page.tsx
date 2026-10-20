import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canRead, isChapterFree, ownedVolumes } from "@/lib/catalog";
import Reader from "@/components/Reader";
import UnlockGate from "@/components/UnlockGate";
import { LANGS, type Lang } from "@/lib/types";
import { CHAPTER_PRICE } from "@/lib/config";

export const dynamic = "force-dynamic";
export function generateMetadata({ params }: { params: { slug: string; chapter: string } }) {
  const s = read().series.find((x) => x.slug === params.slug);
  return { title: s ? `${s.title} · Ch. ${params.chapter}` : "Not found" };
}

export default function ChapterPage({ params, searchParams }: { params: { slug: string; chapter: string }; searchParams: { lang?: string } }) {
  const db = read();
  const s = db.series.find((x) => x.slug === params.slug);
  const n = parseInt(params.chapter, 10);
  const ch = s && db.chapters.find((c) => c.seriesId === s.id && c.number === n);
  if (!s || !ch) notFound();
  const user = currentUser();
  const lang: Lang = s.languages.includes(searchParams.lang as Lang) ? (searchParams.lang as Lang) : "en";
  const langs = LANGS.filter((l) => s.languages.includes(l.code)).map((l) => ({ code: l.code, native: l.native }));
  const next = db.chapters.find((c) => c.seriesId === s.id && c.number === n + 1);

  if (!canRead(db, ch, user)) {
    return <UnlockGate slug={s.slug} title={s.title} chapter={n} chapterId={ch.id} lang={lang} price={CHAPTER_PRICE}
      signedIn={!!user} wallet={user?.wallet ?? 0} color={s.color} />;
  }

  // End-of-volume bridge to print: this chapter is the last one collected in its volume.
  const isVolumeEnd = ch.volumeNumber > 0 && (!next || next.volumeNumber !== ch.volumeNumber);
  const vol = isVolumeEnd ? db.volumes.find((v) => v.seriesId === s.id && v.number === ch.volumeNumber) : undefined;
  const owns = vol && user ? ownedVolumes(db, user.id, s.id).has(vol.number) : false;

  return (
    <Reader
      slug={s.slug} title={s.title} chapter={n} pages={ch.pages} lang={lang} langs={langs} total={s.totalChapters}
      next={next ? { number: next.number, locked: !canRead(db, next, user), free: isChapterFree(db, next) } : null}
      bridge={vol ? { volumeId: vol.id, number: vol.number, price: vol.price, edition: vol.edition, inStock: vol.stock > 0, owned: owns } : null}
      signedIn={!!user}
    />
  );
}
