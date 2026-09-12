// ---------------------------------------------------------------------------
// STORE DATA FACADE (server-side)
//
//   Google Sheets  →  Google Apps Script  →  this file  →  pages / API routes
//
// When APPS_SCRIPT_URL is set every function below reads from / writes to the
// spreadsheet through Apps Script. When it is not set, the demo dataset is
// served and demo-mode orders are stored in the local database so the whole
// journey can still be exercised.
// ---------------------------------------------------------------------------
import "server-only";
import { SHEETS_CONNECTED, FALLBACK_WHATSAPP_ENABLED, FALLBACK_WHATSAPP_NUMBER } from "@/lib/config";
import { DEMO_CATEGORIES, DEMO_INVENTORY, DEMO_PRODUCTS, DEMO_SETTINGS } from "@/lib/demo-data";
import { normalizeCategory, normalizeInventory, normalizeProduct, normalizeSettings } from "@/lib/normalize";
import type {
  Category, CreateOrderRequest, InventoryItem, OrderRecord, OrderStatusResponse, Product, Settings,
} from "@/lib/types";
import { AppsScriptError, scriptGet, scriptPost } from "./apps-script";
import { computeShipping, normalizePhone } from "@/lib/format";

export { AppsScriptError };
export const dataSource = SHEETS_CONNECTED ? "sheets" : "demo";

type Raw = Record<string, unknown>;

// ----------------------------------------------------------------- catalogue
export async function getProducts(): Promise<Product[]> {
  const rows = SHEETS_CONNECTED ? await scriptGet<Raw[]>("GET_PRODUCTS") : (DEMO_PRODUCTS as unknown as Raw[]);
  return rows.map(normalizeProduct).filter((p) => p.status === "active" && p.product_id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug || p.product_id === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const rows = SHEETS_CONNECTED ? await scriptGet<Raw[]>("GET_CATEGORIES") : (DEMO_CATEGORIES as unknown as Raw[]);
  return rows
    .map(normalizeCategory)
    .filter((c) => c.status === "active")
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getInventory(productId?: string): Promise<InventoryItem[]> {
  const rows = SHEETS_CONNECTED
    ? await scriptGet<Raw[]>("GET_INVENTORY", productId ? { product_id: productId } : {}, 30)
    : (DEMO_INVENTORY as unknown as Raw[]);
  return rows
    .map(normalizeInventory)
    .filter((i) => i.status === "active" && (!productId || i.product_id === productId));
}

export async function getSettings(): Promise<Settings> {
  const raw = SHEETS_CONNECTED ? await scriptGet<Raw>("GET_SETTINGS") : (DEMO_SETTINGS as unknown as Raw);
  const settings = normalizeSettings(raw);
  if (!settings.whatsapp_number && FALLBACK_WHATSAPP_NUMBER) {
    settings.whatsapp_number = FALLBACK_WHATSAPP_NUMBER.replace(/[^\d]/g, "");
    settings.whatsapp_enabled = FALLBACK_WHATSAPP_ENABLED;
  }
  return settings;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await getProducts();
  const terms = q.split(/\s+/).filter(Boolean);
  return all.filter((p) => {
    const haystack = [p.name, p.category, p.subcategory, p.short_description, ...p.tags, ...p.colours]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

// -------------------------------------------------------------------- orders
export async function createOrder(req: CreateOrderRequest): Promise<OrderRecord> {
  if (SHEETS_CONNECTED) {
    return scriptPost<OrderRecord>("CREATE_ORDER", { customer: req.customer, items: req.items, requested_order_id: req.requested_order_id });
  }
  // Demo mode: recalculate everything server-side from the demo catalogue,
const { createDemoOrder } = await import("./demo-orders"); 
 // exactly as the Apps Script backend does from the sheet.
  const [products, inventory, settings] = await Promise.all([getProducts(), getInventory(), getSettings()]);
  const items = req.items.map((item) => {
    const product = products.find((p) => p.product_id === item.product_id);
    if (!product) throw new AppsScriptError(`One of the products in your cart is no longer available.`, 400);
    const needsSize = product.sizes.length > 0;
    const needsColour = product.colours.length > 0;
    if (needsSize && !product.sizes.includes(item.size)) throw new AppsScriptError(`Please choose a valid size for ${product.name}.`, 400);
    if (needsColour && !product.colours.includes(item.colour)) throw new AppsScriptError(`Please choose a valid colour for ${product.name}.`, 400);
    const inv = inventory.find(
      (i) => i.product_id === item.product_id && (!needsSize || i.size === item.size) && (!needsColour || i.colour === item.colour),
    );
    if (inv && inv.stock < item.quantity) {
      throw new AppsScriptError(`${product.name} (${[item.size, item.colour].filter(Boolean).join(" / ")}) has only ${inv.stock} left.`, 400);
    }
    const quantity = Math.max(1, Math.floor(item.quantity));
    return {
      product_id: product.product_id,
      product_name: product.name,
      size: item.size,

      colour: item.colour,
      quantity,
      unit_price: product.price,
      total: product.price * quantity,
    };
  });
  if (items.length === 0) throw new AppsScriptError("Your cart is empty.", 400);
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const shipping = computeShipping(subtotal, settings.shipping_fee, settings.free_shipping_threshold);
  return createDemoOrder({
    customer: { ...req.customer, phone: normalizePhone(req.customer.phone) },
    items,
    subtotal,
    shipping,
    discount: 0,
    total: subtotal + shipping,
    requestedOrderId: req.requested_order_id,
  });
}

export async function getOrderStatus(orderId: string, phone: string): Promise<OrderStatusResponse | null> {
  const id = orderId.trim().toUpperCase();
  const digits = normalizePhone(phone);
  if (SHEETS_CONNECTED) {
    return scriptGet<OrderStatusResponse | null>("GET_ORDER_STATUS", { order_id: id, phone: digits }, false);
  }
 const { getDemoOrderStatus } = await import("./demo-orders");
return getDemoOrderStatus(id, digits);
}
