"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, InventoryItem, Product } from "@/lib/types";
import {
  EMPTY_FILTERS, buildStockMap, collectFacets, filterProducts, isFilterActive, productHasStock, sortProducts, type Filters, type SortKey,
} from "@/lib/catalogue";
import { FilterPanel } from "./filter-panel";
import { SortControl } from "./sort-control";
import { ProductGrid } from "./product-grid";
import { ProductDetail } from "@/components/product/product-detail";
import { EmptyState } from "@/components/ui/empty-state";
import { CloseIcon, FilterIcon } from "@/components/icons";

interface Props {
  category: Category | null;
  products: Product[];
  inventory: InventoryItem[];
  title: string;
  description: string;
}

export function CategoryShop({ category, products, inventory, title, description }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<SortKey>("featured");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stock = useMemo(() => buildStockMap(inventory), [inventory]);
  const facets = useMemo(() => collectFacets(products), [products]);
  const visible = useMemo(() => sortProducts(filterProducts(products, filters, stock), sort), [products, filters, stock, sort]);

  // Product detail is URL-driven (?product=slug) so it can be shared and survives refresh.
  const openSlug = searchParams.get("product");
  const openProduct = useMemo(() => (openSlug ? products.find((p) => p.slug === openSlug) ?? null : null), [openSlug, products]);

  const setOpenProduct = useCallback(
    (p: Product | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (p) params.set("product", p.slug);
      else params.delete("product");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const related = useMemo(
    () => (openProduct ? products.filter((p) => p.product_id !== openProduct.product_id && p.category_slug === openProduct.category_slug) : []),
    [openProduct, products],
  );

  const sizeLabel = category?.slug === "shoes" ? "UK Size" : category?.slug === "trousers" ? "Waist" : "Size";

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-gold">{category ? "Category" : "All products"}</p>
        <h1 className="font-serif text-4xl md:text-6xl mt-3 uppercase tracking-[0.04em]">{title}</h1>
        {description && <p className="mt-4 text-ash text-[0.98rem]">{description}</p>}
      </header>

      <div className="mt-10 md:mt-14 flex items-center justify-between gap-4 border-y border-line py-3">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setDrawerOpen(true)} className="lg:hidden inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] font-semibold">
            <FilterIcon width={16} height={16} /> Filter{isFilterActive(filters) ? " •" : ""}
          </button>
          <p className="text-xs text-ash">
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </p>
        </div>
        <SortControl value={sort} onChange={setSort} />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10 xl:gap-16 pt-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">
            <FilterPanel filters={filters} onChange={setFilters} facets={facets} sizeLabel={sizeLabel} />
          </div>
        </aside>

        <section aria-label="Products">
          {products.length === 0 ? (
            <EmptyState
              eyebrow="Coming soon"
              title="Nothing here just yet."
              message="This category is being restocked. Explore the rest of the collection in the meantime."
              action={{ href: "/#collection", label: "Explore Collection" }}
            />
          ) : visible.length === 0 ? (
            <EmptyState title="No products match these filters." message="Try removing a filter or two.">
              <div className="mt-8">
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn-outline">
                  Clear all filters
                </button>
              </div>
            </EmptyState>
          ) : (
            <ProductGrid products={visible} onOpen={setOpenProduct} stockCheck={(p) => productHasStock(p, stock)} />
          )}
        </section>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/45" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-sm bg-cream shadow-lift overflow-y-auto p-6 slide-in-up">
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-2xl">Filters</span>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close" className="p-2 -mr-2">
                <CloseIcon />
              </button>
            </div>
            <FilterPanel filters={filters} onChange={setFilters} facets={facets} sizeLabel={sizeLabel} />
            <div className="sticky bottom-0 mt-10 bg-cream pt-4 border-t border-line">
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
                Show {visible.length} {visible.length === 1 ? "product" : "products"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openProduct && (
        <ProductDetail
          product={openProduct}
          related={related}
          stock={stock}
          onClose={() => setOpenProduct(null)}
          onSwitch={(p) => setOpenProduct(p)}
        />
      )}
    </div>
  );
}
