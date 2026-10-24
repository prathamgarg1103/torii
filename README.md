# Torii: the official Japanese manga store for India (prototype)

Torii is a mobile-first web app (installable PWA) run by Japanese publishers. It brings every publisher's catalogue into one official place for Indian fans. There are three sections in one app, the way Swiggy and Instamart share one app:

| Section | What it does |
|---|---|
| **Read** | Every series from Shueisha, Kodansha, Shogakukan and Square Enix, in English, Hindi, Tamil, Telugu and Bengali. Free at launch, then ₹9 per chapter at the flip of one switch. |
| **Manga** | Every printed volume in order, India-printed editions from ₹299, box sets, and one-tap "add missing volumes". |
| **Figures** | Licensed action figures, from ₹649 minis to numbered 1/7-scale limited editions. |

All three share one account (phone + OTP), one cart, one UPI wallet, **My Shelf** (reading progress, volumes and figures owned, gaps highlighted) and **Verify** (scan the signed authenticity code on any product). Japanese publishers submit and manage their own series in the **Partner Portal** at `/partner` (see below). The **publisher dashboard** at `/publisher` shows the Japanese publishers what India reads and buys, by series, language, state and city. It also holds the reading-mode switch.

## Phone only

Torii is built as a phone app. Every screen uses one phone-width column. On a computer the app sits in that column, with a panel beside it inviting people to open it on their phone, plus a QR code.

## The top 400 manga, with covers and trailers

Out of the box the repo holds 14 hand-built series. The 400 most popular Japanese manga come from [AniList](https://anilist.co), and **this happens automatically**: `npm run dev` and `npm run build` (so every Vercel deploy) check for `data/anilist.json`, and if it's missing they import the top 400 first. It takes about a minute, once.

The import fetches:
- titles, authors, genres, demographics (Shonen, Seinen, Shojo, Josei), status, chapter and volume counts, synopses
- cover art and banner art (falling back to the anime's banner when the manga has none)
- the **YouTube trailer** of each title's anime adaptation
- **character art** for the figures shop

It filters out adult titles and keeps the 14 original series under their existing links, so figures and demo codes still work. If AniList can't be reached, the build carries on with the current catalogue instead of failing.

To refresh the data by hand, or to save it in the repo so deploys don't fetch it again:

```bash
npm run import
git add data/anilist.json data/catalog.json && git commit -m "Import top 400 manga" && git push
```

**No empty cards.** Any card the catalogue has no artwork for (for example the 14 built-in series before the import has run) looks itself up on AniList in the viewer's browser: covers, banners, trailers and figure character art. Lookups are batched, rate-limited and cached on the device for a week. Until the art arrives, or if it can't be found, the generated jacket stays.

**Trailers:** the Read billboard plays the current title's trailer muted behind the banner, like a streaming app, with a sound toggle and a Trailer button for the full player. Series pages have a "Watch the anime trailer" card. Videos play from youtube-nocookie.com. Autoplay is skipped with reduced motion or data saver on, and a trailer that won't embed is never shown.

How the imported data is used:
- **Images and videos** stay on AniList's servers and YouTube and load in the viewer's browser. If an image can't load, the generated jacket is shown instead.
- **Credit:** the app shows "Covers, banners and synopses from AniList. Artwork © its publishers. Shown for demonstration only."
- **Publishers:** AniList doesn't list publishers, so well-known series are mapped to Shueisha, Kodansha, Shogakukan, Square Enix, Kadokawa, Hakusensha or Akita Shoten. Everything else shows as "Other publishers".
- **Missing counts:** where AniList has no chapter or volume count (common for ongoing series), the count is estimated.

Chapters, volumes and box sets aren't stored. They're worked out from each series' counts (`lib/derive.ts`), so 400 series stay fast.

To try the 400-series layout without internet, run `npm run seed -- --fixture`. It uses a synthetic sample with fake titles, for testing only.

The **Read** home is laid out like Netflix:
- a billboard with banner art
- Continue reading
- Top 10 in India
- "Because you read …"
- rows for Shonen, Seinen, Shojo and each genre, plus Read in Hindi or Tamil, Highest rated, Completed and New this decade

Every row has a "See all" link to a filterable, paged browse page.

## Partner Portal: Japanese publishers submit their manga

Publishers have their own sign-in and console at **`/partner`**. It's separate from the fan app (work email and password instead of phone OTP, its own session cookie), and it's a full-width desktop layout because publishers work at desks in Tokyo.

| Path | What it does |
|---|---|
| `/partner` | The partner programme: how it works, the standard terms (70% of ₹9 unlocks, 40% print royalty, 15% merchandise royalty, paid monthly), live store figures |
| `/partner/apply` | A new publisher joins: company (English and Japanese name), owner account, accepts the terms. They can prepare titles at once; nothing goes live and no sales data is shown until Torii **verifies** the company |
| `/partner/login` | Sign in |
| `/partner/dashboard` | What needs attention (changes requested, unfinished drafts, titles in review), KPIs and earnings, recent activity |
| `/partner/titles` | Every title by status, plus the series Torii already carries for that publisher |
| `/partner/titles/[id]` | The title editor: details, synopsis, genres, age rating, cover and banner, **licensed languages, rights (digital/print/merch), term, exclusivity, reader pricing**, chapters, a readiness checklist, a store preview and the review history |
| `/partner/titles/[id]/chapters/[cid]` | Upload pages per language (images or a **.cbz/.zip**, ordered by file name), drag to reorder, preview, and release: hold, release now, or **schedule** (e.g. "Next Monday 00:00 JST" for a simulpub) |
| `/partner/insights` | The India dashboard (reads, unlocks, states, cities, Translate next) for that publisher's titles only |
| `/partner/earnings` | Monthly statements with the publisher's share per revenue stream and payout status |

**Torii staff** review titles in the main app at **`/publisher/review`** (sign in as `9999999999`): verify publishers, then approve, ask for changes (with a note the publisher sees) or reject. A live title can be taken down the same way.

**Approval puts the series straight into the reader app.** It appears in a "New from Japan, first on Torii" row on the Read home, gets an "Official release" series page with the Japanese title and the next scheduled chapter, and the reader serves the uploaded pages (in the reader's language where uploaded). Paid mode, ₹9 unlocks, progress, analytics and earnings all work as for built-in series. If the publisher licensed print, India-printed volumes appear in the Manga shop once there are enough chapters.

How it's built:
- Pages are resized (1400px wide) and compressed to WebP in the browser before upload, so chapters stay light on Indian mobile data.
- The server checks every upload's real file type from its bytes, and stores each image on its own: in Redis (`torii:blob:<id>`) when Upstash is set up, otherwise in `data/uploads/`.
- Pages are never public: before release only the uploading publisher and Torii staff can load them; after release readers get them through `/api/page`, which checks the chapter is out and unlocked. Covers and banners are public.
- Passwords are hashed with scrypt; repeated failed sign-ins are slowed down. Publishers can only see and change their own titles.
- Code: `lib/partner.ts` (rules: release logic, checklist, revenue share, turning an approved submission into a catalogue series), `lib/partner-auth.ts`, `lib/blobs.ts`, `lib/image-client.ts`, `app/api/partner/*`, `app/partner/*`, `app/publisher/review/*`.

### Partner demo accounts

| Publisher | Email | Password |
|---|---|---|
| Shueisha (verified, with existing titles and sales) | `partner@shueisha.example` | `torii-demo` |
| Kodansha (verified) | `partner@kodansha.example` | `torii-demo` |

No manga files handy? On a chapter, **Generate 8 sample pages** draws placeholder pages in the chosen language and uploads them like real ones.

### 3-minute partner demo

1. `/partner` → **Sign in as Shueisha** → **New title**. Name it, fill in author, synopsis and genres, add Hindi as a licensed language, turn on print, **Save**. Upload a cover.
2. **Add chapter 1** → **Generate 8 sample pages** (switch to Hindi and generate again) → Release: **Release when approved** → Save.
3. Add chapter 2, upload pages, **Schedule** → *Next Monday 00:00 JST*.
4. Back on the title: the checklist is all ticked → **Send for review**.
5. In another browser window, sign in to the fan app as `9999999999` → `/publisher/review` → open the title → **Approve and publish**.
6. Open `/read`: the series is in "New from Japan, first on Torii". Its page shows "Chapter 2 arrives Mon … IST". Read chapter 1, switch to हिन्दी.
7. Back in the portal, the title shows **Live on Torii**; Insights and Earnings show the publisher's India data.
8. Optional: **Join** as a new publisher to see the unverified state, then verify it from the review queue.

## Run it

Requires Node.js 18.17 or newer.

```bash
npm install && npm run seed && npm run dev
```

Open http://localhost:3000. On a phone, open the same address over your Wi-Fi (e.g. `http://192.168.1.20:3000`), or deploy it (see below) to install it as an app.

For a production build: `npm run build && npm start`. The service worker (offline reading of chapters you've opened, plus installability) only runs in a production build.

## Demo accounts

The OTP is simulated. For any number, enter **123456**.

| Role | Phone | Notes |
|---|---|---|
| Fan | `9876543210` | ₹50 in the wallet |
| Publisher admin | `9999999999` | Opens `/publisher` |
| Anyone else | any valid Indian mobile | creates a new account |

## Demo verification codes

These are also shown as scannable QR codes at `/publisher/tags`, and printed by `npm run seed`.

| Code | Result |
|---|---|
| `T1-GENUINE1-2JFXZC9E` | Genuine figure, unregistered. The first signed-in scan registers it and adds it to My Shelf |
| `T1-GENUINE2-83SMHLXT` | Genuine volume (Jujutsu Kaisen Vol. 1), unregistered |
| `T1-CLAIMED1-EBFEJQK8` | Genuine code, already registered in Lucknow, so flagged as a likely copy |
| `T1-FAKE7777-ABCDEFGH` | Fake: not issued by Torii |

The codes above match the default `TAG_SECRET` in `.env`. If you change the secret, re-run `npm run seed` and use the new codes it prints. Every order also mints new codes, one per unit, which are shown as QR codes on the order page.

## How to flip reading from free to paid

Sign in as the admin → `/publisher` → **Reading mode** → *Paid, ₹9 a chapter*. In paid mode, the first 3 chapters of every series stay free, and the rest show a lock with "Unlock for ₹9" (wallet or UPI). Once unlocked, a chapter stays unlocked forever. **Per-chapter override** on the same screen makes any single chapter always free or always paid.

## 2-minute demo script

1. **Browse.** Open `/read`. Filter by publisher or language and search "titan". Note that every series, from four publishers, is in one place.
2. **Read free.** Sign in as the fan, open *One Piece*, and tap **Start with chapter 1**. Tap the page to show the controls, then switch Scroll ↔ Pages or change the language.
3. **Flip to paid.** In a second browser window, sign in as the admin → `/publisher` → *Paid, ₹9 a chapter*.
4. **Unlock for ₹9.** As the fan, open *One Piece* chapter 5. It's locked: tap **Unlock with wallet**. Open chapter 6 and pay with **UPI** to show the checkout.
5. **Read → buy print.** Open *Jujutsu Kaisen* chapter 9, unlock it and scroll to the end. The card says you've finished Volume 1, with **Own volume 1 in print for ₹349**, with Add to cart.
6. **Buy a figure.** Go to Figures → *Ryomen Sukuna 1/7 Scale Limited* (it shows the next number, e.g. #0307 of 500) → Add to cart.
7. **Checkout.** Open Cart → Checkout and enter pincode `151001`. The app shows the delivery estimate for the Ludhiana region. Pay with UPI. The order page shows the edition number and one QR authenticity tag per item.
8. **Verify.** Tap a QR (or scan it with another phone). It shows **Genuine** and registers to you. Then try `T1-CLAIMED1-EBFEJQK8` (already registered) and `T1-FAKE7777-ABCDEFGH` (fake).
9. **My Shelf.** Shows reading progress, unlocked chapters, the volume and the numbered figure, plus "You've read up to chapter X but own volumes 1–Y" gaps with **Fill gaps**.
10. **Publisher dashboard.** Back on `/publisher`: KPIs, the read → unlock → print funnel, top series by reads and by sales, language/state/city breakdowns, and **Translate next** (e.g. Tamil readers reading a series with no Tamil edition yet).

Run `npm run seed` at any time to reset all data.

## Payments

With no keys set, the app uses a built-in **mock UPI checkout** (Google Pay / PhonePe / Paytm / BHIM / UPI ID), so the demo never breaks. To use **Razorpay test mode**, put your test keys in `.env`:

```
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

The server creates a Razorpay order and verifies the payment signature before it fulfils anything. Prices are always calculated on the server, never taken from the client.

## How authenticity works

Each code is `T1-<serial>-<signature>`, where the signature is an HMAC-SHA256 of the serial using a server-only secret. A counterfeiter can't generate valid codes. If they copy a real one, the second scan shows *already registered in <city> on <date>*. Codes are minted per unit at checkout. In production they would be printed on hang-tags and inside covers.

## Design

The look borrows from Japanese manga weeklies, which are printed on coloured newsprint with each section on its own paper stock. Torii does the same: **Read** is sakura pink, **Manga** is blue, **Figures** is yellow and **Shelf** is green, all on a cool newsprint base with violet-black ink and one print-crimson accent.

- **Type:** Dela Gothic One (a Japanese-designed heavy display face) for headings and prices, Hanken Grotesk for everything else. Both are bundled through Fontsource, so nothing loads from Google at runtime.
- **Artwork:** every cover is a generated manga-panel jacket (speed lines, screentone, halftone suns, ink gutters), and every figure is an abstract studio render. No copyrighted covers, characters or product photos are included.
- **Motion (GSAP + ScrollTrigger + SplitText, Tailwind):** one easing language throughout, long decelerating expo curves with no bounce or overshoot.
  - **On load:** the Read hero opens its jacket with a clip-path wipe while the headline rises letter by letter from behind a mask. Swiping or tapping the dots changes slides with a directional wipe, and the hero drifts slowly as you scroll away.
  - **On scroll:** headings rise line by line, cover grids and lists cascade in, and stats count up. Scrolling stays native, so it is fast.
  - **On interaction:** the nav highlight glides between sections, and the header tightens as you scroll. "Add to cart" draws its check mark while the cart icon pulses. Sheets glide up, the unlock lock lifts its shackle, and Verify draws its seal around the result.
  - **Between screens:** every screen eases in, a hairline progress bar runs across the top while the next screen loads, and the Read section shows shimmer skeletons.
  - **Accessibility:** content waiting to scroll in stays focusable and clickable, and all motion switches off when the device asks for reduced motion.
- Works in light and dark mode, with 44px+ tap targets and visible keyboard focus.

### Adding official artwork

Each series and figure has an optional `image` field, typed in `lib/types.ts` and set in `data/catalog.json`. Put an image URL there (for example from a publisher's licensing portal) and it replaces the generated art everywhere that item appears.

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS, GSAP (ScrollTrigger, SplitText, @gsap/react), Fontsource fonts
- PWA: manifest, icons, service worker with offline reading of opened chapters
- Data: the catalogue is static and bundled from `data/catalog.json`. Everything that changes (accounts, carts, orders, unlocks, tags, settings, stock) is a small state document, stored in **Upstash Redis** when its env vars are set, or in `data/state.json` otherwise. Every read and write goes through `read()` / `mutate()` in `lib/db.ts`, so it can be swapped for Postgres in production.
- Razorpay (test mode) with a mock fallback, `html5-qrcode` for camera scanning, `qrcode` for tag images, Recharts for the dashboard

### Project layout

```
app/              pages and API routes (read, manga, figures, shelf, verify, cart, checkout, orders, account, publisher)
components/       UI (reader, unlock gate, UPI checkout, catalogues, dashboard)
lib/              data store, auth, catalogue rules, payments, authenticity tags, pincode lookup
scripts/seed.ts   catalogue, demo users, demo tags and 1,800 analytics events
```

## Deploying

### Vercel (recommended)
1. Push this folder to GitHub, then on vercel.com click **Add New → Project** and import the repo. The framework is detected as Next.js automatically.
2. Before (or right after) the first deploy, open the project → **Storage** → **Create / Connect** → **Upstash for Redis** (free plan) and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Under **Settings → Environment Variables**, add `AUTH_SECRET` (any long random string). Optionally add `TAG_SECRET`: if you change it from the default, the demo codes in this README stop matching.
4. **Redeploy**, so the app picks up the Redis variables.

Without Redis, Vercel can show the catalogue but can't save sign-ins, carts or orders, because serverless functions can't keep files. To wipe demo data on Vercel, use **Reset demo data** in the publisher dashboard's Reading mode card, or delete the `torii:state:v1` key in the Upstash console.

### Render / Railway / any VPS
These work without Redis, using the file store. On Render: **New → Blueprint** → pick the repo (`render.yaml` is included, free plan). The file store resets when a free instance restarts.

Camera scanning needs HTTPS, which all of these hosts provide.

## What's simulated

- OTP SMS (always `123456`) and the mock UPI checkout
- Manga pages, covers and figure images are generated placeholders. No copyrighted artwork is included (see "Adding official artwork").
- Chapter and volume counts are approximate.
- Analytics are seeded demo data; real activity in the app is added on top.
- Pincode → region lookup is approximate (first two digits).
- Partner payouts and Torii's KYC check of publishers are simulated (one click in the review queue).
- Out of scope: community/chat, real delivery integration.
