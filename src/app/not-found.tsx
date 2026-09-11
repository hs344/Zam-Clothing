import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16 md:pt-24">
      <EmptyState
        eyebrow="404"
        title="This page wandered off."
        message="The link may be old or mistyped. The collection is right this way."
        action={{ href: "/", label: "Back to ZAM" }}
        secondary={{ href: "/shop", label: "Shop all" }}
      />
    </div>
  );
}
