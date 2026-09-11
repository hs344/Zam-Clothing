// Server-only client for the Google Apps Script Web App.
// The browser never talks to Apps Script directly; Next.js route handlers and
// server components call these helpers so the URL stays private.
import "server-only";
import { APPS_SCRIPT_API_KEY, APPS_SCRIPT_URL, CATALOGUE_REVALIDATE_SECONDS } from "@/lib/config";

export class AppsScriptError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "AppsScriptError";
  }
}

interface ScriptEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: ScriptEnvelope<T>;
  try {
    json = JSON.parse(text) as ScriptEnvelope<T>;
  } catch {
    throw new AppsScriptError("The store backend returned an unexpected response.");
  }
  if (!res.ok || !json.ok) {
    throw new AppsScriptError(json.error || "The store backend could not complete the request.", res.ok ? 400 : 502);
  }
  return json.data as T;
}

export async function scriptGet<T>(
  action: string,
  params: Record<string, string> = {},
  revalidate: number | false = CATALOGUE_REVALIDATE_SECONDS,
): Promise<T> {
  if (!APPS_SCRIPT_URL) throw new AppsScriptError("Apps Script URL is not configured.", 500);
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      redirect: "follow",
      ...(revalidate === false ? { cache: "no-store" } : { next: { revalidate } }),
    });
  } catch {
    throw new AppsScriptError("Could not reach the store backend. Please try again.");
  }
  return parseEnvelope<T>(res);
}

export async function scriptPost<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  if (!APPS_SCRIPT_URL) throw new AppsScriptError("Apps Script URL is not configured.", 500);
  let res: Response;
  try {
    // Apps Script web apps respond to POST with a 302 redirect; follow it.
    res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      cache: "no-store",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, api_key: APPS_SCRIPT_API_KEY || undefined, ...payload }),
    });
  } catch {
    throw new AppsScriptError("Could not reach the store backend. Please try again.");
  }
  return parseEnvelope<T>(res);
}
