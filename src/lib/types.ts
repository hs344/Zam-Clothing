// Shared domain types. These mirror the Google Sheets structure 1:1 so the
// owner can reason about the website purely in terms of the spreadsheet.

export type Badge = "NEW" | "BESTSELLER" | "LIMITED" | "";

export interface Product {
  product_id: string;
  name: string;
  slug: string;
  category: string; // e.g. "T-Shirts"
  category_slug: string; // e.g. "t-shirts"
  subcategory: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  short_description: string;
  fabric: string;
  fit: string;
  care: string;
  badge: Badge;
  status: "active" | "inactive" | string;
  featured: boolean;
  images: string[];
  sizes: string[];
  colours: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  display_order: number;
  status: string;
}

export interface InventoryItem {
  inventory_id: string;
  product_id: string;
  size: string;
  colour: string;
  stock: number;
  sku: string;
  status: string;
}

export interface Settings {
  site_name: string;
  currency: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  support_email: string;
  instagram_url: string;
  announcement_text: string;
  store_address: string;
}

export interface CartItem {
  key: string; // product_id|size|colour
  product_id: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  colour: string;
  quantity: number;
  unit_price: number;
  category_slug: string;
}

export interface CustomerDetails {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemInput {
  product_id: string;
  size: string;
  colour: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customer: CustomerDetails;
  items: OrderItemInput[];
  /** Proposed ID shown on the invoice; the backend keeps it if unique, otherwise issues a new one. */
  requested_order_id?: string;
}

export interface OrderItemRecord {
  product_id: string;
  product_name: string;
  size: string;
  colour: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrderRecord {
  order_id: string;
  customer: CustomerDetails;
  items: OrderItemRecord[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: string;
  order_status: OrderStatus;
  created_at: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export interface OrderStatusResponse {
  order_id: string;
  order_status: OrderStatus;
  created_at: string;
  total: number;
  item_count: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  source?: "sheets" | "demo";
}
