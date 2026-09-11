"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { OrderRecord } from "@/lib/types";
import { useStore } from "@/store/store-provider";
import { buildWhatsAppMessage, buildWhatsAppUrl, whatsappReady } from "@/lib/whatsapp";
import { Invoice } from "./invoice";
import { LAST_ORDER_KEY } from "./checkout-flow";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowRight, CheckIcon, WhatsAppIcon } from "@/components/icons";

export function OrderConfirmation() {
  const params = useSearchParams();
  const { settings } = useStore();
  const orderId = params.get("order") ?? "";
  const alreadyOpened = params.get("wa") === "1";
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OrderRecord;
        if (!orderId || parsed.order_id === orderId) setOrder(parsed);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [orderId]);

  if (!ready) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
        <EmptyState
          eyebrow="Order received"
          title={orderId ? `Order ${orderId} has been received.` : "Order received."}
          message="Thank you for shopping with ZAM. You can track this order any time using your Order ID and phone number."
          action={{ href: "/track-order", label: "Track my order" }}
          secondary={{ href: "/shop", label: "Continue shopping" }}
        />
      </div>
    );
  }

  const waUrl = whatsappReady(settings) ? buildWhatsAppUrl(settings, buildWhatsAppMessage(order)) : null;
  const message = buildWhatsAppMessage(order);

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <div className="max-w-2xl">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream"><CheckIcon /></span>
        <p className="eyebrow text-gold mt-6">Order received</p>
        <h1 className="font-serif text-4xl md:text-6xl mt-3">Thank you for shopping with ZAM.</h1>
        <p className="mt-4 text-ash">
          Your order ID is <span className="font-mono text-ink tracking-wider">{order.order_id}</span>. Keep it handy — you'll need it (with your phone number) to track the order.
        </p>
      </div>

      <div className="mt-10 md:mt-14 grid lg:grid-cols-[1fr_380px] gap-12 xl:gap-20 items-start">
        <Invoice data={order} />
        <aside className="border border-line bg-white/60 p-6 md:p-8 lg:sticky lg:top-24 space-y-4">
          <p className="eyebrow text-ink">Next step</p>
          {waUrl ? (
            <>
              <p className="text-sm text-ash leading-relaxed">
                {alreadyOpened ? "WhatsApp should have opened with your order. If it didn't, or you closed it, tap below to open it again." : "Send us your order on WhatsApp so we can confirm it with you."}
              </p>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary w-full !bg-[#1f7a4d] hover:!bg-[#196540] text-base py-5">
                <WhatsAppIcon /> Order via WhatsApp <ArrowRight />
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-ash leading-relaxed">
                WhatsApp ordering isn't switched on for this store yet. Your order has been saved and we'll reach out on <span className="text-ink">{order.customer.phone}</span>. You can also copy the summary below and send it to us.
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(message).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                className="btn-outline w-full"
              >
                {copied ? "Copied" : "Copy order summary"}
              </button>
            </>
          )}
          <Link href={`/track-order?order=${encodeURIComponent(order.order_id)}`} className="btn-outline w-full">
            Track my order
          </Link>
          <Link href="/shop" className="btn-ghost">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
