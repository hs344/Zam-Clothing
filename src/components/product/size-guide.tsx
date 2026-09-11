"use client";

import { useEffect } from "react";
import { CLOTHING_SIZE_GUIDE, SHOE_SIZE_GUIDE, TROUSER_SIZE_GUIDE, type SizeGuideKind } from "@/lib/size-guide";
import { CloseIcon } from "@/components/icons";

export function SizeGuide({ kind, onClose }: { kind: SizeGuideKind; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-ink/50 p-0 md:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="w-full md:max-w-xl bg-cream shadow-lift slide-in-up max-h-[90svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-line">
          <div>
            <p className="eyebrow text-gold">Size Guide</p>
            <h2 id="size-guide-title" className="font-serif text-3xl mt-2">
              {kind === "shoes" ? "Footwear" : kind === "trousers" ? "Trousers" : "Tops"}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close size guide" className="p-2 -mr-2">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 md:p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-[0.22em] text-ash border-b border-line">
                {kind === "shoes" ? (
                  <>
                    <th className="py-3 font-semibold">UK Size</th>
                    <th className="py-3 font-semibold">EU</th>
                    <th className="py-3 font-semibold">Foot Length</th>
                  </>
                ) : kind === "trousers" ? (
                  <>
                    <th className="py-3 font-semibold">Size</th>
                    <th className="py-3 font-semibold">Waist</th>
                    <th className="py-3 font-semibold">Hip</th>
                    <th className="py-3 font-semibold">Inseam</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 font-semibold">Size</th>
                    <th className="py-3 font-semibold">Chest</th>
                    <th className="py-3 font-semibold">Length</th>
                    <th className="py-3 font-semibold">Shoulder</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {kind === "shoes"
                ? SHOE_SIZE_GUIDE.map((r) => (
                    <tr key={r.uk} className="border-b border-line/70">
                      <td className="py-3 font-medium">{r.uk}</td>
                      <td className="py-3 text-ash">{r.eu}</td>
                      <td className="py-3 text-ash">{r.footLength}</td>
                    </tr>
                  ))
                : kind === "trousers"
                  ? TROUSER_SIZE_GUIDE.map((r) => (
                      <tr key={r.size} className="border-b border-line/70">
                        <td className="py-3 font-medium">{r.size}</td>
                        <td className="py-3 text-ash">{r.waist}</td>
                        <td className="py-3 text-ash">{r.hip}</td>
                        <td className="py-3 text-ash">{r.inseam}</td>
                      </tr>
                    ))
                  : CLOTHING_SIZE_GUIDE.map((r) => (
                      <tr key={r.size} className="border-b border-line/70">
                        <td className="py-3 font-medium">{r.size}</td>
                        <td className="py-3 text-ash">{r.chest}</td>
                        <td className="py-3 text-ash">{r.length}</td>
                        <td className="py-3 text-ash">{r.shoulder}</td>
                      </tr>
                    ))}
            </tbody>
          </table>
          <p className="mt-6 text-xs text-stone leading-relaxed">
            Measurements are garment measurements and may vary by ±0.5 in. If you are between sizes, we recommend sizing up for a relaxed fit.
          </p>
        </div>
      </div>
    </div>
  );
}
