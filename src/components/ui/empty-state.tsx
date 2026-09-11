import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  message?: string;
  action?: { href: string; label: string };
  secondary?: { href: string; label: string };
  children?: ReactNode;
}

export function EmptyState({ eyebrow, title, message, action, secondary, children }: Props) {
  return (
    <div className="border border-line bg-white/50 px-6 py-16 md:py-24 text-center max-w-2xl mx-auto">
      {eyebrow && <p className="eyebrow text-gold mb-4">{eyebrow}</p>}
      <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
      {message && <p className="mt-4 text-ash max-w-md mx-auto">{message}</p>}
      {children}
      {(action || secondary) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {action && (
            <Link href={action.href} className="btn-primary">
              {action.label}
            </Link>
          )}
          {secondary && (
            <Link href={secondary.href} className="btn-outline">
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
