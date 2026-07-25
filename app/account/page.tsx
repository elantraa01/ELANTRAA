"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/home/ProductCard";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

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
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED";
  itemsCount: number;
  sampleImage: string;
  itemsSummary: string;
}

export default function AccountPage() {
  const { data: session } = useSession();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "wishlist">("orders");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Addresses & Orders State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [ordersList, setOrdersList] = useState<OrderHistoryItem[]>([]);

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
        const res = await fetch("/api/user/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.orders) setOrdersList(data.orders);
          if (data.addresses) setAddresses(data.addresses);
        }
      } catch (err) {
        console.warn("Failed to load user account data", err);
      }
    }
    loadUserData();
  }, [session]);

  // Wishlist Items
  const wishlistProducts: Product[] = [];

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.line1 || !newAddr.city || !newAddr.pincode) return;

    const created: SavedAddress = {
      id: `addr-${Date.now()}`,
      line1: newAddr.line1,
      line2: newAddr.line2,
      city: newAddr.city,
      state: newAddr.state,
      pincode: newAddr.pincode,
      country: newAddr.country,
      isDefault: newAddr.isDefault || addresses.length === 0,
    };

    setAddresses([...addresses, created]);
    setShowAddressModal(false);
    setNewAddr({ line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
    showNotification("New saved address added successfully.");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    showNotification("Address removed.");
  };

  const userName = session?.user?.name || "Victoria Sterling";
  const userEmail = session?.user?.email || "client@elantraa.com";
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* User Profile Header */}
          <div className="bg-[#171717] text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden border border-[#C9A648]/30 mb-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#AA771C] via-[#D4AF37] to-[#F3E5AB] text-[#171717] font-serif font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white">
                {userName[0]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-serif text-white">{userName}</h1>
                  <span className="px-2.5 py-0.5 bg-[#C9A648]/20 text-[#D4AF37] border border-[#C9A648]/40 text-[10px] uppercase font-bold tracking-widest rounded">
                    {userRole}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-light mt-0.5">{userEmail}</p>
                <p className="text-[11px] text-[#D4AF37] uppercase tracking-widest mt-1">
                  ✦ ELANTRAA Privé VIP Connoisseur
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-widest rounded font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Account Tabs Header */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto space-x-4 sm:space-x-8 no-scrollbar">
            {[
              { id: "orders" as const, label: "Order History", icon: "📦" },
              { id: "addresses" as const, label: "Saved Addresses", icon: "📍" },
              { id: "wishlist" as const, label: "My Wishlist", icon: "❤️" },
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
              <h3 className="text-lg font-serif font-semibold text-gray-900">Past Orders & Track Shipments</h3>
              {ordersList.length > 0 ? (
                <div className="space-y-4">
                  {ordersList.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FAF8F5] rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-20 rounded bg-white overflow-hidden border border-gray-200 shrink-0">
                          <Image src={order.sampleImage} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-serif font-bold text-gray-900">{order.id}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{order.itemsSummary}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Placed on {order.date}</p>
                        </div>
                      </div>

                      <div className="sm:text-right w-full sm:w-auto flex justify-between sm:block pt-3 sm:pt-0 border-t sm:border-0 border-gray-200">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total Amount</p>
                          <p className="text-base font-semibold text-gray-900 font-sans">
                            &#8377;{order.totalAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <button
                          onClick={() => showNotification(`Tracking info sent for ${order.id}`)}
                          className="mt-2 text-xs text-[#C9A648] hover:underline uppercase font-medium"
                        >
                          Track Package &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
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

          {/* TAB 3: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-serif font-semibold text-gray-900">Your Saved Wishlist ({wishlistProducts.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={true}
                    onQuickView={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => {
                      addItem(p);
                      showNotification(`Added ${p.name} to shopping bag.`);
                    }}
                    onToggleWishlist={() => showNotification("Wishlist updated.")}
                  />
                ))}
              </div>
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
