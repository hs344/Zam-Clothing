# ZAM owner guide — running the store from Google Sheets

Everything below is done in the **ZAM Store** spreadsheet. No code, no redeploys. Catalogue changes appear on the site within about a minute; order status changes are instant.

## H. Change products

| To… | Do this in `PRODUCTS` |
|---|---|
| Add a product | Add a new row. Give it a unique `product_id` (e.g. `TS008`), a `name`, the exact `category` name, a `price`, at least `image_1`, `sizes`, `colours`, and `status = active`. Leave `slug` empty to auto-generate it. |
| Hide a product | Set `status` to `inactive` (or anything other than `active`). |
| Change the name / description / fabric / fit / care | Edit the cell. |
| Change images | Replace the URL in `image_1`…`image_4`. `image_1` is the main image, `image_2` shows on hover. |
| Add / remove a badge | Set `badge` to `NEW`, `BESTSELLER`, `LIMITED`, or clear it. |
| Feature on the home page | Set `featured` to `TRUE`. |
| Change available sizes or colours | Edit the comma-separated list, e.g. `S,M,L,XL` / `Black,White`. Add matching rows in `INVENTORY`. |
| Delete a product | Delete the row (or set inactive — safer if old orders reference it). |

## I. Change prices

In `PRODUCTS`, edit `price` (numbers only, no ₹). To show a discount, put the old price in `compare_at_price` — the site shows it struck through with "Save X%". Clear `compare_at_price` to remove the discount look.

Prices in orders are always taken from the sheet at the moment the order is placed, never from the customer's browser.

## J. Change inventory

In `INVENTORY`, every row is one variant: `product_id` + `size` + `colour`.

* Change `stock` to any number. `0` = sold out (greyed-out size, cannot be added to cart).
* Add a row for a new variant; delete or set `status = inactive` to remove one.
* Stock is reduced automatically when an order is placed. If a WhatsApp order is cancelled, add the stock back manually.
* A product with **no** inventory rows is treated as always available.

## K. Change order status

In `ORDERS`, find the row by `order_id` and change `order_status` (the cell has a dropdown):

```
Pending → Confirmed → Preparing → Shipped → Delivered
                                       (or) Cancelled
```

The customer sees this instantly on **Track My Order** (Order ID + phone). `payment_status` stays `NOT_APPLICABLE` because payment is handled on WhatsApp — feel free to add your own notes column to the right; extra columns don't break anything.

## L. Change the WhatsApp number

In `SETTINGS`:

* `whatsapp_number` → country code + number, digits only: `919876543210`
* `whatsapp_enabled` → `TRUE` to enable the "Order via WhatsApp" button, `FALSE` to pause it (orders are still saved and the customer is told you'll contact them).

## Other settings

| key | effect |
|---|---|
| `shipping_fee` | flat shipping charge |
| `free_shipping_threshold` | subtotal at/above which shipping is free (`0` = never) |
| `announcement_text` | thin bar at the very top of the site (empty = hidden) |
| `support_email`, `instagram_url`, `store_address` | footer contact details |

## Categories

In `CATEGORIES` you can rename categories, rewrite the description, change the image URL and reorder with `display_order`. Keep `slug` the same as the URL you want (`t-shirts` → `/shop/t-shirts`). Remember `PRODUCTS.category` must match `CATEGORIES.name` exactly.

## Size guide

Measurements live in `src/lib/size-guide.ts` for now (placeholder values). Ask your developer to update them or to move them into a `SIZE_GUIDE` sheet.

## Home page: showroom images & About Us

* **Showroom sections** use the `image` column of `CATEGORIES` (order = `display_order`: T-Shirts, Shirts, Trousers, Shoes). Portrait showroom photos work best — they are shown full-height on desktop and full-bleed on mobile. In the project the demo files are `public/images/category-tshirts.jpg`, `category-shirts.jpg`, `category-trousers.jpg`, `category-shoes.jpg`.
* **About Us owner frames** are configured in `src/lib/team.ts` (names, roles and photo paths under `public/images/team/`).
