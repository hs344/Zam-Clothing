"use client";

import { SORT_OPTIONS, type SortKey } from "@/lib/catalogue";
import { ChevronDown } from "@/components/icons";

export function SortControl({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="relative inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-ink">
      <span className="text-ash">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="appearance-none bg-transparent pr-6 py-2 focus:outline-none cursor-pointer uppercase tracking-[0.2em] text-[0.72rem] font-semibold"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown width={14} height={14} className="absolute right-0 pointer-events-none" />
    </label>
  );
}
