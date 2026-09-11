import { formatINR } from "./format";
import type { OrderRecord, Settings } from "./types";

/** Builds the complete WhatsApp order message from a confirmed order. */
export function buildWhatsAppMessage(order: OrderRecord): string {
  const c = order.customer;
  const lines: string[] = [
    "ZAM CLOTHING",
    `Order ID: ${order.order_id}`,
    "",
    "Customer:",
    c.customer_name,
    c.phone,
    `${c.address}, ${c.city}, ${c.state} - ${c.pincode}`,
    "",
    "Items:",
  ];
  order.items.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.product_name}`);
    if (item.size) lines.push(`Size: ${item.size}`);
    if (item.colour) lines.push(`Colour: ${item.colour}`);
    lines.push(`Qty: ${item.quantity}`);
    lines.push(`Price: ${formatINR(item.unit_price)}`);
    lines.push(`Total: ${formatINR(item.total)}`);
    lines.push("");
  });
  lines.push(`Subtotal: ${formatINR(order.subtotal)}`);
  lines.push(`Shipping: ${order.shipping === 0 ? "Free" : formatINR(order.shipping)}`);
  if (order.discount > 0) lines.push(`Discount: -${formatINR(order.discount)}`);
  lines.push(`Total: ${formatINR(order.total)}`);
  lines.push("");
  lines.push("Please confirm my order. Thank you!");
  return lines.join("\n");
}

export function buildWhatsAppUrl(settings: Pick<Settings, "whatsapp_number">, message: string): string {
  const number = settings.whatsapp_number.replace(/[^\d]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function whatsappReady(settings: Settings | null): boolean {
  return !!settings && settings.whatsapp_enabled && settings.whatsapp_number.length >= 10;
}
