# Google Sheets + Apps Script setup (beginner-friendly)

You'll need a Google account. Total time: about 20 minutes.

---

## 1. Create the spreadsheet

1. Go to <https://sheets.new> — a blank spreadsheet opens.
2. Rename it (top-left) to **ZAM Store**.

## 2. Add the Apps Script

1. In the spreadsheet menu click **Extensions → Apps Script**.
2. Delete everything in the editor.
3. Open `google-apps-script/Code.gs` from this project, copy **all** of it and paste it into the editor.
4. Click the 💾 save icon. Name the project **ZAM Backend**.

## 3. Create the sheets automatically

1. In the editor toolbar choose the function **`setupSheets`** from the dropdown and press **▶ Run**.
2. Google asks for permission the first time: *Review permissions → choose your account → Advanced → Go to ZAM Backend (unsafe) → Allow*. (It's your own script; "unsafe" just means Google hasn't reviewed it.)
3. Go back to the spreadsheet. You now have six tabs with the correct headers:

| Sheet | Purpose |
|---|---|
| `PRODUCTS` | one row per product |
| `CATEGORIES` | the four categories (order + image) |
| `INVENTORY` | one row per size/colour variant with stock |
| `SETTINGS` | shipping, WhatsApp number, etc. |
| `ORDERS` | filled by the website |
| `ORDER_ITEMS` | filled by the website |

### Exact column headers (already created by `setupSheets`)

**PRODUCTS**
`product_id | name | slug | category | subcategory | price | compare_at_price | description | short_description | fabric | fit | care | badge | status | featured | image_1 | image_2 | image_3 | image_4 | sizes | colours | tags | created_at | updated_at`

**CATEGORIES**
`category_id | name | slug | description | image | display_order | status`

**INVENTORY**
`inventory_id | product_id | size | colour | stock | sku | status`

**SETTINGS** (two columns, one setting per row)
`key | value` — keys: `site_name, currency, shipping_fee, free_shipping_threshold, whatsapp_number, whatsapp_enabled, support_email, instagram_url, announcement_text, store_address`

**ORDERS**
`order_id | customer_name | phone | email | address | city | state | pincode | subtotal | shipping | discount | total | payment_status | order_status | whatsapp_order | created_at`

**ORDER_ITEMS**
`order_id | product_id | product_name | size | colour | quantity | unit_price | total`

## 4. Add products (sample data)

Fastest way — import the sample CSVs:

1. Open the `PRODUCTS` tab.
2. **File → Import → Upload** → choose `google-sheets/PRODUCTS.csv`.
3. Import location: **Replace current sheet**. Separator: **Comma**. Untick *Convert text to numbers…* is fine either way. Click **Import data**.
4. Repeat for `CATEGORIES.csv` → `CATEGORIES` tab, and `INVENTORY.csv` → `INVENTORY` tab.

Rules for the PRODUCTS sheet:

* `category` must exactly match a `name` in CATEGORIES (`T-Shirts`, `Shirts`, `Shoes`, `Trousers`).
* `sizes`, `colours`, `tags` are comma-separated in one cell: `S,M,L,XL`.
* `badge` is one of `NEW`, `BESTSELLER`, `LIMITED` or empty.
* `status` = `active` to show, anything else to hide.
* `featured` = `TRUE` to show on the home page.
* `compare_at_price` is optional (shows as a strike-through).

## 5. Add inventory

Each row = one size + colour of one product. If a product has no row in INVENTORY it's treated as available. Stock `0` shows as sold out and cannot be ordered. Stock is reduced automatically when an order is placed (turn off with `DEDUCT_INVENTORY_ON_ORDER = false` in Code.gs).

## 6. Add settings

Open `SETTINGS` and fill the `value` column:

| key | example |
|---|---|
| `shipping_fee` | `79` |
| `free_shipping_threshold` | `1499` (`0` = never free) |
| `whatsapp_number` | `919876543210` — country code + number, digits only |
| `whatsapp_enabled` | `TRUE` |
| `support_email` | `hello@zam.in` |
| `instagram_url` | `https://instagram.com/zam` |
| `store_address` | `Shop 12, MG Road, Bengaluru 560001` (shown in the footer) |
| `announcement_text` | `Free shipping above ₹1,499` (empty hides the bar) |

## 7–8. Backend code

Already done in step 2. If you edit `Code.gs` later you must create a **new deployment version** (step 10) for changes to go live.

## 9. Configure the Spreadsheet ID

Because the script lives *inside* the spreadsheet you can leave `SPREADSHEET_ID = ""`. If you ever move the script to a standalone project, paste the ID from the sheet URL (`https://docs.google.com/spreadsheets/d/**THIS_PART**/edit`).

Optional security: set `API_KEY = "some-long-random-text"` in Code.gs and the same value as `APPS_SCRIPT_API_KEY` in the website's `.env`.

## 10. Deploy as a Web App

1. In the Apps Script editor click **Deploy → New deployment**.
2. Click the ⚙️ next to *Select type* → **Web app**.
3. Description: `v1`. **Execute as: Me**. **Who has access: Anyone**.
4. Click **Deploy**, authorise again if asked, and **copy the Web app URL** (ends in `/exec`).

> Every time you change Code.gs: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

## 11. Configure the website

In the website's `.env` (or your hosting provider's environment variables):

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
APPS_SCRIPT_API_KEY=            # only if you set API_KEY in Code.gs
```

Redeploy / restart the website. That's it — the site now reads and writes Google Sheets. Catalogue data is cached for 60 seconds, so sheet edits appear within a minute.

## 12. Test product retrieval

Open in a browser:

* `https://script.google.com/macros/s/.../exec?action=PING` → `{"ok":true,...}`
* `.../exec?action=GET_PRODUCTS` → your products as JSON
* On the website: `/api/store/products` should return `"source":"sheets"`.

## 13. Test order creation

1. On the site add an item, go to cart → Proceed to Order → fill details → Review → **Order via WhatsApp**.
2. Check the `ORDERS` tab: a new row with `order_status = Pending`, `payment_status = NOT_APPLICABLE`.
3. Check `ORDER_ITEMS`: one row per variant.
4. Check `INVENTORY`: stock reduced.

## 14. Test WhatsApp ordering

With `whatsapp_enabled = TRUE` and a valid `whatsapp_number`, WhatsApp opens with the full message (Order ID, customer, every item with size/colour/qty/price, subtotal, shipping, total). If it doesn't open (pop-up blocked), the confirmation page has an **Order via WhatsApp** button to open it again.

## 15. Test order tracking

Go to `/track-order`, enter the Order ID and the phone number used. Change `order_status` in the sheet (Pending → Confirmed → Preparing → Shipped → Delivered / Cancelled) and refresh — the tracker updates immediately (order lookups are never cached).

---

## Product image URLs

* Any public image URL works (your hosting, Cloudinary, Imgur, Pexels…).
* **Google Drive:** right-click the image → *Share → Anyone with the link*. Paste the share link (`https://drive.google.com/file/d/FILE_ID/view`) — the website converts it to a direct image URL automatically.
* Category images must also be full URLs when in the sheet (e.g. `https://your-site.com/images/category-tshirts.jpg`).

## Deploying the website

Any Node host works (Vercel, Netlify, Railway, a VPS). Set `APPS_SCRIPT_URL` (and optionally `APPS_SCRIPT_API_KEY`, `DATABASE_URL` for demo mode) as environment variables, then `npm run build && npm start`.
