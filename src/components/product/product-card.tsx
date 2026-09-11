"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useStore } from "@/store/store-provider";
import { HeartIcon } from "@/components/icons";

interface Props {
  product: Product;
  /** Where the card should open. Defaults to the product's category page with ?product= */
  href?: string;
  onOpen?: (product: Product) => void;
  outOfStock?: boolean;
  priority?: boolean;
}

export function ProductCard({ product, href, onOpen, outOfStock = false, priority = false }: Props) {
  const { isWishlisted, toggleWishlist, hydrated } = useStore();
  const wished = hydrated && isWishlisted(product.product_id);
  const link = href ?? `/shop/${product.category_slug}?product=${product.slug}`;
  const [img1, img2] = product.images;

  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-2">
        {img1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img1}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${img2 ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone text-xs uppercase tracking-widest">No image</div>
        )}
        {img2 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img2}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 scale-[1.03] transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
          />
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 bg-cream/95 text-ink text-[0.6rem] font-semibold uppercase tracking-[0.22em] px-2.5 py-1.5">
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 text-cream text-[0.62rem] uppercase tracking-[0.22em] text-center py-2">
            Sold out
          </span>
        )}
      </div>
      <div className="pt-3.5">
        <h3 className="text-[0.92rem] font-medium leading-snug">{product.name}</h3>
        <p className="mt-1 text-[0.85rem] text-ash">
          <span className="text-ink">{formatINR(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="ml-2 line-through text-stone">{formatINR(product.compare_at_price)}</span>
          )}
        </p>
      </div>
    </>
  );

  return (
    <div className="group relative">
      {onOpen ? (
        <button type="button" onClick={() => onOpen(product)} className="block w-full text-left" aria-label={`View ${product.name}`}>
          {content}
        </button>
      ) : (
        <Link href={link} className="block" aria-label={`View ${product.name}`}>
          {content}
        </Link>
      )}
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className={`absolute right-2 top-2 h-9 w-9 flex items-center justify-center rounded-full bg-cream/90 backdrop-blur transition-colors ${wished ? "text-gold" : "text-ash hover:text-ink"}`}
      >
        <HeartIcon filled={wished} />
      </button>
    </div>
  );
}
