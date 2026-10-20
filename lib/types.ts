export type Lang = "en" | "hi" | "ta" | "te" | "bn";
export const LANGS: { code: Lang; name: string; native: string }[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
];

export interface Publisher { id: string; name: string; }
export interface Series {
  id: string; slug: string; title: string; author: string; publisherId: string;
  genres: string[]; status: "ongoing" | "completed"; synopsis: string; color: string;
  languages: Lang[]; popularity: number; totalChapters: number; totalVolumes: number; startYear: number;
}
export interface Chapter {
  id: string; seriesId: string; number: number; volumeNumber: number; title: string; pages: number;
  freeOverride: boolean | null;
}
export interface Volume { id: string; seriesId: string; number: number; price: number; edition: "india" | "import"; stock: number; }
export interface BoxSet { id: string; seriesId: string; title: string; fromVol: number; toVol: number; price: number; }
export interface Figure {
  id: string; slug: string; name: string; seriesId: string; character: string; manufacturer: string; licensor: string;
  price: number; scale: string; heightCm: number; material: string; availability: "in_stock" | "preorder" | "limited";
  editionSize: number | null; editionSold: number; releaseMonth: string | null; color: string; stock: number;
}
export interface User { id: string; phone: string; name: string | null; wallet: number; isAdmin: boolean; createdAt: string; }
export interface Unlock { userId: string; chapterId: string; createdAt: string; }
export interface Progress { userId: string; seriesId: string; chapter: number; language: Lang; updatedAt: string; }
export type ItemKind = "volume" | "box" | "figure";
export interface CartItem { id: string; userId: string; kind: ItemKind; refId: string; qty: number; }
export interface OrderItem { id: string; kind: ItemKind; refId: string; title: string; price: number; qty: number; editionNos: number[]; tagCodes: string[]; }
export interface Order {
  id: string; userId: string; total: number; status: string; name: string; address: string; pincode: string;
  city: string; state: string; eta: string; paymentRef: string; createdAt: string; items: OrderItem[];
}
export interface AuthTag {
  code: string; kind: "volume" | "figure"; refId: string; title: string; editionNo: number | null;
  ownerId: string | null; registeredAt: string | null; registeredCity: string | null;
}
export interface Ownership { userId: string; kind: "volume" | "figure"; refId: string; source: "order" | "verify"; createdAt: string; }
export interface Event { id: string; type: "read" | "unlock" | "print" | "figure"; seriesId: string; language: Lang; state: string; city: string; amount: number; createdAt: string; }

export interface DB {
  publishers: Publisher[]; series: Series[]; chapters: Chapter[]; volumes: Volume[]; boxSets: BoxSet[]; figures: Figure[];
  users: User[]; unlocks: Unlock[]; progress: Progress[]; cart: CartItem[]; orders: Order[]; tags: AuthTag[];
  ownership: Ownership[]; settings: { readingMode: "free" | "paid" }; events: Event[];
}

export interface Catalog {
  publishers: Publisher[]; series: Series[]; chapters: Chapter[]; volumes: Volume[]; boxSets: BoxSet[]; figures: Figure[]; events: Event[];
}
export interface State {
  users: User[]; unlocks: Unlock[]; progress: Progress[]; cart: CartItem[]; orders: Order[]; tags: AuthTag[]; ownership: Ownership[];
  settings: { readingMode: "free" | "paid" }; events: Event[];
  chapterOverrides: Record<string, boolean>; stock: Record<string, number>; editionSold: Record<string, number>;
}
