"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

interface Props {
  products: Product[];
  onOpen?: (p: Product) => void;
  stockCheck?: (p: Product) => boolean;
}

export function ProductGrid({ products, onOpen, stockCheck }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 md:gap-x-6">
      {products.map((p, i) => (
        <ProductCard key={p.product_id} product={p} onOpen={onOpen} outOfStock={stockCheck ? !stockCheck(p) : false} priority={i < 4} />
      ))}
    </div>
  );
}
