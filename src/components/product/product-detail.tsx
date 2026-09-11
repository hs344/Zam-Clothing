"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { COLOUR_SWATCHES, sizeHasStock, variantStock } from "@/lib/catalogue";
import { formatINR } from "@/lib/format";
import { sizeGuideKindFor } from "@/lib/size-guide";
import { useStore } from "@/store/store-provider";
import { SizeGuide } from "./size-guide";
import { ProductCard } from "./product-card";
import { CloseIcon, HeartIcon, MinusIcon, PlusIcon } from "@/components/icons";

interface Props {
  product: Product;
  related: Product[];
  stock: Map<string, number>;
  onClose: () => void;
  onSwitch: (p: Product) => void;
}

export function ProductDetail({ product, related, stock, onClose, onSwitch }: Props) {
  const { addToCart, isWishlisted, toggleWishlist, settings, hydrated } = useStore();
  const [imageIdx, setImageIdx] = useState(0);
  const [colour, setColour] = useState<string>(product.colours[0] ?? "");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [open, setOpen] = useState<string>("description");

  // Reset state whenever the product changes.
  useEffect(() => {
    setImageIdx(0);
    setColour(product.colours[0] ?? "");
    setSize("");
    setQty(1);
    setError(null);
  }, [product.product_id, product.colours]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !guideOpen && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, guideOpen]);

  const needsSize = product.sizes.length > 0;
  const needsColour = product.colours.length > 0;
  const selectedStock = useMemo(
    () => (needsSize && !size ? null : variantStock(stock, product.product_id, size, colour)),
    [stock, product.product_id, size, colour, needsSize],
  );
  const anyStockForColour = useMemo(
    () => (needsSize ? product.sizes.some((s) => sizeHasStock(product, stock, s, colour || undefined)) : (variantStock(stock, product.product_id, "", colour) ?? 1) > 0),
    [product, stock, colour, needsSize],
  );
  const wished = hydrated && isWishlisted(product.product_id);

  const handleAdd = () => {
    if (needsSize && !size) return setError("Please select a size.");
    if (needsColour && !colour) return setError("Please select a colour.");
    if (selectedStock !== null && selectedStock <= 0) return setError("This variant is currently sold out.");
    if (selectedStock !== null && qty > selectedStock) return setError(`Only ${selectedStock} left in this size.`);
    setError(null);
    addToCart(product, size, colour, qty);
  };

  const freeShip = settings.free_shipping_threshold > 0;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="pd-title">
      <button type="button" aria-label="Close product details" className="absolute inset-0 bg-ink/45 backdrop-blur-[1px] fade-in" onClick={onClose} />
      <div className="relative h-full w-full md:w-[min(1080px,94vw)] bg-cream shadow-lift slide-in-right overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="fixed md:absolute right-4 top-4 z-10 h-11 w-11 flex items-center justify-center bg-cream/90 backdrop-blur border border-line hover:bg-ink hover:text-cream transition-colors"
        >
          <CloseIcon />
        </button>

        <div className="grid md:grid-cols-12 md:min-h-full">
          {/* Gallery */}
          <div className="md:col-span-6 lg:col-span-7 bg-cream-2">
            <div className="relative aspect-[4/5] md:aspect-auto md:h-[min(80vh,900px)] md:sticky md:top-0">
              {product.images[imageIdx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={product.images[imageIdx]} src={product.images[imageIdx]} alt={`${product.name} — view ${imageIdx + 1}`} className="absolute inset-0 h-full w-full object-cover fade-in" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone text-xs uppercase tracking-widest">No image</div>
              )}
              {product.badge && (
                <span className="absolute left-4 top-4 bg-cream/95 text-ink text-[0.6rem] font-semibold uppercase tracking-[0.22em] px-2.5 py-1.5">{product.badge}</span>
              )}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {product.images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setImageIdx(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === imageIdx}
                      className={`h-16 w-12 overflow-hidden border-2 transition-colors ${i === imageIdx ? "border-ink" : "border-cream/70"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-6 lg:col-span-5 px-6 py-8 md:px-10 md:py-14">
            <p className="eyebrow text-gold">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ""}</p>
            <h2 id="pd-title" className="font-serif text-3xl md:text-4xl mt-3 leading-tight">{product.name}</h2>
            <p className="mt-3 text-lg">
              {formatINR(product.price)}
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="ml-3 text-stone line-through text-base">{formatINR(product.compare_at_price)}</span>
                  <span className="ml-3 text-gold text-xs uppercase tracking-[0.2em]">
                    Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                  </span>
                </>
              )}
            </p>
            {product.short_description && <p className="mt-4 text-ash text-[0.95rem]">{product.short_description}</p>}

            {needsColour && (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="label mb-0">Colour</span>
                  <span className="text-xs text-ash">{colour}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {product.colours.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      aria-pressed={c === colour}
                      onClick={() => { setColour(c); setSize(""); setError(null); }}
                      className={`h-9 w-9 rounded-full border-2 p-0.5 transition-colors ${c === colour ? "border-ink" : "border-line hover:border-stone"}`}
                    >
                      <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: COLOUR_SWATCHES[c] ?? "#cfc7b8" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsSize && (
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <span className="label mb-0">Size</span>
                  <button type="button" onClick={() => setGuideOpen(true)} className="text-[0.68rem] uppercase tracking-[0.2em] underline underline-offset-4 text-ash hover:text-ink">
                    Size guide
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="Size">
                  {product.sizes.map((s) => {
                    const available = sizeHasStock(product, stock, s, colour || undefined);
                    const on = s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={!available}
                        onClick={() => { setSize(s); setError(null); }}
                        className={`relative h-11 text-xs border transition-colors ${on ? "border-ink bg-ink text-cream" : "border-line hover:border-ink"} disabled:cursor-not-allowed disabled:text-stone disabled:hover:border-line disabled:bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgba(0,0,0,0.05)_6px_7px)]`}
                        title={available ? s : `${s} — sold out`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-ash" aria-live="polite">
                  {!size
                    ? anyStockForColour ? "Select a size to check availability." : "This colour is currently sold out."
                    : selectedStock === null
                      ? "In stock"
                      : selectedStock <= 0
                        ? "Sold out in this size"
                        : selectedStock <= 5
                          ? `Only ${selectedStock} left`
                          : "In stock"}
                </p>
              </div>
            )}

            <div className="mt-7 flex items-stretch gap-3">
              <div className="flex items-center border border-line">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-11 flex items-center justify-center hover:bg-cream-2">
                  <MinusIcon width={16} height={16} />
                </button>
                <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))} className="h-12 w-11 flex items-center justify-center hover:bg-cream-2">
                  <PlusIcon width={16} height={16} />
                </button>
              </div>
              <button type="button" onClick={handleAdd} className="btn-primary flex-1 h-12 py-0">
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-pressed={wished}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className={`h-12 w-12 border flex items-center justify-center transition-colors ${wished ? "border-gold text-gold" : "border-line hover:border-ink"}`}
              >
                <HeartIcon filled={wished} />
              </button>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-[#9a3b2e]">{error}</p>}

            <div className="mt-10 border-t border-line">
              <Accordion id="description" title="Description" open={open} setOpen={setOpen}>
                <p>{product.description || product.short_description}</p>
              </Accordion>
              <Accordion id="details" title="Fabric, Fit & Care" open={open} setOpen={setOpen}>
                <dl className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">
                  {product.fabric && (<><dt className="text-ash">Fabric</dt><dd>{product.fabric}</dd></>)}
                  {product.fit && (<><dt className="text-ash">Fit</dt><dd>{product.fit}</dd></>)}
                  {product.care && (<><dt className="text-ash">Care</dt><dd>{product.care}</dd></>)}
                </dl>
              </Accordion>
              <Accordion id="shipping" title="Shipping & Returns" open={open} setOpen={setOpen}>
                <p>
                  Shipping is {settings.shipping_fee > 0 ? formatINR(settings.shipping_fee) : "free"} across India
                  {freeShip && settings.shipping_fee > 0 ? `, and free on orders above ${formatINR(settings.free_shipping_threshold)}` : ""}. Orders are confirmed over WhatsApp and dispatched within 2–4 working days.
                </p>
                <p className="mt-2">Easy 7-day exchange on unworn items with tags intact. Message us on WhatsApp with your Order ID to start an exchange.</p>
              </Accordion>
            </div>

            {related.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow text-ash mb-5">You may also like</p>
                <div className="grid grid-cols-2 gap-4">
                  {related.slice(0, 4).map((p) => (
                    <ProductCard key={p.product_id} product={p} onOpen={onSwitch} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {guideOpen && <SizeGuide kind={sizeGuideKindFor(product.category_slug)} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

function Accordion({ id, title, open, setOpen, children }: { id: string; title: string; open: string; setOpen: (v: string) => void; children: React.ReactNode }) {
  const isOpen = open === id;
  return (
    <div className="border-b border-line">
      <button type="button" aria-expanded={isOpen} aria-controls={`acc-${id}`} onClick={() => setOpen(isOpen ? "" : id)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em]">{title}</span>
        <span className="text-ash text-lg leading-none" aria-hidden>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div id={`acc-${id}`} className="pb-5 text-[0.92rem] text-ash leading-relaxed fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
