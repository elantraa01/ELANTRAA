"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { LogoShimmer } from "@/components/ui/LuxurySkeleton";

interface SavedAddressItem {
  id: string;
  name?: string;
  phone?: string;
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
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressModalError, setAddressModalError] = useState("");

  const [addressModalForm, setAddressModalForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

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
                  fullName: defaultAddr.name || prev.fullName || session.user?.name || "",
                  phone: defaultAddr.phone || prev.phone || "",
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
      fullName: addr.name || prev.fullName || session?.user?.name || "",
      phone: addr.phone || prev.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
    }));
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressModalError("");
    setAddressModalForm({
      name: formData.fullName || session?.user?.name || "",
      phone: formData.phone || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: savedAddresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: SavedAddressItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAddressId(addr.id);
    setAddressModalError("");
    setAddressModalForm({
      name: addr.name || formData.fullName || session?.user?.name || "",
      phone: addr.phone || formData.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      isDefault: Boolean(addr.isDefault),
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      const res = await fetch(`/api/user/address?id=${encodeURIComponent(addrId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const remaining = savedAddresses.filter((a) => a.id !== addrId);
        setSavedAddresses(remaining);
        if (selectedAddressId === addrId) {
          if (remaining.length > 0) {
            handleSelectSavedAddress(remaining[0]);
          } else {
            setSelectedAddressId("");
            setFormData((prev) => ({
              ...prev,
              line1: "",
              line2: "",
              city: "",
              state: "",
              pincode: "",
            }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  const handleSaveAddressModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressModalForm.name.trim() || !addressModalForm.phone.trim() || !addressModalForm.line1.trim() || !addressModalForm.city.trim() || !addressModalForm.pincode.trim()) {
      setAddressModalError("Please fill in Full Name, Phone Number, Address Line 1, City, and Pincode.");
      return;
    }

    setAddressSubmitting(true);
    setAddressModalError("");

    try {
      const isEditing = Boolean(editingAddressId);
      const url = "/api/user/address";
      const method = isEditing ? "PATCH" : "POST";
      const payload = isEditing
        ? { id: editingAddressId, ...addressModalForm }
        : addressModalForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.address) {
        throw new Error(data.error || "Failed to save address");
      }

      const savedAddr: SavedAddressItem = data.address;

      if (isEditing) {
        setSavedAddresses((prev) =>
          prev.map((a) => (a.id === savedAddr.id ? savedAddr : (savedAddr.isDefault ? { ...a, isDefault: false } : a)))
        );
      } else {
        setSavedAddresses((prev) => [
          ...prev.map((a) => (savedAddr.isDefault ? { ...a, isDefault: false } : a)),
          savedAddr,
        ]);
      }

      handleSelectSavedAddress(savedAddr);
      setIsAddressModalOpen(false);
    } catch (err) {
      setAddressModalError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setAddressSubmitting(false);
    }
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
      // 100% Cash on Delivery
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
      // Online Payment (Full Online or 50% Advance Partial COD)
      try {
        const isPartialCod = formData.paymentMethod === "PARTIAL_COD";

        const rzpOrderRes = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            promoCode,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            paymentMethod: formData.paymentMethod,
            isPartialCod,
          }),
        });

        const rzpData = await rzpOrderRes.json();
        if (!rzpOrderRes.ok || !rzpData.success || !rzpData.order || !rzpData.key) {
          throw new Error(rzpData.error || "Unable to initialize Razorpay payment.");
        }

        const rzpOrder = rzpData.order;
        const razorpayKey = rzpData.key;

        const options = {
          key: razorpayKey,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || "INR",
          name: "ELANTRAA",
          description: isPartialCod
            ? `50% Advance Payment (${items.length} Items)`
            : `Selection (${items.length} Items)`,
          image: "/images/logo/logo.png",
          order_id: rzpOrder.id,
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              // 1. Verify Payment Signature
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
                throw new Error(verifyData.error || "Payment verification failed.");
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
          throw new Error("Razorpay checkout could not load. Please refresh and try again.");
        }
      } catch (err) {
        console.error("Online Checkout Error:", err);
        alert(err instanceof Error ? err.message : "Payment was not completed. Please try again.");
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
        <div className="max-w-xl mx-auto px-4 py-24 text-center flex items-center justify-center">
          <LogoShimmer size="md" />
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
              {/* Account / User Identifier Banner */}
              <div className="bg-[#FAF8F5] px-5 py-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#171717] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    {(session?.user?.name || session?.user?.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{session?.user?.name || "Customer"}</p>
                    <p className="text-[11px] text-gray-500">{session?.user?.email}</p>
                  </div>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <span>🔒</span> Verified Checkout
                </span>
              </div>

              {/* 1. Delivery Address (Saved Addresses Only + Add / Edit Option) */}
              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-gray-900">
                    1. Delivery Address
                  </h3>
                  <button
                    type="button"
                    onClick={openAddAddressModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#C9A648] text-[#D4AF37] hover:text-black text-xs font-semibold uppercase tracking-wider rounded transition-all shadow-sm"
                  >
                    <span>+</span>
                    <span>Add New Address</span>
                  </button>
                </div>

                {savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      const recipientName = addr.name || formData.fullName || session?.user?.name || "Customer";
                      const recipientPhone = addr.phone || formData.phone;

                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-white border-[#C9A648] shadow-md ring-2 ring-[#C9A648]/40"
                              : "bg-white/80 border-gray-200 hover:border-gray-400 hover:bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? "border-[#C9A648] bg-[#C9A648]"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="text-xs font-bold text-gray-900">
                                  {recipientName}
                                </span>
                              </div>

                              {addr.isDefault && (
                                <span className="text-[9px] bg-[#C9A648]/15 text-[#967727] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>

                            {recipientPhone && (
                              <p className="text-xs text-gray-600 font-medium pl-6 mb-1 flex items-center gap-1.5">
                                <span className="text-gray-400">📞</span>
                                <span>{recipientPhone}</span>
                              </p>
                            )}

                            <p className="text-xs text-gray-700 leading-relaxed font-light pl-6">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}
                              <br />
                              {addr.city}, {addr.state} - <strong className="font-semibold text-gray-900">{addr.pincode}</strong>
                              <br />
                              <span className="text-gray-500 text-[11px]">{addr.country}</span>
                            </p>
                          </div>

                          {/* Card Action Buttons (Edit & Delete) */}
                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-3 pl-6">
                            <button
                              type="button"
                              onClick={(e) => openEditAddressModal(addr, e)}
                              className="text-xs text-[#967727] hover:text-[#735816] font-semibold flex items-center gap-1 hover:underline"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 hover:underline"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#C9A648]/30 mx-auto flex items-center justify-center text-xl text-[#C9A648]">
                      &#128205;
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">No saved addresses found</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Please add your recipient address to proceed with order delivery.</p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddAddressModal}
                      className="px-5 py-2 bg-[#171717] hover:bg-[#C9A648] text-[#D4AF37] hover:text-black text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
                    >
                      + Add Address Now
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-gray-900">
                    2. Payment Method
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-bold">
                    100% Secure
                  </span>
                </div>

                {(() => {
                  const netProductAmount = Math.max(0, subtotal - discount);
                  const advancePayable = Math.min(total, Math.ceil(netProductAmount * 0.5) + shipping);
                  const codBalance = Math.max(0, total - advancePayable);

                  const paymentOptions = [
                    {
                      id: "ONLINE",
                      label: "Pay Full Online (UPI, Cards, Netbanking)",
                      desc: "Instant and 100% secure payment. Zero hassle upon delivery.",
                      badge: "Recommended",
                    },
                    {
                      id: "PARTIAL_COD",
                      label: "50% Advance Online + 50% on Delivery (COD)",
                      desc: `Pay 50% + shipping now (\u20B9${advancePayable.toLocaleString("en-IN")}), and remaining balance (\u20B9${codBalance.toLocaleString("en-IN")}) in cash/UPI upon package delivery.`,
                      badge: "50% Advance",
                    },
                  ];

                  return (
                    <div className="space-y-3">
                      {paymentOptions.map((pm) => {
                        const isSelected = formData.paymentMethod === pm.id;
                        return (
                          <label
                            key={pm.id}
                            className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-white border-[#C9A648] ring-2 ring-[#C9A648]/40 shadow-sm"
                                : "bg-white/70 border-gray-200 hover:border-gray-400 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={pm.id}
                              checked={isSelected}
                              onChange={handleChange}
                              className="mt-1 accent-[#C9A648] w-4 h-4"
                            />
                            <div className="ml-3 text-xs flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-gray-900">{pm.label}</span>
                                {pm.badge && (
                                  <span
                                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      pm.id === "PARTIAL_COD"
                                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                                        : "bg-[#C9A648]/15 text-[#967727]"
                                    }`}
                                  >
                                    {pm.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 font-light mt-0.5 leading-relaxed">{pm.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  );
                })()}
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

              {/* Partial COD Breakdown Notice */}
              {(() => {
                const netProductAmount = Math.max(0, subtotal - discount);
                const advancePayable = Math.min(total, Math.ceil(netProductAmount * 0.5) + shipping);
                const codBalance = Math.max(0, total - advancePayable);

                if (formData.paymentMethod === "PARTIAL_COD") {
                  return (
                    <div className="p-3.5 bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-300/70 rounded-xl space-y-2.5 text-xs">
                      <div className="flex justify-between items-center font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <span>💳</span> Due Online Now (50% + Shipping)
                        </span>
                        <span className="text-sm text-[#967727]">&#8377;{advancePayable.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-700 pt-1.5 border-t border-amber-200/60">
                        <span className="flex items-center gap-1.5">
                          <span>📦</span> Remaining COD on Delivery
                        </span>
                        <span className="font-bold text-gray-900">&#8377;{codBalance.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}

              <div className="flex justify-between items-baseline text-lg font-serif font-bold text-gray-900">
                <span>Total Order Value</span>
                <span className="text-2xl text-[#C9A648]">&#8377;{total.toLocaleString("en-IN")}</span>
              </div>

              {(() => {
                const netProductAmount = Math.max(0, subtotal - discount);
                const advancePayable = Math.min(total, Math.ceil(netProductAmount * 0.5) + shipping);

                return (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs tracking-[0.2em] uppercase rounded-md shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <span>
                      {loading
                        ? "Connecting to Payment Gateway..."
                        : formData.paymentMethod === "PARTIAL_COD"
                        ? `Pay 50% Advance \u2022 \u20B9${advancePayable.toLocaleString("en-IN")}`
                        : `Pay Online \u2022 \u20B9${total.toLocaleString("en-IN")}`}
                    </span>
                  </button>
                );
              })()}

              <div className="text-[10px] text-center text-gray-400 space-y-1">
                <p>🔒 256-bit Encrypted & Secure Online Checkout</p>
                <p>✦ Instant Order Confirmation Email Notification</p>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Add / Edit Address Modal Dialog */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Address details will be saved to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {addressModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {addressModalError}
              </div>
            )}

            <form onSubmit={handleSaveAddressModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Kapoor"
                    value={addressModalForm.name}
                    onChange={(e) => setAddressModalForm({ ...addressModalForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={addressModalForm.phone}
                    onChange={(e) => setAddressModalForm({ ...addressModalForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat / House / Building No., Street"
                  value={addressModalForm.line1}
                  onChange={(e) => setAddressModalForm({ ...addressModalForm, line1: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Landmark, Area, Apartment Name"
                  value={addressModalForm.line2}
                  onChange={(e) => setAddressModalForm({ ...addressModalForm, line2: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={addressModalForm.city}
                    onChange={(e) => setAddressModalForm({ ...addressModalForm, city: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={addressModalForm.state}
                    onChange={(e) => setAddressModalForm({ ...addressModalForm, state: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400001"
                    value={addressModalForm.pincode}
                    onChange={(e) => setAddressModalForm({ ...addressModalForm, pincode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={addressModalForm.country}
                    onChange={(e) => setAddressModalForm({ ...addressModalForm, country: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#C9A648]"
                  >
                    <option value="India">India</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultAddress"
                  checked={addressModalForm.isDefault}
                  onChange={(e) => setAddressModalForm({ ...addressModalForm, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-[#C9A648] focus:ring-[#C9A648]"
                />
                <label htmlFor="isDefaultAddress" className="text-xs text-gray-700 select-none">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
                >
                  {addressSubmitting ? "Saving..." : editingAddressId ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
