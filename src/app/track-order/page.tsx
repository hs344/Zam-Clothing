import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrder } from "@/components/track/track-order";

export const metadata: Metadata = { title: "Track my order" };

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrder />
    </Suspense>
  );
}
