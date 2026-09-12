export interface ParsedShippingAddress {
  recipientName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  pricing?: Record<string, any>;
}

export function parseAddressDetails(rawAddress?: Record<string, any> | string | null): ParsedShippingAddress | null {
  if (!rawAddress) return null;
  let parsed: Record<string, any> = {};
  if (typeof rawAddress === "string") {
    try {
      parsed = JSON.parse(rawAddress);
    } catch {
      return {
        recipientName: "",
        phone: "",
        email: "",
        line1: rawAddress,
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      };
    }
  } else if (typeof rawAddress === "object" && rawAddress !== null) {
    parsed = rawAddress;
  } else {
    return null;
  }

  const recipientName = String(
    parsed.fullName || parsed.name || parsed.recipientName || parsed.customerName || ""
  ).trim();
  const phone = String(
    parsed.phone || parsed.phoneNumber || parsed.mobile || parsed.contact || ""
  ).trim();
  const email = String(parsed.email || "").trim();
  const line1 = String(parsed.line1 || parsed.addressLine1 || parsed.street || parsed.address || "").trim();
  const line2 = String(parsed.line2 || parsed.addressLine2 || parsed.landmark || "").trim();
  const city = String(parsed.city || "").trim();
  const state = String(parsed.state || parsed.province || "").trim();
  const pincode = String(parsed.pincode || parsed.postalCode || parsed.zip || "").trim();
  const country = String(parsed.country || "India").trim();
  const pricing = typeof parsed.pricing === "object" && parsed.pricing !== null ? parsed.pricing : undefined;

  return {
    recipientName,
    phone,
    email,
    line1,
    line2,
    city,
    state,
    pincode,
    country,
    pricing,
  };
}

export function formatAddress(address?: Record<string, any> | string | null): string {
  const details = parseAddressDetails(address);
  if (!details) return "No shipping address provided.";

  const parts: string[] = [];
  if (details.recipientName) parts.push(details.recipientName);
  if (details.phone) parts.push(`Ph: ${details.phone}`);
  if (details.line1) parts.push(details.line1);
  if (details.line2) parts.push(details.line2);
  const cityStateZip = [details.city, details.state, details.pincode ? `- ${details.pincode}` : ""].filter(Boolean).join(" ");
  if (cityStateZip) parts.push(cityStateZip);
  if (details.country) parts.push(details.country);

  // If standard fields were empty, collect any other primitive non-internal strings
  if (parts.length === 0 && typeof address === "object" && address !== null) {
    for (const [key, value] of Object.entries(address)) {
      if (key !== "pricing" && typeof value !== "object" && value) {
        parts.push(String(value));
      }
    }
  }

  return parts.join(", ") || "No shipping address provided.";
}
