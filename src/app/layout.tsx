import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/store/store-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NoticeToast } from "@/components/layout/notice-toast";
import { getCategories, getSettings } from "@/lib/server/store";
import { DEMO_CATEGORIES, DEMO_SETTINGS } from "@/lib/demo-data";
import { normalizeCategory, normalizeSettings } from "@/lib/normalize";

export const metadata: Metadata = {
  title: { default: "ZAM CLOTHING — Young-Made. Youth-Worn.", template: "%s · ZAM CLOTHING" },
  description: "Everyday clothing, made comfortable. Comfy on you. Easy on your pocket. T-shirts, shirts, shoes and trousers from ZAM.",
};

export const viewport: Viewport = { themeColor: "#f7f3ec", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  // If Google Sheets is unreachable, fall back gracefully so the site still renders.
  const [categories, settings] = await Promise.all([
    getCategories().catch(() => DEMO_CATEGORIES.map((c) => normalizeCategory(c as unknown as Record<string, unknown>))),
    getSettings().catch(() => normalizeSettings(DEMO_SETTINGS as unknown as Record<string, unknown>)),
  ]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <StoreProvider settings={settings}>
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer categories={categories} settings={settings} />
          <NoticeToast />
        </StoreProvider>
      </body>
    </html>
  );
}
