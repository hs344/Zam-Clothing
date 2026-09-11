import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryShop } from "@/components/shop/category-shop";
import { getInventory, getProducts } from "@/lib/server/store";

export const revalidate = 60;
export const metadata: Metadata = { title: "Shop", description: "Everything ZAM — t-shirts, shirts, shoes and trousers." };

export default async function ShopPage() {
  const [products, inventory] = await Promise.all([getProducts().catch(() => []), getInventory().catch(() => [])]);
  return (
    <Suspense fallback={null}>
      <CategoryShop
        category={null}
        products={products}
        inventory={inventory}
        title="Shop All"
        description="The whole ZAM wardrobe in one place. Everyday pieces, made comfortable."
      />
    </Suspense>
  );
}
