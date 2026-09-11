"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store-provider";
import { storeApi } from "@/lib/api-client";
import type { CustomerDetails, OrderRecord } from "@/lib/types";
import { isValidIndianPhone } from "@/lib/format";
import { buildWhatsAppMessage, buildWhatsAppUrl, whatsappReady } from "@/lib/whatsapp";
import { Invoice } from "./invoice";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, ArrowRight, WhatsAppIcon } from "@/components/icons";

const DETAILS_KEY = "zam.checkout.details";
export const LAST_ORDER_KEY = "zam.lastOrder";

const EMPTY: CustomerDetails = { customer_name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "" };

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Chandigarh", "Andaman & Nicobar Islands", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep",
];

function validate(d: CustomerDetails): Partial<Record<keyof CustomerDetails, string>> {
  const e: Partial<Record<keyof CustomerDetails, string>> = {};
  if (d.customer_name.trim().length < 2) e.customer_name = "Please enter your full name.";
  if (!isValidIndianPhone(d.phone)) e.phone = "Enter a valid 10-digit mobile number.";
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "That email doesn't look right.";
  if (d.address.trim().length < 8) e.address = "Please enter your full address.";
  if (!d.city.trim()) e.city = "City is required.";
  if (!d.state.trim()) e.state = "State is required.";
  if (!/^\d{6}$/.test(d.pincode.trim())) e.pincode = "Enter a 6-digit pincode.";
  return e;
}

function proposeOrderId() {
  return `ZAM-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function CheckoutFlow() {
  const router = useRouter();
  const { cart, hydrated, subtotal, shipping, total, clearCart, settings } = useStore();
  const [step, setStep] = useState<"details" | "review">("details");
  const [details, setDetails] = useState<CustomerDetails>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [touched, setTouched] = useState(false);
  const [proposedId] = useState(proposeOrderId);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DETAILS_KEY);
      if (raw) setDetails({ ...EMPTY, ...(JSON.parse(raw) as CustomerDetails) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details));
    if (touched) setErrors(validate(details));
  }, [details, touched]);

  const invoiceItems = useMemo(
    () => cart.map((i) => ({ product_id: i.product_id, product_name: i.name, size: i.size, colour: i.colour, quantity: i.quantity, unit_price: i.unit_price, total: i.unit_price * i.quantity })),
    [cart],
  );

  if (!hydrated) return <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16 text-sm text-ash">Preparing checkout…</div>;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
        <p className="eyebrow text-gold">Checkout</p>
        <h1 className="font-serif text-4xl md:text-6xl mt-3 mb-12">Order Details</h1>
        <EmptyState eyebrow="Empty cart" title="There's nothing to order yet." message="Add something to your cart first — then come back here." action={{ href: "/#collection", label: "Explore Collection" }} />
      </div>
    );
  }

  const set = (k: keyof CustomerDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  const goReview = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(details);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const placeOrder = async () => {
    setSubmitError(null);
    const errs = validate(details);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStep("details");
      return;
    }
    setSubmitting(true);
    // Open a placeholder tab synchronously (inside the click) so WhatsApp isn't popup-blocked.
    const waWindow = whatsappReady(settings) ? window.open("", "_blank") : null;
    try {
      const order: OrderRecord = await storeApi.createOrder({
        customer: details,
        items: cart.map((i) => ({ product_id: i.product_id, size: i.size, colour: i.colour, quantity: i.quantity })),
        requested_order_id: proposedId,
      });
      window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      let opened = false;
      if (waWindow) {
        try {
          waWindow.location.href = buildWhatsAppUrl(settings, buildWhatsAppMessage(order));
          opened = true;
        } catch {
          waWindow.close();
        }
      }
      clearCart();
      router.push(`/order-confirmation?order=${encodeURIComponent(order.order_id)}${opened ? "&wa=1" : ""}`);
    } catch (err) {
      waWindow?.close();
      setSubmitError(err instanceof Error ? err.message : "We couldn't place your order. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <p className="eyebrow text-gold">Checkout</p>
      <h1 className="font-serif text-4xl md:text-6xl mt-3">{step === "details" ? "Order Details" : "Review & Order"}</h1>

      <ol className="mt-6 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.2em]">
        <li className={step === "details" ? "text-ink font-semibold" : "text-ash"}>1. Details</li>
        <li className="text-line" aria-hidden>—</li>
        <li className={step === "review" ? "text-ink font-semibold" : "text-ash"}>2. Invoice</li>
        <li className="text-line" aria-hidden>—</li>
        <li className="text-ash">3. WhatsApp</li>
      </ol>

      {step === "details" ? (
        <form onSubmit={goReview} noValidate className="mt-10 md:mt-14 grid lg:grid-cols-[1fr_380px] gap-12 xl:gap-20 items-start">
          <div className="space-y-6 max-w-2xl">
            <p className="text-sm text-ash">Guest checkout — no account or password needed. We only use these details to deliver your order.</p>
            <Field id="customer_name" label="Full name" error={errors.customer_name}>
              <input id="customer_name" className="input" autoComplete="name" value={details.customer_name} onChange={set("customer_name")} required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-6">
              <Field id="phone" label="Phone number" error={errors.phone} hint="We'll confirm your order on this number">
                <input id="phone" className="input" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" value={details.phone} onChange={set("phone")} required />
              </Field>
              <Field id="email" label="Email (optional)" error={errors.email}>
                <input id="email" className="input" type="email" autoComplete="email" value={details.email} onChange={set("email")} />
              </Field>
            </div>
            <Field id="address" label="Address" error={errors.address}>
              <textarea id="address" className="input min-h-[96px]" autoComplete="street-address" placeholder="House / flat, street, landmark" value={details.address} onChange={set("address")} required />
            </Field>
            <div className="grid sm:grid-cols-3 gap-6">
              <Field id="city" label="City" error={errors.city}>
                <input id="city" className="input" autoComplete="address-level2" value={details.city} onChange={set("city")} required />
              </Field>
              <Field id="state" label="State" error={errors.state}>
                <select id="state" className="input" autoComplete="address-level1" value={details.state} onChange={set("state")} required>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (<option key={s}>{s}</option>))}
                </select>
              </Field>
              <Field id="pincode" label="Pincode" error={errors.pincode}>
                <input id="pincode" className="input" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={details.pincode} onChange={set("pincode")} required />
              </Field>
            </div>
          </div>

          <aside className="border border-line bg-white/60 p-6 md:p-8 lg:sticky lg:top-24">
            <p className="eyebrow text-ink">Your order</p>
            <ul className="mt-5 space-y-3 text-sm max-h-64 overflow-y-auto pr-1">
              {cart.map((i) => (
                <li key={i.key} className="flex justify-between gap-4">
                  <span className="text-ash">
                    {i.name} <span className="text-stone">× {i.quantity}</span>
                    <br />
                    <span className="text-xs uppercase tracking-[0.14em]">{[i.size, i.colour].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="shrink-0">₹{(i.unit_price * i.quantity).toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 pt-5 border-t border-line space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ash">Subtotal</dt><dd>₹{subtotal.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt className="text-ash">Shipping</dt><dd>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total</dt><dd>₹{total.toLocaleString("en-IN")}</dd></div>
            </dl>
            <button type="submit" className="btn-primary w-full mt-7">
              Review Order <ArrowRight />
            </button>
            <Link href="/cart" className="btn-ghost mt-5"><ArrowLeft width={14} height={14} /> Back to cart</Link>
          </aside>
        </form>
      ) : (
        <div className="mt-10 md:mt-14 grid lg:grid-cols-[1fr_380px] gap-12 xl:gap-20 items-start">
          <Invoice
            provisional
            data={{ order_id: proposedId, customer: details, items: invoiceItems, subtotal, shipping, total }}
          />
          <aside className="border border-line bg-white/60 p-6 md:p-8 lg:sticky lg:top-24">
            <p className="eyebrow text-ink">Place your order</p>
            <p className="mt-4 text-sm text-ash leading-relaxed">
              We'll save this order and open WhatsApp with the full summary pre-filled. Send it to us and we'll confirm availability, payment and delivery with you directly.
            </p>
            {!whatsappReady(settings) && (
              <p className="mt-4 text-xs text-[#7a5a1e] bg-gold-soft/30 border border-gold-soft px-3 py-2 leading-relaxed">
                WhatsApp ordering isn't switched on yet. Your order will still be saved and we'll contact you on your phone number.
              </p>
            )}
            {submitError && <p role="alert" className="mt-4 text-sm text-[#9a3b2e]">{submitError}</p>}
            <button type="button" onClick={placeOrder} disabled={submitting} className="btn-primary w-full mt-6 !bg-[#1f7a4d] hover:!bg-[#196540] text-base py-5">
              <WhatsAppIcon /> {submitting ? "Saving order…" : "Order via WhatsApp"} <ArrowRight />
            </button>
            <button type="button" onClick={() => setStep("details")} className="btn-ghost mt-5"><ArrowLeft width={14} height={14} /> Edit details</button>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-[#9a3b2e]" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-xs text-stone">{hint}</p> : null}
    </div>
  );
}
