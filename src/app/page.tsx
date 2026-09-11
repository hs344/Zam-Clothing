import { Hero } from "@/components/home/hero";
import { Showroom } from "@/components/home/showroom";
import { AboutUs } from "@/components/home/about-us";
import { getCategories } from "@/lib/server/store";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await getCategories().catch(() => []);

  return (
    <>
      {/* 1. Landing / storefront (vertical) */}
      <Hero />

      {/* 2. Full-screen showroom — pins, then moves horizontally through the categories */}
      <Showroom categories={categories} />

      {/* 3. Why ZAM (vertical) */}
      <section id="why-zam" aria-labelledby="why-heading" className="mx-auto max-w-[1440px] px-5 md:px-10 pt-20 md:pt-28">
        <div className="grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <p className="eyebrow text-gold">Why ZAM</p>
            <h2 id="why-heading" className="font-serif text-3xl md:text-5xl mt-4 leading-[1.1]">
              Comfy on you. Easy on your pocket.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 grid sm:grid-cols-3 gap-8 text-[0.92rem] text-ash">
            <div>
              <p className="text-ink font-semibold mb-2">Made for every day</p>
              <p>Soft fabrics, honest fits and details that hold up to real wear.</p>
            </div>
            <div>
              <p className="text-ink font-semibold mb-2">Priced for youth</p>
              <p>No inflated tags. Just clothing that respects your pocket.</p>
            </div>
            <div>
              <p className="text-ink font-semibold mb-2">Ordered on WhatsApp</p>
              <p>No accounts, no card forms. Build your cart and confirm with us directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About Us — the four owners (vertical) */}
      <AboutUs />

      {/* 5. Footer follows: Instagram · address · shop · help · copyright */}
    </>
  );
}
