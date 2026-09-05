/**
 * Analytics Utility Helper
 * Safe wrappers for Google Analytics 4 (gtag) and Microsoft Clarity.
 * Works seamlessly in client-side components without crashing if tracking is disabled or blocked.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || "";

/**
 * Log a custom event to Google Analytics 4
 */
export function trackEvent(
  action: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}

/**
 * Track custom tag or event in Microsoft Clarity
 */
export function trackClarityEvent(eventName: string) {
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}

/**
 * Set custom user identification or tags in Microsoft Clarity
 */
export function identifyClarityUser(customId: string, customSessionId?: string, customPageId?: string, friendlyName?: string) {
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    window.clarity("identify", customId, customSessionId, customPageId, friendlyName);
  }
}

/**
 * Track e-commerce Add to Cart in GA4
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}) {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: item.price * (item.quantity || 1),
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || "Apparel",
        price: item.price,
        quantity: item.quantity || 1,
      },
    ],
  });
  trackClarityEvent("add_to_cart");
}

/**
 * Track e-commerce Purchase in GA4
 */
export function trackPurchase(order: {
  transactionId: string;
  value: number;
  tax?: number;
  shipping?: number;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  trackEvent("purchase", {
    transaction_id: order.transactionId,
    currency: "INR",
    value: order.value,
    tax: order.tax || 0,
    shipping: order.shipping || 0,
    items: order.items?.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
  trackClarityEvent("purchase_completed");
}
