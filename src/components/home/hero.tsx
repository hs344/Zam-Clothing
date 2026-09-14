"use client";

import Image from "next/image";
import { BRAND } from "@/lib/config";
import { ArrowRight } from "@/components/icons";

export function Hero() {
  const scrollToCollection = () => {
    const el = document.getElementById("collection");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section
      aria-label="ZAM storefront"
      className="relative -mt-16 md:-mt-[72px] bg-ink text-cream overflow-hidden"
    >
      {/* Storefront image */}
      <div className="relative h-[62svh] min-h-[420px] md:absolute md:inset-0 md:h-auto md:min-h-0">
        <Image
          src="/images/hero-storefront.jpg.jpg"
          alt="The ZAM Clothing storefront at dusk — warm light, folded tees on white shelves and a tall potted palm by the door."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Mobile: fade into the copy panel. Desktop: soft left-side veil for legibility. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/30 md:hidden" aria-hidden />
        <div
          className="hidden md:block absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent"
          aria-hidden
        />
        <div className="hidden md:block absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
      </div>

      {/* Copy */}
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 pb-14 pt-8 md:pt-0 md:pb-0 md:min-h-[100svh] md:flex md:items-center">
        <div className="md:max-w-[560px] lg:max-w-[620px] md:pt-24">
          <p className="eyebrow text-gold-soft fade-up">{BRAND.name}</p>
          <h1 className="font-serif mt-5 text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[5.4rem] fade-up delay-1">
            Young-Made.
            <br />
            Youth-Worn.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-cream/85 leading-snug fade-up delay-2">
            {BRAND.supportLine1}
            <br />
            {BRAND.supportLine2}
          </p>
          <p className="mt-5 max-w-md text-[0.95rem] text-cream/65 leading-relaxed fade-up delay-3">
            Everyday clothing, made comfortable.
            <br />
            Made to wear. Made to be yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6 fade-up delay-4">
            <button
              type="button"
              onClick={scrollToCollection}
              className="inline-flex items-center gap-4 border border-gold-soft/70 bg-cream/5 px-7 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-cream backdrop-blur-sm transition-colors duration-300 hover:bg-cream hover:text-ink"
            >
              Explore Collection <ArrowRight />
            </button>
            <span className="hidden sm:inline text-[0.68rem] uppercase tracking-[0.24em] text-cream/50">
              T-Shirts · Shirts · Shoes · Trousers
            </span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        type="button"
        onClick={scrollToCollection}
        aria-label="Scroll to categories"
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-cream/60 hover:text-cream transition-colors"
      >
        <span className="text-[0.62rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="block w-px h-10 bg-gradient-to-b from-cream/70 to-transparent" />
      </button>
    </section>
  );
}
