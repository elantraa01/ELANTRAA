"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
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
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  mergeCartOnLogin: (userId: string) => Promise<void>;
  guestId: string;
  // Wishlist
  wishlistItems: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "elantraa_guest_cart";
const GUEST_ID_KEY = "elantraa_guest_id";
const PROMO_CODE_KEY = "elantraa_promo_code";
const WISHLIST_KEY = "elantraa_wishlist";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  const [items, setItems] = useState<CartItemType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [guestId, setGuestId] = useState("");

  const activeUserRef = useRef<string | null | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);

  const getCartKeyForEmail = (email?: string | null) => {
    if (email) {
      const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
      return `elantraa_user_cart_${cleanEmail}`;
    }
    return GUEST_CART_KEY;
  };

  const getWishlistKeyForEmail = (email?: string | null) => {
    if (email) {
      const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
      return `elantraa_user_wishlist_${cleanEmail}`;
    }
    return WISHLIST_KEY;
  };

  // 1. Initialize Guest ID and Promo Code on mount
  useEffect(() => {
    let gid = localStorage.getItem(GUEST_ID_KEY);
    if (!gid) {
      gid = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem(GUEST_ID_KEY, gid);
    }
    setGuestId(gid);

    const savedPromo = localStorage.getItem(PROMO_CODE_KEY);
    if (savedPromo) {
      setPromoCode(savedPromo);
    }
  }, []);

  // 2. Hydrate Cart and Wishlist whenever session/user changes
  useEffect(() => {
    if (status === "loading") return;

    const cartKey = getCartKeyForEmail(userEmail);
    const wishlistKey = getWishlistKeyForEmail(userEmail);

    // Load User or Guest Cart
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
        setItems([]);
      }
    } else {
      setItems([]);
    }

    // Load User or Guest Wishlist
    const savedWishlist = localStorage.getItem(wishlistKey);
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]);
    }

    activeUserRef.current = userEmail || null;
    setIsHydrated(true);
  }, [userEmail, status]);

  // 3. Save Cart changes to active user profile key
  useEffect(() => {
    if (!isHydrated) return;
    if (activeUserRef.current !== (userEmail || null)) return;

    const cartKey = getCartKeyForEmail(userEmail);
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, isHydrated, userEmail]);

  // 4. Save Wishlist changes to active user profile key
  useEffect(() => {
    if (!isHydrated) return;
    if (activeUserRef.current !== (userEmail || null)) return;

    const wishlistKey = getWishlistKeyForEmail(userEmail);
    localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
  }, [wishlistItems, isHydrated, userEmail]);

  const addItem = (
    product: Product,
    size: string = product.sizes[0] || "M",
    color: string = product.colors[0] || "Default",
    quantity: number = 1
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.productId === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex].quantity += quantity;
        return next;
      }

      const newItem: CartItemType = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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

      return [...prevItems, newItem];
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    const key = getCartKeyForEmail(userEmail);
    localStorage.removeItem(key);
  };

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.discountPrice || item.price) * item.quantity,
        0
      ),
    [items]
  );

  const promoDiscount = useMemo(() => {
    if (!promoCode) return 0;
    const clean = promoCode.trim().toUpperCase();
    if (clean === "ELANTRAAGOLD") return Math.round((subtotal * 10) / 100) || 500;
    if (clean === "FESTIVE15") return Math.round((subtotal * 15) / 100) || 750;
    if (clean === "WELCOME10") return 500;
    if (clean === "ELANTRAA10") return 300;
    return 0;
  }, [promoCode, subtotal]);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    let msg = "";

    if (clean === "ELANTRAAGOLD") {
      msg = "Promo code ELANTRAAGOLD applied! 10% discount added.";
    } else if (clean === "WELCOME10") {
      msg = "Promo code WELCOME10 applied! ₹500 discount added.";
    } else if (clean === "FESTIVE15") {
      msg = "Promo code FESTIVE15 applied! 15% festive discount added.";
    } else if (clean === "ELANTRAA10") {
      msg = "Promo code ELANTRAA10 applied! ₹300 discount added.";
    } else {
      return { success: false, message: "Invalid code. Try ELANTRAAGOLD, WELCOME10, or FESTIVE15." };
    }

    setPromoCode(clean);
    localStorage.setItem(PROMO_CODE_KEY, clean);
    return { success: true, message: msg };
  };

  const removePromoCode = () => {
    setPromoCode("");
    localStorage.removeItem(PROMO_CODE_KEY);
  };

  const mergeCartOnLogin = async (userId: string) => {
    try {
      const response = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, guestCartItems: items, guestId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.mergedItems) {
          setItems(data.mergedItems);
        }
      }
    } catch (e) {
      console.error("Failed to merge guest cart on login", e);
    }
  };

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter((item) => item.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  const cartCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
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
