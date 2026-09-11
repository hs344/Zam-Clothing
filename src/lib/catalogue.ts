// Pure product logic: sorting, filtering and variant availability.
import type { InventoryItem, Product } from "./types";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price — Low to High" },
  { value: "price-desc", label: "Price — High to Low" },
  { value: "name-asc", label: "Name — A to Z" },
];

export interface Filters {
  sizes: string[];
  colours: string[];
  priceMin: number | null;
  priceMax: number | null;
  inStockOnly: boolean;
}

export const EMPTY_FILTERS: Filters = { sizes: [], colours: [], priceMin: null, priceMax: null, inStockOnly: false };

export function isFilterActive(f: Filters): boolean {
  return f.sizes.length > 0 || f.colours.length > 0 || f.priceMin !== null || f.priceMax !== null || f.inStockOnly;
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.created_at || "").localeCompare(a.created_at || ""));
  }
}

/** Returns a stock lookup: `product_id|size|colour` → stock */
export function buildStockMap(inventory: InventoryItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const i of inventory) map.set(`${i.product_id}|${i.size}|${i.colour}`, (map.get(`${i.product_id}|${i.size}|${i.colour}`) ?? 0) + i.stock);
  return map;
}

export function variantStock(stock: Map<string, number>, productId: string, size: string, colour: string): number | null {
  const exact = stock.get(`${productId}|${size}|${colour}`);
  if (exact !== undefined) return exact;
  // If inventory isn't tracked at this granularity, treat as available.
  return null;
}

export function productHasStock(product: Product, stock: Map<string, number>): boolean {
  let tracked = false;
  for (const [key, qty] of stock) {
    if (key.startsWith(`${product.product_id}|`)) {
      tracked = true;
      if (qty > 0) return true;
    }
  }
  return !tracked;
}

export function sizeHasStock(product: Product, stock: Map<string, number>, size: string, colour?: string): boolean {
  const colours = colour ? [colour] : product.colours.length ? product.colours : [""];
  let tracked = false;
  for (const c of colours) {
    const qty = stock.get(`${product.product_id}|${size}|${c}`);
    if (qty !== undefined) {
      tracked = true;
      if (qty > 0) return true;
    }
  }
  return !tracked;
}

export function filterProducts(products: Product[], f: Filters, stock: Map<string, number>): Product[] {
  return products.filter((p) => {
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false;
    if (f.colours.length && !p.colours.some((c) => f.colours.includes(c))) return false;
    if (f.priceMin !== null && p.price < f.priceMin) return false;
    if (f.priceMax !== null && p.price > f.priceMax) return false;
    if (f.inStockOnly && !productHasStock(p, stock)) return false;
    return true;
  });
}

export function collectFacets(products: Product[]) {
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => {
    const ai = sizeOrder.indexOf(a), bi = sizeOrder.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return a.localeCompare(b, undefined, { numeric: true });
  });
  const colours = Array.from(new Set(products.flatMap((p) => p.colours))).sort();
  const prices = products.map((p) => p.price);
  return { sizes, colours, minPrice: prices.length ? Math.min(...prices) : 0, maxPrice: prices.length ? Math.max(...prices) : 0 };
}

export const COLOUR_SWATCHES: Record<string, string> = {
  Black: "#1c1b19", White: "#f7f5f0", Grey: "#8d8a83", Beige: "#d6c7ae", Blue: "#37507a",
  Olive: "#6c6b45", Rust: "#a8563a", Navy: "#233355", Brown: "#6b4a34", Green: "#4f6b4e", Cream: "#efe7d8", Sand: "#d9c6a5",
};
