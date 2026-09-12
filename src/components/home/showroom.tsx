"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { ArrowRight } from "@/components/icons";

/**
 * Scroll-pinned horizontal showroom.
 *
 * The outer wrapper is tall (one viewport per category). While it is in view,
 * the inner viewport-sized container sticks to the top and the track of
 * full-screen panels is translated horizontally in proportion to how far the
 * user has scrolled through the wrapper. Net effect for the visitor: vertical
 * scroll → page pins → keep scrolling and you move sideways through the
 * showroom → after the last section the page continues down again.
 *
 * Works with mouse wheel, trackpad, touch swipe and keyboard (page down /
 * arrows) because it is driven purely by the normal document scroll.
 */
export function Showroom({ categories }: { categories: Category[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = categories.length;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!wrapper || !viewport || !track || n === 0) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = wrapper.getBoundingClientRect();
      const travel = wrapper.offsetHeight - viewport.offsetHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      const maxX = track.scrollWidth - viewport.clientWidth;
      track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      const idx = n > 1 ? Math.min(n - 1, Math.round(p * (n - 1))) : 0;
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [n]);

  /** Scrolls the document to the position where panel `i` is fully in view (used for keyboard focus). */
  const scrollToPanel = (i: number) => {
    const wrapper = wrapperRef.current;
    const viewport = viewportRef.current;
    if (!wrapper || !viewport || n < 2) return;
    const top = wrapper.getBoundingClientRect().top + window.scrollY;
    const travel = wrapper.offsetHeight - viewport.offsetHeight;
    window.scrollTo({ top: top + (travel * i) / (n - 1), behavior: "smooth" });
  };

  if (n === 0) return null;

  return (
    <div
      id="collection"
      ref={wrapperRef}
      className="relative bg-ink"
      style={{ height: `${100 + (n - 1) * 110}svh` }}
    >
      <div ref={viewportRef} className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="The ZAM showroom"
          className="flex h-full w-full will-change-transform"
        >
          {categories.map((c, i) => (
            <ShowroomPanel key={c.slug} category={c} index={i} active={i === active} onFocusPanel={() => scrollToPanel(i)} />
          ))}
        </div>

        {/* Minimal wayfinding — current section + progress line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 md:px-12 lg:px-14 pb-4 md:pb-5 text-cream">
          <div className="flex items-end justify-between text-[0.62rem] md:text-[0.66rem] uppercase tracking-[0.3em]">
            <span className="text-cream/70" aria-live="polite">
              <span className="tabular-nums text-cream">0{active + 1}</span>
              <span className="text-cream/40"> / 0{n}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-2 text-cream/55">
              {active < n - 1 ? "Keep scrolling to move through the showroom" : "Keep scrolling"}
              <ArrowRight width={14} height={14} className={active < n - 1 ? "" : "rotate-90"} />
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-cream/20">
            <div ref={progressRef} className="h-full w-full origin-left bg-gold-soft" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowroomPanel({
  category,
  index,
  active,
  onFocusPanel,
}: {
  category: Category;
  index: number;
  active: boolean;
  onFocusPanel: () => void;
}) {
  const href = `/shop/${category.slug}`;
  return (
    <section
      aria-label={`${category.name} — showroom section ${index + 1}`}
      aria-hidden={!active}
      className="relative h-full w-full shrink-0 overflow-hidden bg-[#dfd6c8]"
    >
      {category.image && (
        <>
          {/* Soft full-panel backdrop fills the aspect-ratio difference without cropping the actual image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image}
            alt=""
            aria-hidden="true"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-45"
          />
          {/* Keep the complete showroom artwork visible instead of aggressively cropping its edges. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image}
            alt={`${category.name} section of the ZAM showroom`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </>
      )}
      {/* Legibility veil across the bottom (over the showroom floor) — the sign and shelves stay clear. */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" aria-hidden />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-6 pb-16 md:pb-20 lg:pb-24 text-cream">
        <p className="eyebrow text-gold-soft">0{index + 1}</p>
        <h2 className="font-serif mt-2 text-[2.75rem] leading-none sm:text-6xl lg:text-7xl uppercase tracking-[0.06em]">
          <Link href={href} tabIndex={active ? 0 : -1} onFocus={onFocusPanel} className="focus-visible:outline-cream">
            {category.name}
          </Link>
        </h2>
        {category.description && (
          <p className="mt-3 max-w-md text-cream/80 text-sm md:text-[0.98rem] leading-relaxed">{category.description}</p>
        )}
        <Link
          href={href}
          tabIndex={active ? 0 : -1}
          onFocus={onFocusPanel}
          aria-label={`Explore ${category.name}`}
          className="mt-6 inline-flex items-center gap-3 border border-cream/70 bg-ink/25 px-7 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.26em] backdrop-blur-sm transition-colors duration-300 hover:bg-cream hover:text-ink focus-visible:outline-cream"
        >
          Explore Now <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
