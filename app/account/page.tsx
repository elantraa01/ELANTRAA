"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";
import { LogoShimmer } from "@/components/ui/LuxurySkeleton";

import { useSearchParams } from "next/navigation";

interface SavedAddress {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface OrderHistoryItem {
  id: string;
  date: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  itemsCount: number;
  sampleImage: string;
  itemsSummary: string;
}

function AccountPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "wishlist") {
      router.replace("/wishlist");
    } else if (tabParam === "addresses" || tabParam === "orders") {
      setActiveTab(tabParam);
    }
  }, [searchParams, router]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Addresses & Orders State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [ordersList, setOrdersList] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const [newAddr, setNewAddr] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    async function loadUserData() {
      if (!session?.user) return;
      try {
        const [ordersRes, addrRes] = await Promise.all([
          fetch("/api/user/orders"),
          fetch("/api/user/address"),
        ]);

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          if (data.orders) setOrdersList(data.orders);
        }

        if (addrRes.ok) {
          const data = await addrRes.json();
          if (data.addresses) setAddresses(data.addresses);
        }
      } catch (err) {
        console.warn("Failed to load user account data", err);
      }
    }
    loadUserData();
  }, [session]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.line1 || !newAddr.city || !newAddr.pincode) return;

    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          setAddresses((prev) => [...prev, data.address]);
          setShowAddressModal(false);
          setNewAddr({ line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
          showNotification("New saved address added successfully to your profile!");
        }
      } else {
        showNotification("Failed to save address.");
      }
    } catch {
      showNotification("Error saving address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/address?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        showNotification("Address removed from profile.");
      }
    } catch {
      showNotification("Failed to delete address.");
    }
  };

  if (status === "loading" || !session?.user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LogoShimmer size="lg" />
      </div>
    );
  }

  const userName = session.user.name || "ELANTRAA Customer";
  const userEmail = session.user.email || "";
  const userRole = (session?.user as { role?: string })?.role || "CUSTOMER";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
            <span>&#10022;</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My Account</span>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-28 sm:pb-16">
          {/* User Profile Header */}
          <div className="bg-[#171717] text-white p-5 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 relative overflow-hidden border border-[#C9A648]/30 mb-8 sm:mb-10">
            <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#AA771C] via-[#D4AF37] to-[#F3E5AB] text-[#171717] font-serif font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-white shrink-0">
                {userName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-serif text-white truncate max-w-[180px] sm:max-w-none">
                    {userName}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#C9A648]/20 text-[#D4AF37] border border-[#C9A648]/40 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest rounded shrink-0">
                    {userRole}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-light mt-0.5 truncate">{userEmail}</p>
                <p className="text-[10px] sm:text-[11px] text-[#D4AF37] uppercase tracking-widest mt-1 font-medium">
                  ✦ ELANTRAA Privé VIP Connoisseur
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-widest rounded font-semibold transition-colors text-center shrink-0"
            >
              Sign Out
            </button>
          </div>

          {/* Account Tabs Header */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto space-x-4 sm:space-x-8 no-scrollbar">
            {[
              { id: "orders" as const, label: "Order History", icon: "📦" },
              { id: "addresses" as const, label: "Saved Addresses", icon: "📍" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#C9A648] text-[#C9A648]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-serif font-semibold text-gray-900">Past Orders & Live Shipments</h3>
              {ordersList.length > 0 ? (
                <div className="space-y-6">
                  {ordersList.map((order) => {
                    const statusSteps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
                    const currentStepIndex = statusSteps.indexOf(order.status) !== -1 ? statusSteps.indexOf(order.status) : 1;

                    return (
                      <div
                        key={order.id}
                        className="bg-[#FAF8F5] rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-5 sm:space-y-6 overflow-hidden"
                      >
                        {/* Header & Main Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 w-full">
                            <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded bg-white overflow-hidden border border-gray-200 shrink-0">
                              <Image src={order.sampleImage} alt="" fill className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="font-serif font-bold text-gray-900 text-xs sm:text-base break-all">
                                  {order.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded shrink-0 ${
                                    order.status === "DELIVERED"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : order.status === "SHIPPED"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "CANCELLED"
                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{order.itemsSummary}</p>
                              <p className="text-[11px] text-gray-400">Placed on {order.date}</p>
                            </div>
                          </div>

                          <div className="sm:text-right w-full sm:w-auto flex items-center justify-between sm:block pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total Amount</p>
                              <p className="text-base font-semibold text-gray-900 font-sans">
                                &#8377;{order.totalAmount.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const printWin = window.open("", "_blank");
                                const logoUrl = `${window.location.origin}/images/logo/logo.png`;
                                if (printWin) {
                                  printWin.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                      <meta charset="utf-8" />
                                      <title>Invoice - ${order.id}</title>
                                      <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
                                        * { box-sizing: border-box; margin: 0; padding: 0; }
                                        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #171717; background: #f8fafc; padding: 40px 20px; line-height: 1.5; font-size: 13px; }
                                        .invoice-card { max-width: 820px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 44px; background: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
                                        .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C9A648; padding-bottom: 24px; margin-bottom: 28px; }
                                        .logo-container { display: flex; flex-col; gap: 4px; }
                                        .logo-img { height: 44px; object-fit: contain; }
                                        .brand-fallback { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700; letter-spacing: 3px; color: #171717; text-transform: uppercase; }
                                        .invoice-badge { text-align: right; }
                                        .invoice-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; color: #C9A648; letter-spacing: 2.5px; text-transform: uppercase; }
                                        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 32px; background: #FAF8F5; padding: 22px 26px; border-radius: 10px; border: 1px solid #f0e6d2; }
                                        .meta-box h4 { font-family: 'Cinzel', serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C9A648; margin-bottom: 8px; font-weight: 700; }
                                        .meta-box p { color: #4b5563; font-size: 12px; margin-bottom: 4px; }
                                        .meta-box p strong { color: #111827; }
                                        .status-pill { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
                                        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                        .table th { background: #171717; color: #D4AF37; font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 16px; text-align: left; }
                                        .table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #374151; font-size: 12px; }
                                        .table tr:nth-child(even) { background-color: #f8fafc; }
                                        .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 24px; padding-top: 16px; }
                                        .authenticity-note { max-width: 400px; font-size: 11px; color: #6b7280; line-height: 1.6; border-left: 3px solid #C9A648; padding-left: 14px; }
                                        .totals-box { width: 280px; }
                                        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #4b5563; }
                                        .totals-row.grand-total { border-top: 2px solid #C9A648; padding-top: 12px; margin-top: 8px; font-size: 15px; font-weight: 700; color: #171717; }
                                        .grand-total-amount { color: #C9A648; }
                                        .footer-stamp { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; }
                                        @media print { body { padding: 0; background: none; } .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; } @page { margin: 15mm; } }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="invoice-card">
                                        <div class="header-bar">
                                          <div class="logo-container">
                                            <img src="${logoUrl}" alt="ELANTRAA" class="logo-img" onError="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                                            <div class="brand-fallback" style="display:none;">ELANTRAA</div>
                                            <p style="font-size: 10px; color: #6b7280; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">HAUTE COUTURE & LUXURY ATELIER</p>
                                            <p style="font-size: 10px; color: #9ca3af; margin-top: 2px;">GSTIN: 27AAAAA0000A1Z5 • Reg. MH-400050</p>
                                          </div>
                                          <div class="invoice-badge">
                                            <div class="invoice-title">TAX INVOICE</div>
                                            <p style="font-size: 11px; color: #374151; font-weight: 700; margin-top: 4px; font-family: monospace;">INV-${order.id.toUpperCase()}</p>
                                            <p style="font-size: 10px; color: #9ca3af; margin-top: 2px;">Date: ${order.date}</p>
                                          </div>
                                        </div>

                                        <div class="meta-grid">
                                          <div class="meta-box">
                                            <h4>BILLED TO / CUSTOMER DETAILS</h4>
                                            <p><strong>Customer Name:</strong> ${userName}</p>
                                            <p><strong>Customer Email:</strong> ${session?.user?.email}</p>
                                            <p><strong>Payment Mode:</strong> Online Verified (Razorpay / UPI)</p>
                                          </div>
                                          <div class="meta-box">
                                            <h4>ORDER & DISPATCH SUMMARY</h4>
                                            <p><strong>Order Ref:</strong> ${order.id}</p>
                                            <p><strong>Fulfillment Status:</strong> <span class="status-pill">${order.status}</span></p>
                                            <p><strong>Courier Mode:</strong> ELANTRAA Express Atelier Delivery</p>
                                          </div>
                                        </div>

                                        <table class="table">
                                          <thead>
                                            <tr>
                                              <th style="width: 50px;">#</th>
                                              <th>COUTURE ITEM DESCRIPTION</th>
                                              <th style="text-align: center; width: 60px;">QTY</th>
                                              <th style="text-align: right; width: 120px;">UNIT PRICE</th>
                                              <th style="text-align: right; width: 120px;">AMOUNT</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td>01</td>
                                              <td>
                                                <strong style="color: #111827; font-family: 'Cinzel', serif; font-size: 13px;">${order.itemsSummary}</strong>
                                                <br />
                                                <span style="font-size: 10px; color: #6b7280;">Bespoke Organic Silk Silhouette with Gold Accent Embroidery</span>
                                              </td>
                                              <td style="text-align: center; font-weight: 600;">${order.itemsCount || 1}</td>
                                              <td style="text-align: right;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
                                              <td style="text-align: right; font-weight: 700; color: #111827;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
                                            </tr>
                                          </tbody>
                                        </table>

                                        <div class="summary-section">
                                          <div class="authenticity-note">
                                            <p style="font-weight: 700; color: #171717; margin-bottom: 4px; font-family: 'Cinzel', serif;">✦ ELANTRAA PROMISE OF AUTHENTICITY</p>
                                            <p>Each piece is individually handcrafted from certified organic silk and precious threadwork. For care guidelines or support, connect with our Atelier Concierge at <strong>+91 9015342951</strong> or <strong>elantraa.01@gmail.com</strong>.</p>
                                          </div>

                                          <div class="totals-box">
                                            <div class="totals-row">
                                              <span>Subtotal</span>
                                              <span>₹${order.totalAmount.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div class="totals-row">
                                              <span>Taxes (CGST 2.5% + SGST 2.5%)</span>
                                              <span>Included</span>
                                            </div>
                                            <div class="totals-row">
                                              <span>Express Courier Shipping</span>
                                              <span style="color: #047857; font-weight: 700;">FREE</span>
                                            </div>
                                            <div class="totals-row grand-total">
                                              <span>TOTAL PAID</span>
                                              <span class="grand-total-amount">₹${order.totalAmount.toLocaleString("en-IN")}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div class="footer-stamp">
                                          ✦ COMPUTER GENERATED TAX INVOICE • NO PHYSICAL SIGNATURE REQUIRED • ELANTRAA LUXURY COUTURE ✦
                                        </div>
                                      </div>

                                      <script>
                                        window.onload = function() {
                                          setTimeout(function() {
                                            window.print();
                                          }, 400);
                                        };
                                      </script>
                                    </body>
                                    </html>
                                  `);
                                  printWin.document.close();
                                }
                              }}
                              className="sm:mt-2 inline-flex items-center space-x-1 text-xs text-[#C9A648] hover:underline font-semibold uppercase tracking-wider"
                            >
                              <span>🖨 Print Invoice</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Tracking Progress Bar Timeline */}
                        <div className="pt-1">
                          <p className="text-[11px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                            Shipment Progress Timeline:
                          </p>
                          <div className="relative flex items-center justify-between px-1 sm:px-2">
                            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0 rounded-full" />
                            <div
                              className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-[#C9A648] z-0 rounded-full transition-all duration-500"
                              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                            />

                            {statusSteps.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex;
                              return (
                                <div key={step} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors ${
                                      isCompleted
                                        ? "bg-[#171717] text-[#D4AF37] border-2 border-[#C9A648]"
                                        : "bg-white text-gray-400 border-2 border-gray-300"
                                    }`}
                                  >
                                    {isCompleted ? "✓" : idx + 1}
                                  </div>
                                  <span
                                    className={`text-[9px] sm:text-[10px] uppercase font-semibold mt-1 tracking-tight sm:tracking-normal ${
                                      isCompleted ? "text-gray-900 font-bold" : "text-gray-400"
                                    }`}
                                  >
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No past orders found.</p>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-semibold text-gray-900">Your Delivery Addresses</h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-[#171717] text-[#D4AF37] text-xs uppercase tracking-widest rounded font-medium hover:bg-[#C9A648] hover:text-white transition-colors"
                >
                  + Add New Address
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-[#FAF8F5] rounded-xl p-6 border border-gray-200 shadow-sm relative flex flex-col justify-between"
                    >
                      <div>
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 px-2 py-0.5 bg-[#C9A648] text-white text-[10px] font-bold uppercase rounded">
                            DEFAULT ADDRESS
                          </span>
                        )}
                        <p className="text-xs font-semibold text-gray-900 mb-1">{userName}</p>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                        </p>
                        <p className="text-xs text-gray-600 font-light">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-600 font-light">{addr.country}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-4 text-xs">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:underline font-medium"
                        >
                          Delete Address
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF8F5] rounded-xl p-8 text-center border border-gray-200 space-y-3">
                  <p className="text-xs text-gray-500 italic">No saved delivery addresses found.</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs text-[#C9A648] font-bold uppercase tracking-widest hover:underline"
                  >
                    + Add your first address
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700"
            >
              &times;
            </button>
            <h3 className="text-xl font-serif text-gray-900 mb-4">Add New Delivery Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, House / Street Name"
                  value={newAddr.line1}
                  onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Landmark, Area"
                  value={newAddr.line2}
                  onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="400026"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={newAddr.country}
                    onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  >
                    <option value="India">India</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-widest font-medium rounded transition-colors"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => {
          addItem(p);
          showNotification(`Added ${p.name} to shopping bag.`);
        }}
      />

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <LogoShimmer size="lg" />
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
