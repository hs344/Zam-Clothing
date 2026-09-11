import { formatINR, formatDate } from "@/lib/format";
import type { CustomerDetails, OrderItemRecord } from "@/lib/types";

export interface InvoiceData {
  order_id: string;
  created_at?: string;
  customer: CustomerDetails;
  items: OrderItemRecord[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  status?: string;
}

/** Clean digital invoice used on the checkout review step and the confirmation page. */
export function Invoice({ data, provisional = false }: { data: InvoiceData; provisional?: boolean }) {
  const c = data.customer;
  return (
    <article className="bg-white border border-line shadow-soft" aria-label="Order summary">
      <header className="px-6 md:px-10 py-8 border-b border-line flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="font-semibold tracking-[0.3em] text-[0.8rem] uppercase">ZAM Clothing</p>
          <h2 className="font-serif text-3xl md:text-4xl mt-2">Order Summary</h2>
        </div>
        <dl className="text-sm md:text-right">
          <dt className="eyebrow text-ash">Order ID</dt>
          <dd className="font-mono text-lg mt-1 tracking-wider">{data.order_id}</dd>
          {provisional && <dd className="text-[0.68rem] text-stone mt-1">Confirmed when you place the order</dd>}
          {data.created_at && <dd className="text-xs text-ash mt-1">{formatDate(data.created_at)}</dd>}
        </dl>
      </header>

      <div className="px-6 md:px-10 py-6">
        <p className="eyebrow text-ash mb-4">Items</p>
        <ul className="divide-y divide-line">
          {data.items.map((item, i) => (
            <li key={`${item.product_id}-${item.size}-${item.colour}-${i}`} className="py-5 grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-3 text-sm">
              <div className="col-span-2 md:col-span-4">
                <p className="eyebrow text-stone">Product</p>
                <p className="mt-1 font-medium">{item.product_name}</p>
              </div>
              <Field label="Size" value={item.size || "—"} className="md:col-span-2" />
              <Field label="Colour" value={item.colour || "—"} className="md:col-span-2" />
              <Field label="Quantity" value={String(item.quantity)} className="md:col-span-1" />
              <Field label="Unit price" value={formatINR(item.unit_price)} className="md:col-span-1" />
              <Field label="Total" value={formatINR(item.total)} className="md:col-span-2 md:text-right font-medium" />
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 md:px-10 py-6 border-t border-line grid md:grid-cols-2 gap-10">
        <div>
          <p className="eyebrow text-ash mb-4">Deliver to</p>
          <address className="not-italic text-sm leading-relaxed">
            <span className="font-medium">{c.customer_name}</span>
            <br />
            {c.phone}
            {c.email && (<><br />{c.email}</>)}
            <br />
            {c.address}
            <br />
            {c.city}, {c.state} — {c.pincode}
          </address>
        </div>
        <dl className="text-sm space-y-2.5 md:justify-self-end md:min-w-[280px]">
          <div className="flex justify-between"><dt className="text-ash">Subtotal</dt><dd>{formatINR(data.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ash">Shipping</dt><dd>{data.shipping === 0 ? "Free" : formatINR(data.shipping)}</dd></div>
          {!!data.discount && data.discount > 0 && (
            <div className="flex justify-between"><dt className="text-ash">Discount</dt><dd>−{formatINR(data.discount)}</dd></div>
          )}
          <div className="flex justify-between border-t border-ink pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(data.total)}</dd></div>
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-stone pt-1">Payment: arranged over WhatsApp</p>
        </dl>
      </div>
    </article>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow text-stone">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
