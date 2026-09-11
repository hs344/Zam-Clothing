// Thin API layer used by client components. It proxies to Google Apps Script
// (or demo data) through src/lib/server/store.ts so nothing private reaches
// the browser.
import { NextRequest, NextResponse } from "next/server";
import {
  AppsScriptError,
  createOrder,
  dataSource,
  getCategories,
  getInventory,
  getOrderStatus,
  getProductBySlug,
  getProducts,
  getSettings,
  searchProducts,
} from "@/lib/server/store";
import type { CreateOrderRequest } from "@/lib/types";
import { isValidIndianPhone } from "@/lib/format";

export const dynamic = "force-dynamic";

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data, source: dataSource });
}
function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message, source: dataSource }, { status });
}
function handleError(err: unknown) {
  if (err instanceof AppsScriptError) return fail(err.message, err.status);
  console.error("[store api]", err);
  return fail("Something went wrong on our side. Please try again in a moment.", 500);
}

type Ctx = { params: Promise<{ action: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  try {
    switch (action) {
      case "products":
        return ok(await getProducts());
      case "product": {
        const slug = sp.get("slug") ?? "";
        const product = await getProductBySlug(slug);
        return product ? ok(product) : fail("Product not found.", 404);
      }
      case "categories":
        return ok(await getCategories());
      case "settings":
        return ok(await getSettings());
      case "inventory":
        return ok(await getInventory(sp.get("product_id") ?? undefined));
      case "search":
        return ok(await searchProducts(sp.get("q") ?? ""));
      case "track": {
        const orderId = (sp.get("order_id") ?? "").trim();
        const phone = (sp.get("phone") ?? "").trim();
        if (!orderId || !phone) return fail("Please enter both your Order ID and phone number.");
        const status = await getOrderStatus(orderId, phone);
        if (!status) return fail("We couldn't find an order with that Order ID and phone number.", 404);
        return ok(status);
      }
      default:
        return fail("Unknown action.", 404);
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  if (action !== "orders") return fail("Unknown action.", 404);
  let body: CreateOrderRequest;
  try {
    body = (await req.json()) as CreateOrderRequest;
  } catch {
    return fail("Invalid order data.");
  }
  const c = body?.customer;
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!c) return fail("Customer details are missing.");
  const required: (keyof typeof c)[] = ["customer_name", "phone", "address", "city", "state", "pincode"];
  for (const key of required) {
    if (!String(c[key] ?? "").trim()) return fail(`Please fill in your ${key.replace("customer_", "").replace("_", " ")}.`);
  }
  if (!isValidIndianPhone(c.phone)) return fail("Please enter a valid 10-digit phone number.");
  if (!/^\d{6}$/.test(String(c.pincode).trim())) return fail("Please enter a valid 6-digit pincode.");
  if (items.length === 0) return fail("Your cart is empty.");
  for (const item of items) {
    if (!item.product_id || !Number.isFinite(item.quantity) || item.quantity < 1) return fail("Invalid order item.");
  }
  try {
    const order = await createOrder({
      customer: {
        customer_name: c.customer_name.trim(),
        phone: c.phone.trim(),
        email: (c.email ?? "").trim(),
        address: c.address.trim(),
        city: c.city.trim(),
        state: c.state.trim(),
        pincode: String(c.pincode).trim(),
      },
      items: items.map((i) => ({
        product_id: String(i.product_id),
        size: String(i.size ?? ""),
        colour: String(i.colour ?? ""),
        quantity: Math.floor(Number(i.quantity)),
      })),
      requested_order_id: /^ZAM-\d{5}$/.test(String(body.requested_order_id ?? "")) ? String(body.requested_order_id) : undefined,
    });
    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}
