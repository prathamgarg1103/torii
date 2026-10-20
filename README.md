# Torii: the official Japanese manga store for India (prototype)

Torii is a mobile-first web app (installable PWA) run by Japanese publishers. It brings every publisher's catalogue into one official place for Indian fans. There are three sections in one app, the way Swiggy and Instamart share one app:

| Section | What it does |
|---|---|
| **Read** | Every series from Shueisha, Kodansha, Shogakukan and Square Enix, in English, Hindi, Tamil, Telugu and Bengali. Free at launch, then ₹9 per chapter at the flip of one switch. |
| **Manga** | Every printed volume in order, India-printed editions from ₹299, box sets, and one-tap "add missing volumes". |
| **Figures** | Licensed action figures, from ₹649 minis to numbered 1/7-scale limited editions. |

All three share one account (phone + OTP), one cart, one UPI wallet, **My Shelf** (reading progress, volumes and figures owned, gaps highlighted) and **Verify** (scan the signed authenticity code on any product). The **publisher dashboard** at `/publisher` shows the Japanese publishers what India reads and buys, by series, language, state and city. It also holds the reading-mode switch.

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

Sign in as the admin → `/publisher` → **Reading mode** → *Paid · ₹9/chapter*. In paid mode, the first 3 chapters of every series stay free, and the rest show a lock with "Unlock for ₹9" (wallet or UPI). Once unlocked, a chapter stays unlocked forever. **Per-chapter override** on the same screen makes any single chapter always free or always paid.

## 2-minute demo script

1. **Browse.** Open `/read`. Filter by publisher or language and search "titan". Note that every series, from four publishers, is in one place.
2. **Read free.** Sign in as the fan, open *One Piece*, and tap **Start reading**. Tap the page to show the controls, then switch Scroll ↔ Pages or change the language.
3. **Flip to paid.** In a second browser window, sign in as the admin → `/publisher` → *Paid · ₹9/chapter*.
4. **Unlock for ₹9.** As the fan, open *One Piece* chapter 5. It's locked: tap **Unlock from wallet**. Open chapter 6 and pay with **UPI** to show the checkout.
5. **Read → buy print.** Open *Jujutsu Kaisen* chapter 9, unlock it and scroll to the end. The card says you've finished Volume 1, with **Own this volume in print — ₹349 → Add to cart**.
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

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- PWA: manifest, icons, service worker with offline reading of opened chapters
- Data: a small file-backed store (`lib/db.ts` → `data/db.json`) with zero setup. Every read and write goes through `read()` / `mutate()`, so it can be swapped for Postgres/Prisma for production.
- Razorpay (test mode) with a mock fallback, `html5-qrcode` for camera scanning, `qrcode` for tag images, Recharts for the dashboard

### Project layout

```
app/              pages and API routes (read, manga, figures, shelf, verify, cart, checkout, orders, account, publisher)
components/       UI (reader, unlock gate, UPI checkout, catalogues, dashboard)
lib/              data store, auth, catalogue rules, payments, authenticity tags, pincode lookup
scripts/seed.ts   catalogue, demo users, demo tags and 1,800 analytics events
```

## Deploying

The file-based store needs a server with a persistent disk, such as Render, Railway, Fly.io or any VPS: `npm install && npm run seed && npm run build && npm start`. Serverless hosts like Vercel don't keep files between requests, so for those, swap `lib/db.ts` for a hosted database first. Camera scanning needs HTTPS, which all of these hosts provide.

## What's simulated

- OTP SMS (always `123456`) and the mock UPI checkout
- Manga pages, covers and figure images are generated placeholders. No copyrighted artwork is included.
- Chapter and volume counts are approximate.
- Analytics are seeded demo data; real activity in the app is added on top.
- Pincode → region lookup is approximate (first two digits).
- Out of scope: community/chat, real delivery integration, publisher APIs.
