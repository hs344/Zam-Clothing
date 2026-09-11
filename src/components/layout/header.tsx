"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/store-provider";
import type { Category } from "@/lib/types";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "@/components/icons";

export function Header({ categories }: { categories: Category[] }) {
  const { cartCount, wishlist, hydrated, settings } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInput.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const transparent = isHome && !scrolled && !menuOpen && !searchOpen;
  const navLinks = [{ name: "Shop", slug: "" }, ...categories.map((c) => ({ name: c.name, slug: c.slug }))];

  return (
    <>
      {settings.announcement_text && (
        <div className="bg-ink text-cream text-center text-[0.68rem] tracking-[0.22em] uppercase py-2 px-4">
          {settings.announcement_text}
        </div>
      )}
      <header
        className={`sticky top-0 z-40 transition-colors duration-500 ${
          transparent ? "bg-transparent text-cream" : "bg-cream/95 backdrop-blur border-b border-line text-ink"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 h-16 md:h-[72px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 md:gap-0">
            <button
              type="button"
              className="lg:hidden -ml-2 p-2"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <Link href="/" className="font-semibold tracking-[0.3em] text-[0.8rem] md:text-[0.85rem] uppercase">
              ZAM Clothing
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-9">
            {navLinks.map((l) => {
              const href = l.slug ? `/shop/${l.slug}` : "/shop";
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-[0.72rem] uppercase tracking-[0.22em] font-medium transition-opacity hover:opacity-100 ${active ? "opacity-100 underline underline-offset-8 decoration-gold" : "opacity-75"}`}
                >
                  {l.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button type="button" className="p-2" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </button>
            <Link href="/wishlist" className="p-2 relative" aria-label={`Wishlist, ${wishlist.length} items`}>
              <HeartIcon />
              {hydrated && wishlist.length > 0 && <Badge count={wishlist.length} />}
            </Link>
            <Link href="/cart" className="p-2 relative" aria-label={`Cart, ${cartCount} items`}>
              <BagIcon />
              {hydrated && cartCount > 0 && <Badge count={cartCount} />}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-full bg-cream border-b border-line shadow-lift fade-in">
            <nav aria-label="Mobile" className="px-6 py-6 flex flex-col">
              {navLinks.map((l) => (
                <Link
                  key={l.slug}
                  href={l.slug ? `/shop/${l.slug}` : "/shop"}
                  className="py-4 border-b border-line text-[0.78rem] uppercase tracking-[0.24em] font-medium text-ink"
                >
                  {l.name}
                </Link>
              ))}
              <Link href="/track-order" className="py-4 text-[0.78rem] uppercase tracking-[0.24em] font-medium text-ink">
                Track Order
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="bg-cream border-b border-line shadow-lift slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submitSearch} className="mx-auto max-w-3xl px-6 py-10 md:py-16">
              <label htmlFor="site-search" className="eyebrow text-ash block mb-4">
                Search ZAM
              </label>
              <div className="flex items-center gap-4 border-b border-ink pb-3">
                <SearchIcon className="text-ash shrink-0" />
                <input
                  id="site-search"
                  ref={searchInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “linen shirt”, “black”, “sneakers”…"
                  className="flex-1 bg-transparent text-xl md:text-2xl font-serif placeholder:text-stone focus:outline-none"
                  autoComplete="off"
                />
                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-2">
                  <CloseIcon />
                </button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-xs text-ash">Popular:</span>
                {categories.map((c) => (
                  <Link key={c.slug} href={`/shop/${c.slug}`} className="text-xs uppercase tracking-[0.18em] border border-line px-3 py-1.5 hover:border-ink">
                    {c.name}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[0.6rem] font-bold flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}
