"use client";

import { COLOUR_SWATCHES, EMPTY_FILTERS, isFilterActive, type Filters } from "@/lib/catalogue";
import { formatINR } from "@/lib/format";
import { CheckIcon } from "@/components/icons";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  facets: { sizes: string[]; colours: string[]; minPrice: number; maxPrice: number };
  sizeLabel?: string;
}

export function FilterPanel({ filters, onChange, facets, sizeLabel = "Size" }: Props) {
  const toggle = (key: "sizes" | "colours", value: string) => {
    const list = filters[key];
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const priceSteps = buildPriceSteps(facets.minPrice, facets.maxPrice);

  return (
    <div className="space-y-9">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-ink">Filter</p>
        {isFilterActive(filters) && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-[0.68rem] uppercase tracking-[0.2em] text-gold underline underline-offset-4">
            Clear all
          </button>
        )}
      </div>

      {facets.sizes.length > 0 && (
        <fieldset>
          <legend className="label">{sizeLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle("sizes", s)}
                  className={`min-w-[44px] px-3 py-2 text-xs border transition-colors ${on ? "border-ink bg-ink text-cream" : "border-line hover:border-ink"}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {facets.colours.length > 0 && (
        <fieldset>
          <legend className="label">Colour</legend>
          <ul className="space-y-2.5">
            {facets.colours.map((c) => {
              const on = filters.colours.includes(c);
              return (
                <li key={c}>
                  <button type="button" aria-pressed={on} onClick={() => toggle("colours", c)} className="flex items-center gap-3 text-sm group">
                    <span
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${on ? "border-ink" : "border-line"}`}
                      style={{ backgroundColor: COLOUR_SWATCHES[c] ?? "#cfc7b8" }}
                    >
                      {on && <CheckIcon width={12} height={12} className={c === "White" || c === "Cream" || c === "Beige" ? "text-ink" : "text-cream"} />}
                    </span>
                    <span className={on ? "text-ink font-medium" : "text-ash group-hover:text-ink"}>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="label">Price</legend>
        <ul className="space-y-2.5">
          <li>
            <PriceOption label="All prices" on={filters.priceMin === null && filters.priceMax === null} onClick={() => onChange({ ...filters, priceMin: null, priceMax: null })} />
          </li>
          {priceSteps.map((step) => (
            <li key={step.label}>
              <PriceOption
                label={step.label}
                on={filters.priceMin === step.min && filters.priceMax === step.max}
                onClick={() => onChange({ ...filters, priceMin: step.min, priceMax: step.max })}
              />
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="label">Availability</legend>
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="h-4 w-4 accent-ink"
          />
          In stock only
        </label>
      </fieldset>
    </div>
  );
}

function PriceOption({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="flex items-center gap-3 text-sm group">
      <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${on ? "border-ink" : "border-line"}`}>
        {on && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <span className={on ? "text-ink font-medium" : "text-ash group-hover:text-ink"}>{label}</span>
    </button>
  );
}

function buildPriceSteps(min: number, max: number) {
  if (max <= 0) return [];
  const step = max - min > 2000 ? 1000 : 500;
  const start = Math.floor(min / step) * step;
  const steps: { label: string; min: number | null; max: number | null }[] = [];
  for (let lo = start; lo <= max; lo += step) {
    const hi = lo + step - 1;
    steps.push({ label: lo === start ? `Under ${formatINR(hi + 1)}` : `${formatINR(lo)} – ${formatINR(hi)}`, min: lo === start ? null : lo, max: hi });
    if (steps.length >= 5) break;
  }
  if (steps.length && max > (steps[steps.length - 1].max ?? 0)) {
    const lastMax = steps[steps.length - 1].max ?? 0;
    steps.push({ label: `Above ${formatINR(lastMax + 1)}`, min: lastMax + 1, max: null });
  }
  return steps;
}
