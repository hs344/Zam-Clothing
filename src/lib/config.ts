// ---------------------------------------------------------------------------
// CONFIGURATION
//
// All integration switches live here. Nothing secret is ever shipped to the
// browser: the Apps Script URL is read server-side only and proxied through
// /api/store/*. WhatsApp settings normally come from the SETTINGS sheet, the
// env values are simply fallbacks used when the sheet is not connected yet.
// ---------------------------------------------------------------------------

/** Google Apps Script Web App URL (server-side only). Empty = demo mode. */
export const APPS_SCRIPT_URL = (process.env.APPS_SCRIPT_URL ?? "").trim();

/** Optional shared secret sent to Apps Script on order creation. */
export const APPS_SCRIPT_API_KEY = (process.env.APPS_SCRIPT_API_KEY ?? "").trim();

/** True when the site is talking to Google Sheets, false when using demo data. */
export const SHEETS_CONNECTED = APPS_SCRIPT_URL.length > 0;

/** Fallback WhatsApp settings (SETTINGS sheet overrides these). */
export const FALLBACK_WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER ?? "").trim();
export const FALLBACK_WHATSAPP_ENABLED =
  (process.env.WHATSAPP_ENABLED ?? "false").toLowerCase() === "true";

/** How long (seconds) product/category/settings data is cached server-side. */
export const CATALOGUE_REVALIDATE_SECONDS = 60;

export const BRAND = {
  name: "ZAM CLOTHING",
  shortName: "ZAM",
  tagline: "Young-Made. Youth-Worn.",
  supportLine1: "Comfy on you.",
  supportLine2: "Easy on your pocket.",
  description: "Everyday clothing, made comfortable. Made to wear. Made to be yours.",
};
