// Demo-mode order persistence (local database). Not used once Google Sheets is
// connected — see src/lib/server/store.ts.
import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { demoOrderItems, demoOrders } from "@/db/schema";
import type { CustomerDetails, OrderItemRecord, OrderRecord, OrderStatus, OrderStatusResponse } from "@/lib/types";

interface DemoOrderInput {
  customer: CustomerDetails;
  items: OrderItemRecord[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  requestedOrderId?: string;
}

function generateOrderId(): string {
  // ZAM-10000 .. ZAM-99999 (same format as the Apps Script backend).
  return `ZAM-${Math.floor(10000 + Math.random() * 90000)}`;
}

export async function createDemoOrder(input: DemoOrderInput): Promise<OrderRecord> {
  let orderId = input.requestedOrderId || generateOrderId();
  // Guarantee uniqueness.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.select({ id: demoOrders.id }).from(demoOrders).where(eq(demoOrders.orderId, orderId)).limit(1);
    if (existing.length === 0) break;
    orderId = generateOrderId();
  }
  const c = input.customer;
  const [inserted] = await db
    .insert(demoOrders)
    .values({
      orderId,
      customerName: c.customer_name,
      phone: c.phone,
      email: c.email || null,
      address: c.address,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
      subtotal: input.subtotal,
      shipping: input.shipping,
      discount: input.discount,
      total: input.total,
      paymentStatus: "NOT_APPLICABLE",
      orderStatus: "Pending",
      whatsappOrder: "TRUE",
    })
    .returning({ createdAt: demoOrders.createdAt });
  await db.insert(demoOrderItems).values(
    input.items.map((i) => ({
      orderId,
      productId: i.product_id,
      productName: i.product_name,
      size: i.size,
      colour: i.colour,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      total: i.total,
    })),
  );
  return {
    order_id: orderId,
    customer: c,
    items: input.items,
    subtotal: input.subtotal,
    shipping: input.shipping,
    discount: input.discount,
    total: input.total,
    payment_status: "NOT_APPLICABLE",
    order_status: "Pending",
    created_at: inserted.createdAt.toISOString(),
  };
}

export async function getDemoOrderStatus(orderId: string, phone: string): Promise<OrderStatusResponse | null> {
  const rows = await db
    .select({
      orderId: demoOrders.orderId,
      status: demoOrders.orderStatus,
      createdAt: demoOrders.createdAt,
      total: demoOrders.total,
      itemCount: sql<number>`(select coalesce(sum(${demoOrderItems.quantity}),0) from ${demoOrderItems} where ${demoOrderItems.orderId} = ${demoOrders.orderId})`,
    })
    .from(demoOrders)
    .where(and(eq(demoOrders.orderId, orderId), eq(demoOrders.phone, phone)))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    order_id: r.orderId,
    order_status: r.status as OrderStatus,
    created_at: r.createdAt.toISOString(),
    total: r.total,
    item_count: Number(r.itemCount),
  };
}
