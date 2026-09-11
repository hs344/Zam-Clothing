"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartItem, Product, Settings } from "@/lib/types";
import { cartKey, computeShipping } from "@/lib/format";

const CART_KEY = "zam.cart.v1";
const WISHLIST_KEY = "zam.wishlist.v1";

interface Notice { id: number; message: string; actionHref?: string; actionLabel?: string }

interface StoreContextValue {
  settings: Settings;
  hydrated: boolean;
  // cart
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (product: Product, size: string, colour: string, quantity: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  // wishlist
  wishlist: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  // notices
  notice: Notice | null;
  notify: (message: string, action?: { href: string; label: string }) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ settings, children }: { settings: Settings; children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCart(readJSON<CartItem[]>(CART_KEY, []));
    setWishlist(readJSON<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const notify = useCallback((message: string, action?: { href: string; label: string }) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ id: Date.now(), message, actionHref: action?.href, actionLabel: action?.label });
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  }, []);

  const addToCart = useCallback(
    (product: Product, size: string, colour: string, quantity: number) => {
      const key = cartKey(product.product_id, size, colour);
      setCart((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(10, i.quantity + quantity) } : i));
        return [
          ...prev,
          {
            key,
            product_id: product.product_id,
            name: product.name,
            slug: product.slug,
            image: product.images[0] ?? "",
            size,
            colour,
            quantity,
            unit_price: product.price,
            category_slug: product.category_slug,
          },
        ];
      });
      notify(`${product.name} added to your cart`, { href: "/cart", label: "View cart" });
    },
    [notify],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(10, quantity) } : i)),
    );
  }, []);
  const removeFromCart = useCallback((key: string) => setCart((prev) => prev.filter((i) => i.key !== key)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const has = prev.includes(product.product_id);
        notify(has ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`, has ? undefined : { href: "/wishlist", label: "View wishlist" });
        return has ? prev.filter((id) => id !== product.product_id) : [...prev, product.product_id];
      });
    },
    [notify],
  );

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.unit_price * i.quantity, 0), [cart]);
  const shipping = useMemo(() => computeShipping(subtotal, settings.shipping_fee, settings.free_shipping_threshold), [subtotal, settings]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const value = useMemo<StoreContextValue>(
    () => ({
      settings, hydrated, cart, cartCount, subtotal, shipping, total: subtotal + shipping,
      addToCart, updateQuantity, removeFromCart, clearCart,
      wishlist, isWishlisted, toggleWishlist, notice, notify,
    }),
    [settings, hydrated, cart, cartCount, subtotal, shipping, addToCart, updateQuantity, removeFromCart, clearCart, wishlist, isWishlisted, toggleWishlist, notice, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
