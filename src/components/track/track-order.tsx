"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { storeApi } from "@/lib/api-client";
import type { OrderStatusResponse } from "@/lib/types";
import { formatDate, formatINR, isValidIndianPhone } from "@/lib/format";
import { CheckIcon } from "@/components/icons";

const STEPS = ["Confirmed", "Preparing", "Shipped", "Delivered"] as const;

export function TrackOrder() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderStatusResponse | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const id = orderId.trim().toUpperCase();
    if (!/^ZAM-\d{4,6}$/.test(id)) return setError("Order IDs look like ZAM-10482.");
    if (!isValidIndianPhone(phone)) return setError("Enter the 10-digit phone number used on the order.");
    setLoading(true);
    try {
      setResult(await storeApi.track(id, phone));
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't look up that order.");
    } finally {
      setLoading(false);
    }
  };

  const status = result?.order_status;
  const cancelled = status === "Cancelled";
  const currentIdx = status ? (status === "Pending" ? -1 : STEPS.indexOf(status as (typeof STEPS)[number])) : -1;

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <div className="max-w-xl">
        <p className="eyebrow text-gold">Track</p>
        <h1 className="font-serif text-4xl md:text-6xl mt-3">Track My Order</h1>
        <p className="mt-4 text-ash text-sm">Enter your Order ID and the phone number you ordered with. No login needed.</p>

        <form onSubmit={submit} noValidate className="mt-10 space-y-6">
          <div>
            <label htmlFor="track-order-id" className="label">Order ID</label>
            <input id="track-order-id" className="input font-mono tracking-wider uppercase" placeholder="ZAM-10482" value={orderId} onChange={(e) => setOrderId(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="track-phone" className="label">Phone number</label>
            <input id="track-phone" className="input" type="tel" inputMode="numeric" placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </div>
          {error && <p role="alert" className="text-sm text-[#9a3b2e]">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? "Checking…" : "Track order"}
          </button>
        </form>
      </div>

      {result && (
        <section aria-live="polite" className="mt-14 max-w-2xl border border-line bg-white p-6 md:p-10 shadow-soft fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="eyebrow text-ash">Order</p>
              <p className="font-mono text-2xl mt-1 tracking-wider">{result.order_id}</p>
            </div>
            <div className="text-sm text-ash sm:text-right">
              <p>{formatDate(result.created_at)}</p>
              <p>{result.item_count} {result.item_count === 1 ? "item" : "items"} · {formatINR(result.total)}</p>
            </div>
          </div>

          {cancelled ? (
            <div className="mt-8 border border-[#d9b8b1] bg-[#fbf1ef] px-5 py-4">
              <p className="font-semibold text-[#9a3b2e]">Cancelled</p>
              <p className="text-sm text-ash mt-1">This order was cancelled. Message us on WhatsApp if you think this is a mistake.</p>
            </div>
          ) : (
            <ol className="mt-10 relative">
              {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const current = i === currentIdx;
                const pending = status === "Pending" && i === 0;
                return (
                  <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
                    {i < STEPS.length - 1 && <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px ${i < currentIdx ? "bg-ink" : "bg-line"}`} aria-hidden />}
                    <span className={`relative z-10 h-8 w-8 shrink-0 rounded-full border flex items-center justify-center ${done ? "bg-ink border-ink text-cream" : pending ? "border-gold text-gold" : "border-line bg-white text-stone"}`}>
                      {done ? <CheckIcon width={14} height={14} /> : <span className="text-[0.65rem]">{i + 1}</span>}
                    </span>
                    <div className="pt-1">
                      <p className={`text-[0.8rem] uppercase tracking-[0.22em] font-semibold ${done ? "text-ink" : "text-stone"}`}>
                        {step === "Confirmed" ? "Order Confirmed" : step}
                        {done && i === 0 && " ✓"}
                      </p>
                      {current && <p className="text-xs text-gold mt-1">Current status</p>}
                      {pending && <p className="text-xs text-ash mt-1">Received — awaiting confirmation on WhatsApp</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
