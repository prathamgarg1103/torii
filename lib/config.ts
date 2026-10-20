export const APP_NAME = "Torii";
export const APP_TAGLINE = "The official home of Japanese manga in India";
export const CHAPTER_PRICE = 9;
export const FREE_CHAPTERS_IN_PAID_MODE = 3;
export const SECTIONS = {
  read: { label: "Read", accent: "200 40 43" },
  manga: { label: "Manga", accent: "45 72 178" },
  figures: { label: "Figures", accent: "186 120 22" },
  shelf: { label: "My Shelf", accent: "46 125 91" },
  account: { label: "Account", accent: "200 40 43" },
} as const;
export type SectionKey = keyof typeof SECTIONS;
