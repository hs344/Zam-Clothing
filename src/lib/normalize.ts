// Converts raw rows (as returned by Google Sheets / Apps Script, where every
// cell may be a string) into strongly typed domain objects.
import type { Badge, Category, InventoryItem, Product, Settings } from "./types";

type Raw = Record<string, unknown>;

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim());
const num = (v: unknown, fallback = 0): number => {
  if (typeof v === "number") return v;
  const n = parseFloat(str(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const bool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  const s = str(v).toLowerCase();
  return s === "true" || s === "yes" || s === "1";
};
const list = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map(str).filter(Boolean)
    : str(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeBadge(v: unknown): Badge {
  const s = str(v).toUpperCase();
  if (s === "NEW" || s === "BESTSELLER" || s === "LIMITED") return s;
  return "";
}

/** Turn a Google Drive share link into a direct image URL the browser can load. */
export function normalizeImageUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  const driveMatch =
    u.match(/drive\.google\.com\/file\/d\/([^/]+)/) ||
    u.match(/drive\.google\.com\/open\?id=([^&]+)/) ||
    u.match(/drive\.google\.com\/uc\?(?:export=view&)?id=([^&]+)/);
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  return u;
}

/**
 * Category artwork is stored in public/images. Older sheet rows may contain
 * either a placeholder domain or the single-extension filename, while the
 * committed assets use the actual `.jpg.jpg` filenames. Resolve those rows
 * to the local public asset so the showroom works consistently on Vercel.
 */
function normalizeCategoryImage(url: string): string {
  const u = normalizeImageUrl(url);
  if (!u) return "";

  const match = u.match(/(?:^|\/)images\/(category-[^/?#]+)(?:[?#].*)?$/i);
  if (!match) return u;

  let filename = match[1];
  if (/\.jpg$/i.test(filename) && !/\.jpg\.jpg$/i.test(filename)) {
    filename += ".jpg";
  }
  return `/images/${filename}`;
}

export function normalizeProduct(raw: Raw): Product {
  const category = str(raw.category);
  const images = [raw.image_1, raw.image_2, raw.image_3, raw.image_4]
    .map((v) => normalizeImageUrl(str(v)))
    .filter(Boolean);
  const compare = num(raw.compare_at_price, 0);
  return {
    product_id: str(raw.product_id),
    name: str(raw.name),
    slug: str(raw.slug) || slugify(str(raw.name)),
    category,
    category_slug: str(raw.category_slug) || slugify(category),
    subcategory: str(raw.subcategory),
    price: num(raw.price),
    compare_at_price: compare > 0 ? compare : null,
    description: str(raw.description),
    short_description: str(raw.short_description),
    fabric: str(raw.fabric),
    fit: str(raw.fit),
    care: str(raw.care),
    badge: normalizeBadge(raw.badge),
    status: str(raw.status).toLowerCase() || "active",
    featured: bool(raw.featured),
    images,
    sizes: list(raw.sizes),
    colours: list(raw.colours),
    tags: list(raw.tags),
    created_at: str(raw.created_at),
    updated_at: str(raw.updated_at),
  };
}

export function normalizeCategory(raw: Raw): Category {
  const name = str(raw.name);
  return {
    category_id: str(raw.category_id),
    name,
    slug: str(raw.slug) || slugify(name),
    description: str(raw.description),
    image: normalizeCategoryImage(str(raw.image)),
    display_order: num(raw.display_order, 999),
    status: str(raw.status).toLowerCase() || "active",
  };
}

export function normalizeInventory(raw: Raw): InventoryItem {
  return {
    inventory_id: str(raw.inventory_id),
    product_id: str(raw.product_id),
    size: str(raw.size),
    colour: str(raw.colour),
    stock: Math.max(0, Math.floor(num(raw.stock))),
    sku: str(raw.sku),
    status: str(raw.status).toLowerCase() || "active",
  };
}

export function normalizeSettings(raw: Raw): Settings {
  return {
    site_name: str(raw.site_name) || "ZAM CLOTHING",
    currency: str(raw.currency) || "INR",
    shipping_fee: num(raw.shipping_fee, 0),
    free_shipping_threshold: num(raw.free_shipping_threshold, 0),
    whatsapp_number: str(raw.whatsapp_number).replace(/[^\d]/g, ""),
    whatsapp_enabled: bool(raw.whatsapp_enabled),
    support_email: str(raw.support_email),
    instagram_url: str(raw.instagram_url),
    announcement_text: str(raw.announcement_text),
    store_address: str(raw.store_address),
  };
}
