// Browser-side helpers that call the Next.js /api/store/* proxy.
import type {
  ApiResponse, CreateOrderRequest, InventoryItem, OrderRecord, OrderStatusResponse, Product, Settings,
} from "./types";

export class StoreApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "StoreApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/store/${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  } catch {
    throw new StoreApiError(
      typeof navigator !== "undefined" && !navigator.onLine
        ? "You appear to be offline. Please check your connection and try again."
        : "We couldn't reach the store right now. Please try again.",
      0,
    );
  }
  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new StoreApiError("Unexpected response from the store.", res.status);
  }
  if (!res.ok || !json.ok) throw new StoreApiError(json.error || "Something went wrong.", res.status);
  return json.data as T;
}

export const storeApi = {
  products: () => request<Product[]>("products"),
  product: (slug: string) => request<Product>(`product?slug=${encodeURIComponent(slug)}`),
  inventory: (productId?: string) => request<InventoryItem[]>(`inventory${productId ? `?product_id=${encodeURIComponent(productId)}` : ""}`),
  settings: () => request<Settings>("settings"),
  search: (q: string) => request<Product[]>(`search?q=${encodeURIComponent(q)}`),
  createOrder: (body: CreateOrderRequest) => request<OrderRecord>("orders", { method: "POST", body: JSON.stringify(body) }),
  track: (orderId: string, phone: string) =>
    request<OrderStatusResponse>(`track?order_id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`),
};
