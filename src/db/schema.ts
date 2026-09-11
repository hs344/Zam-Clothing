// ---------------------------------------------------------------------------
// DEMO-MODE ONLY TABLES
//
// Google Sheets (via Google Apps Script) is the real backend for ZAM.
// These tables are used ONLY when APPS_SCRIPT_URL is not configured yet, so
// that the full order + tracking journey can be exercised in a local preview.
// Once the Apps Script URL is set, orders go straight to the ORDERS and
// ORDER_ITEMS sheets and these tables are not touched.
// ---------------------------------------------------------------------------
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const demoOrders = pgTable("demo_orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  paymentStatus: text("payment_status").notNull().default("NOT_APPLICABLE"),
  orderStatus: text("order_status").notNull().default("Pending"),
  whatsappOrder: text("whatsapp_order").notNull().default("TRUE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const demoOrderItems = pgTable("demo_order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  size: text("size").notNull().default(""),
  colour: text("colour").notNull().default(""),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  total: integer("total").notNull(),
});
