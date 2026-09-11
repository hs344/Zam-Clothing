import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryShop } from "@/components/shop/category-shop";
import { getCategoryBySlug, getInventory, getProducts } from "@/lib/server/store";

export const revalidate = 60;

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category).catch(() => null);
  return { title: cat ? cat.name : "Shop", description: cat?.description };
}

export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const [allProducts, inventory] = await Promise.all([getProducts().catch(() => []), getInventory().catch(() => [])]);
  const products = allProducts.filter((p) => p.category_slug === category.slug);
  const ids = new Set(products.map((p) => p.product_id));

  return (
    <Suspense fallback={null}>
      <CategoryShop
        category={category}
        products={products}
        inventory={inventory.filter((i) => ids.has(i.product_id))}
        title={category.name}
        description={category.description}
      />
    </Suspense>
  );
}
