"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Product } from "@/components/home/mockData";

export interface CartItemType {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItemType[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  promoCode: string;
  promoDiscount: number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (product: Product, size?: string, color?: string, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  mergeCartOnLogin: (userId: string) => Promise<void>;
  guestId: string;
  wishlistItems: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

type DbCartItem = {
  id: string;
  productId: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: string | number;
    discountPrice?: string | number | null;
    images: string[];
  };
};

type DbCart = {
  items?: DbCartItem[];
} | null;

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "elantraa_guest_cart";
const GUEST_ID_KEY = "elantraa_guest_id";
const PROMO_CODE_KEY = "elantraa_promo_code";
const GUEST_WISHLIST_KEY = "elantraa_guest_wishlist";

function createGuestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
}

function mapDbCart(cart: DbCart): CartItemType[] {
  return (cart?.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    slug: item.product.slug,
    price: Number(item.product.price),
    discountPrice: item.product.discountPrice == null ? null : Number(item.product.discountPrice),
    image: item.product.images?.[0] || "/images/collections/dresses.png",
    size: item.size || "M",
    color: item.color || "Default",
    quantity: item.quantity,
  }));
}

function createLocalCartItem(
  product: Product,
  size: string,
  color: string,
  quantity: number
): CartItemType {
  return {
    id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    discountPrice: product.discountPrice,
    image: product.images[0] || "/images/collections/dresses.png",
    size,
    color,
    quantity,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user?.email;

  const [items, setItems] = useState<CartItemType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [guestId, setGuestId] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [storeShippingCharge, setStoreShippingCharge] = useState<number>(0);

  useEffect(() => {
    async function fetchStoreSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.shippingCharge !== undefined) {
            setStoreShippingCharge(Number(data.settings.shippingCharge));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch store settings in cart context", err);
      }
    }
    fetchStoreSettings();
  }, []);

  const loadServerCart = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems(mapDbCart(data.cart));
  }, []);

  const loadServerWishlist = useCallback(async () => {
    const res = await fetch("/api/wishlist", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setWishlistItems(data.wishlist || []);
  }, []);

  const mergeCartOnLogin = useCallback(
    async (_userId: string) => {
      const guestCartItems = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
      const response = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestCartItems, guestId }),
      });

      if (response.ok) {
        localStorage.removeItem(GUEST_CART_KEY);
        const data = await response.json();
        setItems(mapDbCart(data.cart));
      }
    },
    [guestId]
  );

  useEffect(() => {
    let gid = localStorage.getItem(GUEST_ID_KEY);
    if (!gid) {
      gid = createGuestId();
      localStorage.setItem(GUEST_ID_KEY, gid);
    }
    setGuestId(gid);

    const savedPromo = localStorage.getItem(PROMO_CODE_KEY);
    if (savedPromo) setPromoCode(savedPromo);

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || status === "loading") return;

    if (!isLoggedIn) {
      setItems(JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]"));
      setWishlistItems(JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]"));
      return;
    }

    async function loadUserData() {
      await mergeCartOnLogin(session?.user?.email || "");

      const guestWishlist = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]") as Product[];
      if (guestWishlist.length > 0) {
        for (const product of guestWishlist) {
          await fetch("/api/wishlist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          });
        }
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }

      await Promise.all([loadServerCart(), loadServerWishlist()]);
    }

    loadUserData();
  }, [isHydrated, isLoggedIn, loadServerCart, loadServerWishlist, mergeCartOnLogin, session?.user?.email, status]);

  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }, [items, isHydrated, isLoggedIn]);

  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems, isHydrated, isLoggedIn]);

  const addItem = (
    product: Product,
    size: string = product.sizes[0] || "M",
    color: string = "Default",
    quantity: number = 1
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [...prevItems, createLocalCartItem(product, size, color, quantity)];
    });

    if (isLoggedIn) {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, size, color, quantity }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.cart) setItems(mapDbCart(data.cart));
        })
        .catch((error) => console.error("Failed to save cart item", error));
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)));

    if (isLoggedIn) {
      fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      }).catch((error) => console.error("Failed to update cart quantity", error));
    }
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));

    if (isLoggedIn) {
      fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      }).catch((error) => console.error("Failed to remove cart item", error));
    }
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(GUEST_CART_KEY);

    if (isLoggedIn) {
      fetch("/api/cart?all=true", { method: "DELETE" }).catch((error) =>
        console.error("Failed to clear cart", error)
      );
    }
  };

  const [promoDiscountAmount, setPromoDiscountAmount] = useState<number>(0);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (!promoCode || subtotal === 0) {
      if (!promoCode) setPromoDiscountAmount(0);
      return;
    }

    async function revalidatePromo() {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: promoCode, subtotal }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setPromoDiscountAmount(Number(data.discountAmount) || 0);
          } else {
            setPromoCode("");
            setPromoDiscountAmount(0);
            localStorage.removeItem(PROMO_CODE_KEY);
          }
        }
      } catch (err) {
        console.warn("Error revalidating promo code:", err);
      }
    }

    revalidatePromo();
  }, [subtotal, promoCode]);

  const promoDiscount = useMemo(() => {
    if (!promoCode) return 0;
    return promoDiscountAmount;
  }, [promoCode, promoDiscountAmount]);

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: "Please enter a promo code" };

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean, subtotal }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        return {
          success: false,
          message: data.error || "Invalid or expired promo code",
        };
      }

      setPromoCode(clean);
      setPromoDiscountAmount(Number(data.discountAmount) || 0);
      localStorage.setItem(PROMO_CODE_KEY, clean);

      return {
        success: true,
        message: data.message || `Promo code ${clean} applied successfully!`,
      };
    } catch (err) {
      console.error("Failed to validate promo code:", err);
      return { success: false, message: "Network error validating promo code" };
    }
  };

  const removePromoCode = () => {
    setPromoCode("");
    setPromoDiscountAmount(0);
    localStorage.removeItem(PROMO_CODE_KEY);
  };

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      return exists ? prev.filter((item) => item.id !== product.id) : [...prev, product];
    });

    if (isLoggedIn) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.wishlist) setWishlistItems(data.wishlist);
        })
        .catch((error) => console.error("Failed to update wishlist", error));
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.some((item) => item.id === productId);
  const wishlistCount = wishlistItems.length;
  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const shipping = useMemo(
    () => (subtotal > 5000 || subtotal === 0 ? 0 : storeShippingCharge),
    [subtotal, storeShippingCharge]
  );
  const discount = promoDiscount;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        discount,
        shipping,
        promoCode,
        promoDiscount,
        total,
        cartOpen,
        setCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyPromoCode,
        removePromoCode,
        mergeCartOnLogin,
        guestId,
        wishlistItems,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
