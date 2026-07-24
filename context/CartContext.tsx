"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "elantraa_guest_cart";
const GUEST_ID_KEY = "elantraa_guest_id";
const PROMO_CODE_KEY = "elantraa_promo_code";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [guestId, setGuestId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Guest ID and load Cart from localStorage on mount
  useEffect(() => {
    let gid = localStorage.getItem(GUEST_ID_KEY);
    if (!gid) {
      gid = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem(GUEST_ID_KEY, gid);
    }
    setGuestId(gid);

    // Load guest cart
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse guest cart", e);
      }
    } else {
      // Seed 2 default items for seamless demo
      const defaultDemoItems: CartItemType[] = [
        {
          id: "demo-item-1",
          productId: "prod-1",
          name: "Aurelia Satin Wrap Dress",
          slug: "aurelia-satin-wrap-dress",
          price: 5499,
          discountPrice: 4799,
          image: "/images/collections/dresses.png",
          size: "M",
          color: "Champagne",
          quantity: 1,
        },
        {
          id: "demo-item-2",
          productId: "prod-3",
          name: "Elan Classic Oxford Shirt",
          slug: "elan-classic-oxford-shirt",
          price: 2499,
          discountPrice: null,
          image: "/images/collections/menswear.png",
          size: "L",
          color: "White",
          quantity: 1,
        },
      ];
      setItems(defaultDemoItems);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(defaultDemoItems));
    }

    const savedPromo = localStorage.getItem(PROMO_CODE_KEY);
    if (savedPromo) {
      setPromoCode(savedPromo);
      setPromoDiscount(savedPromo === "ELANTRAAGOLD" ? 500 : 0);
    }

    setIsLoaded(true);
  }, []);

  // Save guest cart changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

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
    localStorage.removeItem(GUEST_CART_KEY);
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "ELANTRAAGOLD") {
      setPromoCode(clean);
      setPromoDiscount(500);
      localStorage.setItem(PROMO_CODE_KEY, clean);
      return { success: true, message: "Promo code ELANTRAAGOLD applied! ₹500 discount added." };
    } else if (clean === "ELANTRAA10") {
      setPromoCode(clean);
      setPromoDiscount(300);
      localStorage.setItem(PROMO_CODE_KEY, clean);
      return { success: true, message: "Promo code ELANTRAA10 applied! ₹300 discount added." };
    }
    return { success: false, message: "Invalid promo code. Try ELANTRAAGOLD or ELANTRAA10." };
  };

  const removePromoCode = () => {
    setPromoCode("");
    setPromoDiscount(0);
    localStorage.removeItem(PROMO_CODE_KEY);
  };

  // Merge Guest Cart into User DB Cart upon login
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

  const cartCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.discountPrice || item.price) * item.quantity,
        0
      ),
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
