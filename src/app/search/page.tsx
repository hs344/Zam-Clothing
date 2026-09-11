import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/server/store";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchForm } from "@/components/shop/search-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  let results: Awaited<ReturnType<typeof searchProducts>> = [];
  let failed = false;
  if (query) {
    try {
      results = await searchProducts(query);
    } catch {
      failed = true;
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <p className="eyebrow text-gold">Search</p>
      <h1 className="font-serif text-4xl md:text-6xl mt-3">{query ? <>Results for “{query}”</> : "What are you looking for?"}</h1>
      <div className="mt-8 max-w-xl">
        <SearchForm initial={query} />
      </div>

      <div className="mt-12">
        {failed ? (
          <EmptyState title="Search is taking a break." message="We couldn't reach the store right now. Please try again in a moment." action={{ href: "/shop", label: "Browse the shop" }} />
        ) : !query ? (
          <p className="text-ash text-sm">
            Try a product name, a category like <Link href="/search?q=shirts" className="underline">shirts</Link>, or a tag like{" "}
            <Link href="/search?q=linen" className="underline">linen</Link>.
          </p>
        ) : results.length === 0 ? (
          <EmptyState eyebrow="No products found" title={`Nothing matched “${query}”.`} message="Check the spelling or try a broader word — for example “tee”, “black” or “sneakers”." action={{ href: "/shop", label: "Browse all products" }} secondary={{ href: "/search", label: "Search again" }} />
        ) : (
          <>
            <p className="text-xs text-ash mb-6">{results.length} {results.length === 1 ? "product" : "products"}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 md:gap-x-6">
              {results.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
