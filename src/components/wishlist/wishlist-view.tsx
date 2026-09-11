"use client";

import { useEffect, useState } from "react";
import { storeApi } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { useStore } from "@/store/store-provider";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";

export function WishlistView() {
  const { wishlist, hydrated } = useStore();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    storeApi
      .products()
      .then((all) => !cancelled && setProducts(all))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [hydrated, wishlist.length]);

  const items = products ? wishlist.map((id) => products.find((p) => p.product_id === id)).filter((p): p is Product => !!p) : null;

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <p className="eyebrow text-gold">Saved</p>
      <h1 className="font-serif text-4xl md:text-6xl mt-3">Wishlist</h1>
      <div className="mt-12">
        {error ? (
          <EmptyState title="We couldn't load your wishlist." message={error} action={{ href: "/shop", label: "Continue shopping" }} />
        ) : !hydrated || items === null ? (
          <p className="text-sm text-ash">Loading your saved pieces…</p>
        ) : items.length === 0 ? (
          <EmptyState eyebrow="Empty" title="Nothing saved yet." message="Tap the heart on any product to keep it here for later." action={{ href: "/shop", label: "Continue shopping" }} />
        ) : (
          <>
            <p className="text-xs text-ash mb-6">{items.length} {items.length === 1 ? "item" : "items"}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 md:gap-x-6">
              {items.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
