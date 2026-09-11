"use client";

import Link from "next/link";
import { useStore } from "@/store/store-provider";

export function NoticeToast() {
  const { notice } = useStore();
  if (!notice) return null;
  return (
    <div
      key={notice.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] bg-ink text-cream px-5 py-3.5 shadow-lift flex items-center gap-5 text-sm slide-in-up max-w-[calc(100vw-2rem)]"
    >
      <span className="truncate">{notice.message}</span>
      {notice.actionHref && (
        <Link href={notice.actionHref} className="shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-gold-soft underline underline-offset-4">
          {notice.actionLabel}
        </Link>
      )}
    </div>
  );
}
