"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";

interface SavedAddressItem {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, discount, shipping, total, promoCode, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    paymentMethod: "ONLINE",
    saveAddress: true,
  });

  // Pre-fill user details and fetch saved addresses if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || session.user?.email || "",
        fullName: prev.fullName || session.user?.name || "",
      }));

      const fetchUserAddresses = async () => {
        try {
          const res = await fetch("/api/user/address");
          if (res.ok) {
            const data = await res.json();
            if (data.addresses && data.addresses.length > 0) {
              setSavedAddresses(data.addresses);
              const defaultAddr = data.addresses.find((a: SavedAddressItem) => a.isDefault) || data.addresses[0];
              if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                setFormData((prev) => ({
                  ...prev,
                  line1: defaultAddr.line1 || "",
                  line2: defaultAddr.line2 || "",
                  city: defaultAddr.city || "",
                  state: defaultAddr.state || "",
                  pincode: defaultAddr.pincode || "",
                  country: defaultAddr.country || "India",
                }));
              }
            }
          }
        } catch (err) {
          console.warn("Failed to fetch user addresses in checkout", err);
        }
      };

      fetchUserAddresses();
    }
  }, [session]);

  const handleSelectSavedAddress = (addr: SavedAddressItem) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
    }));
  };

  // Dynamically load Razorpay SDK script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (status !== "authenticated" || !session?.user) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    setLoading(true);

    const orderPayload = {
      userId: (session?.user as { id?: string })?.id,
      userEmail: session?.user?.email,
      shippingAddress: {
        email: formData.email || session?.user?.email,
        fullName: formData.fullName || session?.user?.name,
        phone: formData.phone,
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      },
      items,
      totalAmount: total,
      promoCode,
      paymentMethod: formData.paymentMethod,
    };

    if (formData.paymentMethod === "COD") {
      // Direct Cash on Delivery Checkout
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success || !resData.orderId) {
          throw new Error(resData.error || "Failed to place order");
        }

        clearCart();
        router.push(`/checkout/success?orderId=${resData.orderId}`);
      } catch (err) {
        console.error("COD checkout error:", err);
        alert(err instanceof Error ? err.message : "Could not place order. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Razorpay online payment checkout
      try {
        const rzpOrderRes = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            promoCode,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
          }),
        });

        const rzpData = await rzpOrderRes.json();
        const rzpOrder = rzpData.order;
        const razorpayKey = rzpData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_elantraa_key_123";

        const options = {
          key: razorpayKey,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || "INR",
          name: "ELANTRAA Haute Couture",
          description: `Haute Couture Selection (${items.length} Items)`,
          image: "/images/logo/logo.png",
          order_id: rzpOrder.id,
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              // 1. Verify Razorpay Payment Signature
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                console.warn("Payment verification API warning:", verifyData.error);
              }

              // 2. Create Order record with payment metadata
              const createOrderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...orderPayload,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const finalData = await createOrderRes.json();
              if (!createOrderRes.ok || !finalData.success) {
                throw new Error(finalData.error || "Failed to finalize order after payment.");
              }

              clearCart();
              const finalId = finalData.orderId || `ELN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
              router.push(`/checkout/success?orderId=${finalId}`);
            } catch (err) {
              console.error("Order completion error:", err);
              alert(err instanceof Error ? err.message : "Payment succeeded but order creation failed. Please contact support.");
              setLoading(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#C9A648",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const win = window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } };
        if (win.Razorpay) {
          const rzp = new win.Razorpay(options);
          rzp.open();
        } else {
          // Fallback if Razorpay SDK script is blocked in dev environment
          const createOrderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          });
          const finalData = await createOrderRes.json();
          if (!createOrderRes.ok || !finalData.success) {
            throw new Error(finalData.error || "Failed to process order.");
          }
          clearCart();
          router.push(`/checkout/success?orderId=${finalData.orderId}`);
        }
      } catch (err) {
        console.error("Razorpay Checkout Error:", err);
        alert(err instanceof Error ? err.message : "Razorpay payment error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-gray-500 font-light mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded"
          >
            Explore Shop Catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Checking your account...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <span className="text-[11px] tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
            Login Required
          </span>
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mt-2 mb-2">
            Please Sign In Before Payment
          </h2>
          <p className="text-xs text-gray-500 font-light mb-6">
            Your cart is ready. Sign in first so your order, address, cart, and wishlist stay saved to your account.
          </p>
          <Link
            href="/login?callbackUrl=/checkout"
            className="inline-block px-8 py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded"
          >
            Sign In To Continue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Breadcrumb Navigation */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/cart" className="hover:text-[#C9A648] transition-colors">
                Cart
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Checkout</span>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
              SECURE CHECKOUT
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
              Checkout
            </h1>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left Column: Shipping Address Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* Saved Address Picker if available */}
              {savedAddresses.length > 0 && (
                <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#C9A648]/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <span>&#128205;</span> Select Saved Address
                    </h3>
                    <span className="text-[11px] text-[#C9A648] font-medium uppercase tracking-wider">
                      Auto-fills form below
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-white border-[#C9A648] shadow-md ring-1 ring-[#C9A648]"
                              : "bg-white/70 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900 truncate">
                              {addr.line1}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-[#C9A648]/20 text-[#967727] px-1.5 py-0.5 rounded font-bold uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 truncate">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-gray-900">
                    1. Contact Information
                  </h3>
                  <span className="text-[11px] text-[#C9A648] font-medium">
                    Signed In Checkout
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#C9A648]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#C9A648]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200 space-y-4">
                <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-3">
                  2. Shipping Address
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Radhika Kapoor"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="line1"
                      required
                      placeholder="Flat / Building / House No., Street Name"
                      value={formData.line1}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="line2"
                      placeholder="Landmark, Area, Apartment Name"
                      value={formData.line2}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold uppercase text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block font-semibold uppercase text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#C9A648]"
                    >
                      <option value="India">India</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200 space-y-4">
                <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-3 flex items-center justify-between">
                  <span>3. Payment Gateway</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-bold">
                    Razorpay Active
                  </span>
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      id: "ONLINE",
                      label: "Razorpay Secure (UPI, Cards, Netbanking)",
                      desc: "Instant payment authorization via Razorpay",
                    },
                    {
                      id: "COD",
                      label: "Cash On Delivery (COD)",
                      desc: "Pay in cash or UPI upon package delivery",
                    },
                  ].map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex items-start p-3.5 rounded-lg border cursor-pointer transition-all ${
                        formData.paymentMethod === pm.id
                          ? "bg-white border-[#C9A648] ring-1 ring-[#C9A648]"
                          : "bg-white/60 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={formData.paymentMethod === pm.id}
                        onChange={handleChange}
                        className="mt-0.5 accent-[#C9A648]"
                      />
                      <div className="ml-3 text-xs">
                        <span className="font-semibold text-gray-900 block">{pm.label}</span>
                        <span className="text-gray-500 font-light">{pm.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Review Box */}
            <div className="lg:col-span-5 bg-[#FAF8F5] p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 h-fit sticky top-24">
              <h3 className="text-base font-serif font-semibold text-gray-900 border-b border-gray-200 pb-3">
                Order Summary ({items.length} Items)
              </h3>

              {/* Items Summary */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-14 rounded bg-white shrink-0 overflow-hidden border border-gray-200">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Qty: {item.quantity} • Size: {item.size}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      &#8377;{((item.discountPrice || item.price) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 text-xs text-gray-600 border-t border-b border-gray-200 py-4 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">&#8377;{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promo Savings ({promoCode})</span>
                    <span>- &#8377;{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-semibold text-[#C9A648] uppercase text-[11px]">
                    {shipping === 0 ? "FREE" : `\u20B9${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline text-lg font-serif font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-2xl text-[#C9A648]">&#8377;{total.toLocaleString("en-IN")}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs tracking-[0.2em] uppercase rounded-md shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>
                  {loading
                    ? "Launching Razorpay Modal..."
                    : formData.paymentMethod === "COD"
                    ? "Place COD Order"
                    : `Pay ₹${total.toLocaleString("en-IN")} with Razorpay`}
                </span>
              </button>

              <div className="text-[10px] text-center text-gray-400 space-y-1">
                <p>&#10022; Razorpay Payment & Stock Reservation Enabled</p>
                <p>✦ Instant Order Confirmation Email Notification</p>
              </div>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}
