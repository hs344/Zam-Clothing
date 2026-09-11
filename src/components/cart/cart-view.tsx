"use client";

import Link from "next/link";
import { useStore } from "@/store/store-provider";
import { formatINR } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowRight, MinusIcon, PlusIcon } from "@/components/icons";

export function CartView() {
  const { cart, hydrated, updateQuantity, removeFromCart, subtotal, shipping, total, settings } = useStore();

  if (!hydrated) return <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16 text-sm text-ash">Loading your cart…</div>;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
        <p className="eyebrow text-gold">Cart</p>
        <h1 className="font-serif text-4xl md:text-6xl mt-3 mb-12">Your Cart</h1>
        <EmptyState eyebrow="Empty" title="Your cart is waiting for something good." message="Explore the collection and add a few everyday essentials." action={{ href: "/#collection", label: "Continue shopping" }} />
      </div>
    );
  }

  const remainingForFree = settings.free_shipping_threshold > 0 ? settings.free_shipping_threshold - subtotal : 0;

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <p className="eyebrow text-gold">Cart</p>
      <h1 className="font-serif text-4xl md:text-6xl mt-3">Your Cart</h1>

      <div className="mt-10 md:mt-14 grid lg:grid-cols-[1fr_380px] gap-12 xl:gap-20 items-start">
        <ul className="divide-y divide-line border-y border-line">
          {cart.map((item) => (
            <li key={item.key} className="py-6 grid grid-cols-[88px_1fr] md:grid-cols-[110px_1fr_auto] gap-5 md:gap-8 items-start">
              <Link href={`/shop/${item.category_slug}?product=${item.slug}`} className="block aspect-[4/5] bg-cream-2 overflow-hidden">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/shop/${item.category_slug}?product=${item.slug}`} className="font-medium text-[0.95rem] hover:underline underline-offset-4">
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-ash uppercase tracking-[0.16em]">
                  {[item.size && `Size ${item.size}`, item.colour].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1.5 text-sm">{formatINR(item.unit_price)}</p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="inline-flex items-center border border-line">
                    <button type="button" aria-label={`Decrease quantity of ${item.name}`} onClick={() => updateQuantity(item.key, item.quantity - 1)} className="h-10 w-10 flex items-center justify-center hover:bg-cream-2">
                      <MinusIcon width={14} height={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button type="button" aria-label={`Increase quantity of ${item.name}`} onClick={() => updateQuantity(item.key, item.quantity + 1)} className="h-10 w-10 flex items-center justify-center hover:bg-cream-2">
                      <PlusIcon width={14} height={14} />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.key)} className="text-[0.68rem] uppercase tracking-[0.2em] text-ash underline underline-offset-4 hover:text-ink">
                    Remove
                  </button>
                </div>
              </div>
              <p className="hidden md:block text-right font-medium">{formatINR(item.unit_price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <aside className="border border-line bg-white/60 p-6 md:p-8 lg:sticky lg:top-24">
          <p className="eyebrow text-ink">Summary</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ash">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ash">Shipping</dt><dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd></div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-medium"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          {remainingForFree > 0 && (
            <p className="mt-4 text-xs text-ash">Add {formatINR(remainingForFree)} more for free shipping.</p>
          )}
          <Link href="/checkout" className="btn-primary w-full mt-7">
            Proceed to Order <ArrowRight />
          </Link>
          <p className="mt-4 text-xs text-stone leading-relaxed">No online payment. You'll review your order and confirm it with us over WhatsApp.</p>
          <Link href="/shop" className="btn-ghost mt-6">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
