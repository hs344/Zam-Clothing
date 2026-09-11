import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/server/store";
import { formatINR } from "@/lib/format";

const PAGES: Record<string, { title: string; eyebrow: string; body: (s: { email: string; fee: string; threshold: string }) => string[] }> = {
  about: {
    title: "Young-Made. Youth-Worn.",
    eyebrow: "About ZAM",
    body: () => [
      "ZAM CLOTHING is a small Indian label making everyday clothing for young people who want to feel comfortable without overthinking it — or overspending on it.",
      "We keep the range tight: T-shirts, shirts, shoes and trousers. Honest fabrics, easy fits, calm colours. Nothing that goes out of style in a season.",
      "We're young-made in the most literal sense — designed, packed and shipped by a small team that wears exactly what we sell. Comfy on you. Easy on your pocket.",
    ],
  },
  contact: {
    title: "Say hello.",
    eyebrow: "Contact",
    body: (s) => [
      "The fastest way to reach us is WhatsApp — every order is confirmed there, and we're happy to help with sizing, exchanges or anything else.",
      s.email ? `You can also write to us at ${s.email}.` : "You can also reach us through our Instagram.",
      "We reply within one working day, usually much faster.",
    ],
  },
  shipping: {
    title: "Shipping, simply.",
    eyebrow: "Shipping",
    body: (s) => [
      `We ship across India. Shipping is ${s.fee}${s.threshold ? `, and free on orders above ${s.threshold}` : ""}.`,
      "Orders are confirmed over WhatsApp and dispatched within 2–4 working days. Delivery usually takes 3–7 working days depending on your pincode.",
      "You can follow your order any time on the Track My Order page using your Order ID and phone number.",
    ],
  },
  returns: {
    title: "Easy exchanges.",
    eyebrow: "Returns & Exchanges",
    body: () => [
      "If the fit isn't right, message us on WhatsApp within 7 days of delivery with your Order ID. We'll arrange an exchange for another size or colour.",
      "Items should be unworn, unwashed and have their tags intact. Footwear should be tried indoors and returned in its original box.",
      "Refunds, where applicable, are handled directly with you over WhatsApp.",
    ],
  },
  privacy: {
    title: "Your details, respected.",
    eyebrow: "Privacy",
    body: () => [
      "We collect only what we need to deliver your order: your name, phone number, delivery address and (optionally) email.",
      "Order details are stored securely in our order records and are used solely to fulfil and support your order. We never sell or share your information for marketing.",
      "Your cart and wishlist are saved in your own browser and never leave your device until you place an order.",
    ],
  },
  terms: {
    title: "The small print, kept short.",
    eyebrow: "Terms",
    body: () => [
      "Placing an order on this website creates an order request. The order is confirmed only after we acknowledge it on WhatsApp, and payment is arranged directly with us at that point — there is no online payment on this site.",
      "Prices are in Indian Rupees and may change without notice. If a product becomes unavailable after you order, we'll let you know and offer an alternative or cancel the item.",
      "By using this site you agree to these terms and our privacy note.",
    ],
  },
};

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  return { title: page ? page.eyebrow : "Info" };
}

export default async function InfoPage({ params }: Params) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  const settings = await getSettings().catch(() => null);
  const s = {
    email: settings?.support_email ?? "",
    fee: settings && settings.shipping_fee > 0 ? formatINR(settings.shipping_fee) : "free",
    threshold: settings && settings.free_shipping_threshold > 0 ? formatINR(settings.free_shipping_threshold) : "",
  };
  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10 md:pt-16">
      <div className="max-w-2xl">
        <p className="eyebrow text-gold">{page.eyebrow}</p>
        <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-[1.05]">{page.title}</h1>
        <div className="mt-10 space-y-5 text-[1.02rem] leading-relaxed text-ash">
          {page.body(s).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/shop" className="btn-primary">Shop the collection</Link>
          <Link href="/track-order" className="btn-outline">Track my order</Link>
        </div>
      </div>
    </div>
  );
}
