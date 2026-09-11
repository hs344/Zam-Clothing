# ZAM CLOTHING — Young-Made. Youth-Worn.

A launch-ready small-business e-commerce site. **Google Sheets is the store's database, Google Apps Script is the API, and WhatsApp is the checkout.** No accounts, no online payments.

```
Customer → Website (Next.js) → /api/store/* → Google Apps Script → Google Sheets
                                                                  ├─ PRODUCTS
                                                                  ├─ CATEGORIES
                                                                  ├─ INVENTORY
                                                                  ├─ SETTINGS
                                                                  ├─ ORDERS
                                                                  └─ ORDER_ITEMS
```

| Part | Where |
|---|---|
| A. Frontend | `src/` (Next.js App Router, TypeScript, Tailwind) |
| B. Apps Script backend | `google-apps-script/Code.gs` |
| C. Sheets structure | `docs/GOOGLE_SHEETS_SETUP.md` + headers in `Code.gs` |
| D. Sample data | `google-sheets/*.csv` (also used as demo data in `src/lib/demo-data.ts`) |
| E–G. Setup / config / deploy | `docs/GOOGLE_SHEETS_SETUP.md` |
| H–L. Owner how-tos | `docs/OWNER_GUIDE.md` |

## Demo mode vs. live mode

| | `APPS_SCRIPT_URL` empty (demo) | `APPS_SCRIPT_URL` set (live) |
|---|---|---|
| Products / categories / inventory / settings | `src/lib/demo-data.ts` | Google Sheets |
| Orders | local Postgres tables (`demo_orders`) | `ORDERS` + `ORDER_ITEMS` sheets |
| Tracking | local Postgres | Google Sheets |

Demo mode exists only so the full journey can be tested before the sheet is connected. Switch to live by setting one env var — no code changes.

## Run locally

```bash
npm install
cp .env.example .env        # fill APPS_SCRIPT_URL when ready
npm run dev
```

## Project map

```
src/app/                        routes: / shop shop/[category] search wishlist cart checkout
                                        order-confirmation track-order info/[slug] api/store/[action]
src/components/home/            Hero, CategoryCarousel, CategoryCard
src/components/shop/            CategoryShop, FilterPanel, SortControl, ProductGrid, SearchForm
src/components/product/         ProductCard, ProductDetail, SizeGuide
src/components/cart|checkout    CartView, CheckoutFlow, Invoice, OrderConfirmation
src/components/track/           TrackOrder
src/store/store-provider.tsx    cart + wishlist state (localStorage)
src/lib/server/store.ts         data facade: Sheets (via Apps Script) or demo
src/lib/server/apps-script.ts   Apps Script HTTP client (server-only)
src/lib/catalogue.ts            sorting / filtering / stock logic
src/lib/whatsapp.ts             WhatsApp message + URL builder
src/lib/normalize.ts            sheet row → typed model (incl. Google Drive URL fixing)
google-apps-script/Code.gs      complete backend
google-sheets/*.csv             import-ready sample sheets
scripts/export-sheets-csv.ts    regenerates the CSVs from demo data
```

## Journey

Storefront → **Explore Collection** (smooth-scrolls) → horizontal category carousel → **Explore Now** → `/shop/<category>` → product drawer (size / colour / qty, size guide, wishlist) → cart → guest details → invoice with Order ID → **Order via WhatsApp** (order saved to Sheets, WhatsApp opens pre-filled) → confirmation → **Track My Order** (Order ID + phone).
