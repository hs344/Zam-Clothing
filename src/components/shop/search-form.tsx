"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "@/components/icons";

export function SearchForm({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        router.push(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
      }}
      className="flex items-center gap-3 border-b border-ink pb-2"
    >
      <SearchIcon className="text-ash shrink-0" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, categories, tags…" aria-label="Search products" className="flex-1 bg-transparent py-2 text-lg focus:outline-none placeholder:text-stone" />
      <button type="submit" className="text-[0.7rem] uppercase tracking-[0.2em] font-semibold">Search</button>
    </form>
  );
}
