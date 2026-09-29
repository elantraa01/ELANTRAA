/**
 * Analytics Utility Helper
 * Safe wrappers for Google Analytics 4 (gtag), Microsoft Clarity, and Meta Pixel (Facebook fbq).
 * Works seamlessly in client-side components without crashing if tracking is disabled or blocked.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-PZWHKPYS60";
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || "ydeyxjad5n";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1088936753845197";

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
 * Track Meta Pixel (Facebook) Standard Event
 */
export function trackFbq(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("track", event, params);
    } else {
      window.fbq("track", event);
    }
  }
}

/**
 * Track Meta Pixel Custom Event
 */
export function trackFbqCustom(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("trackCustom", eventName, params);
    } else {
      window.fbq("trackCustom", eventName);
    }
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
 * Track e-commerce Add to Cart in GA4 and Meta Pixel
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}) {
  const quantity = item.quantity || 1;
  const value = item.price * quantity;

  // Google Analytics 4
  trackEvent("add_to_cart", {
    currency: "INR",
    value,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || "Apparel",
        price: item.price,
        quantity,
      },
    ],
  });

  // Microsoft Clarity
  trackClarityEvent("add_to_cart");

  // Meta Pixel
  trackFbq("AddToCart", {
    content_name: item.name,
    content_ids: [item.id],
    content_type: "product",
    value,
    currency: "INR",
  });
}

/**
 * Track Initiate Checkout in GA4 and Meta Pixel
 */
export function trackInitiateCheckout(data: {
  value: number;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  // Google Analytics 4
  trackEvent("begin_checkout", {
    currency: "INR",
    value: data.value,
    items: data.items?.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  // Microsoft Clarity
  trackClarityEvent("begin_checkout");

  // Meta Pixel
  trackFbq("InitiateCheckout", {
    value: data.value,
    currency: "INR",
    content_ids: data.items?.map((item) => item.id),
    content_type: "product",
    num_items: data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  });
}

/**
 * Track e-commerce Purchase in GA4 and Meta Pixel
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
  // Google Analytics 4
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

  // Microsoft Clarity
  trackClarityEvent("purchase_completed");

  // Meta Pixel
  trackFbq("Purchase", {
    value: order.value,
    currency: "INR",
    content_ids: order.items?.map((item) => item.id),
    content_type: "product",
    num_items: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  });
}
