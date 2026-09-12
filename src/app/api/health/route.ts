import { SHEETS_CONNECTED } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    data_source: SHEETS_CONNECTED ? "sheets" : "demo",
  });
}