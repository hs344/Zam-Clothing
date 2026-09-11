import Link from "next/link";
import type { Category, Settings } from "@/lib/types";
import { BRAND } from "@/lib/config";

export function Footer({ categories, settings }: { categories: Category[]; settings: Settings }) {
  const shopLinks = [{ label: "Shop", href: "/shop" }, ...categories.map((c) => ({ label: c.name, href: `/shop/${c.slug}` }))];
  const helpLinks = [
    { label: "Track Order", href: "/track-order" },
    { label: "About", href: "/info/about" },
    { label: "Contact", href: "/info/contact" },
    { label: "Shipping", href: "/info/shipping" },
    { label: "Returns", href: "/info/returns" },
    { label: "Privacy", href: "/info/privacy" },
    { label: "Terms", href: "/info/terms" },
  ];
  return (
    <footer className="border-t border-line bg-cream-2 mt-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-16 md:py-20 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-semibold tracking-[0.3em] text-[0.85rem] uppercase">{BRAND.name}</p>
          <p className="font-serif text-3xl mt-6 leading-tight">{BRAND.tagline}</p>
          <p className="text-ash mt-3 text-[0.95rem]">
            {BRAND.supportLine1} {BRAND.supportLine2}
          </p>
          {settings.store_address && (
            <address className="not-italic mt-8 text-[0.9rem] text-ash leading-relaxed max-w-sm">
              <span className="eyebrow text-stone block mb-2">Find us</span>
              {settings.store_address}
            </address>
          )}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] uppercase tracking-[0.2em]">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                Instagram
              </a>
            )}
            {settings.support_email && (
              <a href={`mailto:${settings.support_email}`} className="hover:text-gold transition-colors">
                {settings.support_email}
              </a>
            )}
          </div>
        </div>
        <div className="md:col-span-3 md:col-start-7">
          <p className="eyebrow text-ash mb-5">Shop</p>
          <ul className="space-y-3">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[0.9rem] hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow text-ash mb-5">Help</p>
          <ul className="space-y-3">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[0.9rem] hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-6 flex flex-col md:flex-row gap-3 md:items-center justify-between text-[0.7rem] uppercase tracking-[0.18em] text-stone">
          <span>© {new Date().getFullYear()} {settings.site_name}. Made in India.</span>
          <span>Orders are confirmed over WhatsApp. No online payment.</span>
        </div>
      </div>
    </footer>
  );
}
