// Exports the demo dataset to CSV files that can be imported straight into
// Google Sheets (File → Import → Upload → "Replace current sheet").
//   npx tsx scripts/export-sheets-csv.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_CATEGORIES, DEMO_INVENTORY, DEMO_PRODUCTS, DEMO_SETTINGS } from "../src/lib/demo-data";

const out = join(process.cwd(), "google-sheets");
mkdirSync(out, { recursive: true });

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (headers: string[], rows: Record<string, unknown>[]) =>
  [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n") + "\n";

const PRODUCT_HEADERS = ["product_id","name","slug","category","subcategory","price","compare_at_price","description","short_description","fabric","fit","care","badge","status","featured","image_1","image_2","image_3","image_4","sizes","colours","tags","created_at","updated_at"];
const CATEGORY_HEADERS = ["category_id","name","slug","description","image","display_order","status"];
const INVENTORY_HEADERS = ["inventory_id","product_id","size","colour","stock","sku","status"];
const ORDER_HEADERS = ["order_id","customer_name","phone","email","address","city","state","pincode","subtotal","shipping","discount","total","payment_status","order_status","whatsapp_order","created_at"];
const ORDER_ITEM_HEADERS = ["order_id","product_id","product_name","size","colour","quantity","unit_price","total"];

// Category images in the demo are local paths; in Google Sheets they must be full URLs.
const SITE = process.env.SITE_URL ?? "https://YOUR-DOMAIN.example";
const categories = DEMO_CATEGORIES.map((c) => ({ ...c, image: c.image.startsWith("/") ? `${SITE}${c.image}` : c.image }));

writeFileSync(join(out, "PRODUCTS.csv"), csv(PRODUCT_HEADERS, DEMO_PRODUCTS as unknown as Record<string, unknown>[]));
writeFileSync(join(out, "CATEGORIES.csv"), csv(CATEGORY_HEADERS, categories));
writeFileSync(join(out, "INVENTORY.csv"), csv(INVENTORY_HEADERS, DEMO_INVENTORY));
writeFileSync(join(out, "ORDERS.csv"), csv(ORDER_HEADERS, []));
writeFileSync(join(out, "ORDER_ITEMS.csv"), csv(ORDER_ITEM_HEADERS, []));
writeFileSync(join(out, "SETTINGS.csv"), csv(["key", "value"], Object.entries(DEMO_SETTINGS).map(([key, value]) => ({ key, value }))));

console.log(`Wrote CSVs to ${out}`);
