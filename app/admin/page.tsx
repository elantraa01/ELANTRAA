"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Product } from "@/components/home/mockData";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  subcategoriesCount?: number;
  productsCount?: number;
}

interface AdminCollection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  itemCount: string;
  slug: string;
  targetUrl?: string | null;
  isFeatured: boolean;
}

interface AdminOrder {
  id: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  shippingAddress?: Record<string, unknown>;
}

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    orders: number;
    addresses: number;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const userRole = (session?.user as { role?: string })?.role;

  const [activeTab, setActiveTab] = useState<"products" | "categories" | "collections" | "hero" | "orders" | "customers">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  // Hero Banner Form State
  const [heroForm, setHeroForm] = useState({
    announcement: "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000",
    tagline: "AUTUMN / WINTER 2026 COLLECTION",
    title: "ELANTRAA",
    highlight: "& Timeless Elegance",
    description: "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
    buttonText: "Explore Collection",
    buttonLink: "/shop",
    bgImage: "/images/hero/hero_banner.png",
  });

  // Product Modal Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: 4999,
    discountPrice: "",
    categoryName: "Dresses",
    stock: 20,
    description: "Handcrafted luxury silhouette.",
    coverImage: "/images/collections/dresses.png",
    galleryImages: ["/images/collections/dresses.png"],
  });

  // Category Modal Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    parentCategoryId: "",
  });

  // Collection Modal Form State
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionForm, setCollectionForm] = useState({
    title: "",
    subtitle: "Curated Luxury Silhouette Collection",
    image: "/images/collections/dresses.png",
    itemCount: "10 PIECES",
    targetUrl: "",
    isFeatured: true,
  });

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Data from Admin API routes
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || userRole !== "ADMIN") {
      setLoading(false);
      return;
    }

    async function loadAdminData() {
      setLoading(true);
      try {
        const [prodRes, catRes, collRes, heroRes, orderRes, custRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/categories"),
          fetch("/api/admin/collections"),
          fetch("/api/admin/hero"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/customers"),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || []);
        } else {
          setProducts([]);
        }

        if (heroRes && heroRes.ok) {
          const data = await heroRes.json();
          if (data.hero) {
            setHeroForm({
              announcement: data.hero.announcement || "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000",
              tagline: data.hero.tagline || "AUTUMN / WINTER 2026 COLLECTION",
              title: data.hero.title || "ELANTRAA",
              highlight: data.hero.highlight || "& Timeless Elegance",
              description: data.hero.description || "Immerse yourself in handcrafted silk gowns.",
              buttonText: data.hero.buttonText || "Explore Collection",
              buttonLink: data.hero.buttonLink || "/shop",
              bgImage: data.hero.bgImage || "/images/hero/hero_banner.png",
            });
          }
        }

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        } else {
          setCategories([]);
        }

        if (collRes && collRes.ok) {
          const data = await collRes.json();
          setCollections(data.collections || []);
        } else {
          try {
            const pubRes = await fetch("/api/collections");
            if (pubRes.ok) {
              const pubData = await pubRes.json();
              setCollections(pubData.collections || []);
            }
          } catch {
            setCollections([]);
          }
        }

        if (orderRes.ok) {
          const data = await orderRes.json();
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }

        if (custRes.ok) {
          const data = await custRes.json();
          setCustomers(data.users || []);
        } else {
          setCustomers([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [authStatus, session, userRole]);

  // Toggle Product Active Status
  const handleToggleActive = async (id: string, currentActive?: boolean) => {
    const nextVal = !currentActive;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextVal } : p))
    );

    try {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: nextVal }),
      });
      showNotification(`Product status updated to ${nextVal ? "Active" : "Hidden"}.`);
    } catch {
      showNotification("Updated status locally.");
    }
  };

  // Toggle Product Featured Status
  const handleToggleFeatured = async (id: string, currentFeatured?: boolean) => {
    const nextVal = !currentFeatured;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: nextVal } : p))
    );

    try {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeatured: nextVal }),
      });
      showNotification(`Product ${nextVal ? "added to" : "removed from"} Featured collection.`);
    } catch {
      showNotification("Updated status locally.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product from ELANTRAA catalogue?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      showNotification("Product deleted from catalogue.");
    } catch {
      showNotification("Deleted product.");
    }
  };

  // Gallery Images Helpers
  const handleAddGalleryImageField = () => {
    setProductForm((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ""],
    }));
  };

  const handleRemoveGalleryImageField = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleGalleryImageChange = (index: number, val: string) => {
    setProductForm((prev) => {
      const updated = [...prev.galleryImages];
      updated[index] = val;
      return { ...prev, galleryImages: updated };
    });
  };

  // Local File Upload Handlers
  const handleUploadCoverImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProductForm((prev) => ({ ...prev, coverImage: data.url }));
        showNotification("Cover image uploaded from device!");
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      showNotification("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadGalleryImageFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProductForm((prev) => {
          const updated = [...prev.galleryImages];
          updated[index] = data.url;
          return { ...prev, galleryImages: updated };
        });
        showNotification(`Gallery image #${index + 1} uploaded!`);
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      showNotification("Failed to upload gallery image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Create / Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    const validGallery = productForm.galleryImages.filter((img) => img.trim() !== "");
    const imagesArray = Array.from(
      new Set([productForm.coverImage, ...validGallery].filter((img) => img.trim() !== ""))
    );
    const finalImages = imagesArray.length > 0 ? imagesArray : ["/images/collections/dresses.png"];

    if (editingProductId) {
      try {
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProductId,
            name: productForm.name,
            price: Number(productForm.price),
            discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
            categoryName: productForm.categoryName,
            stock: Number(productForm.stock),
            images: finalImages,
            description: productForm.description,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            setProducts((prev) =>
              prev.map((p) => (p.id === editingProductId ? data.product : p))
            );
          }
        } else {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProductId
                ? {
                    ...p,
                    name: productForm.name,
                    price: Number(productForm.price),
                    discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
                    stock: Number(productForm.stock),
                    images: finalImages,
                  }
                : p
            )
          );
        }
      } catch {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProductId
              ? {
                  ...p,
                  name: productForm.name,
                  price: Number(productForm.price),
                  discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
                  stock: Number(productForm.stock),
                  images: finalImages,
                }
              : p
          )
        );
      }
      showNotification("Product updated successfully.");
    } else {
      const slug = productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: productForm.name,
            slug,
            price: productForm.price,
            discountPrice: productForm.discountPrice,
            categoryName: productForm.categoryName,
            stock: productForm.stock,
            images: finalImages,
            description: productForm.description,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            setProducts((prev) => [data.product, ...prev]);
          } else {
            const fallbackProd: Product = {
              id: `prod_${Date.now()}`,
              name: productForm.name,
              slug,
              description: productForm.description,
              price: Number(productForm.price),
              discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
              category: productForm.categoryName,
              categorySlug: productForm.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              sizes: ["XS", "S", "M", "L", "XL"],
              colors: ["Champagne", "Ivory", "Gold"],
              images: finalImages,
              stock: Number(productForm.stock),
              isFeatured: true,
              isActive: true,
              rating: 5.0,
              reviewCount: 1,
            };
            setProducts((prev) => [fallbackProd, ...prev]);
          }
        }
      } catch {
        const fallbackProd: Product = {
          id: `prod_${Date.now()}`,
          name: productForm.name,
          slug,
          description: productForm.description,
          price: Number(productForm.price),
          discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
          category: productForm.categoryName,
          categorySlug: productForm.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          sizes: ["XS", "S", "M", "L", "XL"],
          colors: ["Champagne", "Ivory", "Gold"],
          images: finalImages,
          stock: Number(productForm.stock),
          isFeatured: true,
          isActive: true,
          rating: 5.0,
          reviewCount: 1,
        };
        setProducts((prev) => [fallbackProd, ...prev]);
      }
      showNotification("New product created in catalogue!");
    }

    setShowProductModal(false);
    setEditingProductId(null);
  };

  // Category CRUD Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (editingCategoryId) {
      try {
        const res = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategoryId,
            name: categoryForm.name,
            slug: categoryForm.slug,
            parentCategoryId: categoryForm.parentCategoryId || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.category) {
            setCategories((prev) =>
              prev.map((c) => (c.id === editingCategoryId ? data.category : c))
            );
            showNotification(`Category "${data.category.name}" updated!`);
          }
        }
      } catch {
        showNotification("Failed to update category.");
      }
    } else {
      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryForm.name,
            slug: categoryForm.slug,
            parentCategoryId: categoryForm.parentCategoryId || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.category) {
            setCategories((prev) => [...prev, data.category]);
            showNotification(`New Category "${data.category.name}" created!`);
          }
        }
      } catch {
        showNotification("Failed to create category.");
      }
    }

    setShowCategoryModal(false);
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showNotification(`Category "${name}" deleted.`);
      } else {
        alert(data.error || "Failed to delete category.");
      }
    } catch {
      showNotification("Failed to delete category.");
    }
  };

  // Collection CRUD Handlers
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionForm.title.trim()) return;

    if (editingCollectionId) {
      try {
        const res = await fetch("/api/admin/collections", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCollectionId,
            ...collectionForm,
          }),
        });
        const data = await res.json();
        if (res.ok && data.collection) {
          setCollections((prev) =>
            prev.map((c) => (c.id === editingCollectionId ? data.collection : c))
          );
          showNotification(`Collection "${collectionForm.title}" updated.`);
        } else {
          alert(data.error || "Failed to update collection.");
        }
      } catch {
        showNotification("Failed to update collection.");
      }
    } else {
      try {
        const res = await fetch("/api/admin/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(collectionForm),
        });
        const data = await res.json();
        if (res.ok && data.collection) {
          setCollections((prev) => [data.collection, ...prev]);
          showNotification(`Collection "${collectionForm.title}" created.`);
        } else {
          alert(data.error || "Failed to create collection.");
        }
      } catch {
        showNotification("Failed to create collection.");
      }
    }

    setShowCollectionModal(false);
    setEditingCollectionId(null);
  };

  const handleDeleteCollection = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete collection "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        showNotification(`Collection "${title}" deleted.`);
      } else {
        alert(data.error || "Failed to delete collection.");
      }
    } catch {
      showNotification("Failed to delete collection.");
    }
  };

  // Save Hero Banner Settings
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroForm),
      });
      const data = await res.json();
      if (res.ok && data.hero) {
        setHeroForm(data.hero);
        showNotification("✨ Hero Banner updated successfully on Home Page!");
      } else {
        alert(data.error || "Failed to update hero banner.");
      }
    } catch {
      showNotification("Failed to update hero banner.");
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      showNotification(`Order ${orderId} status updated to ${newStatus}.`);
    } catch {
      showNotification(`Updated status to ${newStatus}.`);
    }
  };

  // Protected Route Guard
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-2 border-[#C9A648] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#C9A648] font-medium">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!session || userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-xl border border-red-200 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            &#9888;
          </div>
          <h2 className="text-2xl font-serif text-gray-900 font-semibold">Access Restricted</h2>
          <p className="text-xs text-gray-600 leading-relaxed font-light">
            {session ? (
              <>
                You are logged in as <span className="font-semibold text-gray-900">{session.user?.email}</span>. Only authenticated Administrators have permission to access the ELANTRAA Control Panel.
              </>
            ) : (
              "Please sign in with an administrator account to access the ELANTRAA Control Panel."
            )}
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href={session ? "/" : "/login"}
              className="w-full py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors"
            >
              {session ? "Back to Client Home" : "Go to Login"}
            </Link>
            {session && (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 underline font-medium"
              >
                Sign in with another account
              </button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
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
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#C9A648] font-medium">Admin Control Panel</span>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Header Banner */}
          <div className="bg-[#171717] text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden border border-[#C9A648]/30 mb-8">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
                  ELANTRAA Admin Dashboard
                </h1>
                <span className="px-2.5 py-0.5 bg-[#C9A648] text-[#171717] font-bold text-xs uppercase tracking-widest rounded">
                  ADMIN ROLE
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light mt-1">
                Manage product catalogue CRUD, categories, local device image uploads, track customer orders, and view users.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-widest rounded font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-300 mb-8 overflow-x-auto space-x-4 sm:space-x-8 no-scrollbar bg-white p-4 rounded-xl shadow-sm">
            {[
              { id: "products" as const, label: `Products (${products.length})`, icon: "👗" },
              { id: "categories" as const, label: `Categories (${categories.length})`, icon: "🏷️" },
              { id: "collections" as const, label: `Collections (${collections.length})`, icon: "🖼️" },
              { id: "hero" as const, label: "Hero Banner", icon: "✨" },
              { id: "orders" as const, label: `Orders (${orders.length})`, icon: "📦" },
              { id: "customers" as const, label: `Users (${customers.length})`, icon: "👥" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
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

          {loading && (
            <div className="p-8 text-center text-xs font-medium uppercase tracking-widest text-[#C9A648] bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              Loading Admin Data...
            </div>
          )}

          {/* TAB 1: PRODUCTS CRUD */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-gray-900 font-semibold">Product Management</h3>
                  <p className="text-xs text-gray-500">Create, edit, upload local images, and manage product visibility.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm({
                      name: "",
                      price: 4999,
                      discountPrice: "",
                      categoryName: categories.length > 0 ? categories[0].name : "Dresses",
                      stock: 20,
                      description: "Handcrafted luxury silhouette.",
                      coverImage: "/images/collections/dresses.png",
                      galleryImages: ["/images/collections/dresses.png"],
                    });
                    setShowProductModal(true);
                  }}
                  className="px-5 py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-[0.2em] rounded-lg hover:bg-[#C9A648] hover:text-white transition-colors shadow-md flex items-center space-x-2"
                >
                  <span>+ Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Cover Image & Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Images Count</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="p-4 flex items-center space-x-3">
                          <div className="relative w-12 h-14 rounded bg-[#FAF8F5] overflow-hidden border border-gray-200 shrink-0">
                            <Image src={p.images[0] || "/images/collections/dresses.png"} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block font-serif text-sm">{p.name}</span>
                            <span className="text-[11px] text-gray-400">/{p.slug}</span>
                          </div>
                        </td>

                        <td className="p-4 uppercase tracking-wider text-gray-600 font-medium">
                          {typeof p.category === "object"
                            ? (p.category as { name?: string })?.name || "Couture"
                            : p.category}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-gray-900">
                            &#8377;{(p.discountPrice || p.price).toLocaleString("en-IN")}
                          </span>
                          {p.discountPrice && (
                            <span className="text-gray-400 line-through text-[11px] block">
                              &#8377;{p.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-semibold text-gray-700">
                          {p.images.length} Image{p.images.length === 1 ? "" : "s"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              p.stock > 5 ? "bg-gray-100 text-gray-800" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {p.stock} Units
                          </span>
                        </td>

                        {/* Active Toggle */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleActive(p.id, p.isActive !== false)}
                            className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-colors ${
                              p.isActive !== false
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-gray-100 text-gray-500 border border-gray-300"
                            }`}
                          >
                            {p.isActive !== false ? "Active" : "Hidden"}
                          </button>
                        </td>

                        {/* Featured Toggle */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                            className={`p-1.5 rounded-full transition-colors ${
                              p.isFeatured ? "text-[#C9A648]" : "text-gray-300 hover:text-gray-500"
                            }`}
                            title="Toggle Featured status"
                          >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProductId(p.id);
                              setProductForm({
                                name: p.name,
                                price: p.price,
                                discountPrice: p.discountPrice ? String(p.discountPrice) : "",
                                categoryName: typeof p.category === "string" ? p.category : (p.category as { name?: string })?.name || "Dresses",
                                stock: p.stock,
                                description: p.description,
                                coverImage: p.images[0] || "/images/collections/dresses.png",
                                galleryImages: p.images.length > 1 ? p.images.slice(1) : [p.images[0] || "/images/collections/dresses.png"],
                              });
                              setShowProductModal(true);
                            }}
                            className="text-[#C9A648] hover:underline font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORY MANAGEMENT */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-gray-900 font-semibold">Category Management</h3>
                  <p className="text-xs text-gray-500">Create, edit, organize category hierarchies, and view linked products.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryForm({ name: "", slug: "", parentCategoryId: "" });
                    setShowCategoryModal(true);
                  }}
                  className="px-5 py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-[0.2em] rounded-lg hover:bg-[#C9A648] hover:text-white transition-colors shadow-md flex items-center space-x-2"
                >
                  <span>+ Add New Category</span>
                </button>
              </div>

              {/* Categories Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Parent Category</th>
                      <th className="p-4 text-center">Subcategories</th>
                      <th className="p-4 text-center">Linked Products</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-semibold text-gray-900 font-serif text-sm">
                          {cat.name}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-gray-500">
                          /{cat.slug}
                        </td>
                        <td className="p-4 text-gray-600 font-medium">
                          {cat.parentCategoryName ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded text-[10px] font-bold uppercase border border-amber-200">
                              ↳ {cat.parentCategoryName}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-light">Root Category</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-semibold text-gray-700">
                          {cat.subcategoriesCount || 0}
                        </td>
                        <td className="p-4 text-center font-bold text-[#C9A648]">
                          {cat.productsCount || 0} Product(s)
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setCategoryForm({
                                name: cat.name,
                                slug: cat.slug,
                                parentCategoryId: cat.parentCategoryId || "",
                              });
                              setShowCategoryModal(true);
                            }}
                            className="text-[#C9A648] hover:underline font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURED COLLECTIONS CRUD */}
          {activeTab === "collections" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-gray-900 font-semibold">Featured Collections</h3>
                  <p className="text-xs text-gray-500">Manage curated collections displayed on the home page with custom titles, images, and subtitles.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCollectionId(null);
                    setCollectionForm({
                      title: "",
                      subtitle: "Curated Luxury Silhouette Collection",
                      image: "/images/collections/dresses.png",
                      itemCount: "10 PIECES",
                      targetUrl: "",
                      isFeatured: true,
                    });
                    setShowCollectionModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors shadow flex items-center justify-center space-x-2 shrink-0"
                >
                  <span>+ Create Collection</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Cover Image & Collection Title</th>
                      <th className="p-4">Subtitle</th>
                      <th className="p-4">Badge (Item Count)</th>
                      <th className="p-4">Featured Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {collections.map((coll) => (
                      <tr key={coll.id} className="hover:bg-gray-50/50">
                        <td className="p-4 flex items-center space-x-3">
                          <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-100 border shrink-0">
                            <Image src={coll.image} alt={coll.title} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-sm">{coll.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono font-normal">/{coll.slug}</span>
                          </div>
                        </td>

                        <td className="p-4 text-gray-600 font-light max-w-xs truncate">
                          {coll.subtitle}
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-[#171717] text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded border border-[#C9A648]/40">
                            {coll.itemCount}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              coll.isFeatured
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {coll.isFeatured ? "Active Featured" : "Hidden"}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => {
                              setEditingCollectionId(coll.id);
                              setCollectionForm({
                                title: coll.title,
                                subtitle: coll.subtitle,
                                image: coll.image,
                                itemCount: coll.itemCount,
                                targetUrl: coll.targetUrl || "",
                                isFeatured: coll.isFeatured,
                              });
                              setShowCollectionModal(true);
                            }}
                            className="text-[#C9A648] hover:underline font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(coll.id, coll.title)}
                            className="text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HERO BANNER MANAGEMENT */}
          {activeTab === "hero" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-serif text-gray-900 font-semibold">Home Page Hero Banner Settings</h3>
                <p className="text-xs text-gray-500">Customize the hero background image, primary titles, tagline badge, description, and button action links.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Card Preview */}
                <div className="lg:col-span-1 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Live Preview Card</span>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#C9A648]/40 h-[420px] bg-black flex flex-col justify-end p-6">
                    <Image
                      src={heroForm.bgImage || "/images/hero/hero_banner.png"}
                      alt="Hero Background Preview"
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <div className="relative z-10 text-white space-y-3">
                      <span className="inline-block px-2.5 py-0.5 bg-white/10 backdrop-blur-md border border-[#D4AF37]/50 rounded-full text-[9px] text-[#F3E5AB] font-bold uppercase tracking-widest">
                        {heroForm.tagline}
                      </span>

                      <h2 className="text-2xl font-serif leading-tight">
                        {heroForm.title} <br />
                        <span className="italic font-normal text-[#D4AF37]">{heroForm.highlight}</span>
                      </h2>

                      <p className="text-[11px] text-gray-300 line-clamp-3 font-light">
                        {heroForm.description}
                      </p>

                      <div className="pt-2">
                        <span className="inline-block px-4 py-2 bg-[#D4AF37] text-[#171717] font-bold text-[10px] uppercase tracking-widest rounded shadow">
                          {heroForm.buttonText || "Explore Collection"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <form onSubmit={handleSaveHero} className="space-y-5 text-xs font-sans">
                    <div>
                      <label className="block font-semibold uppercase text-gray-700 mb-1">Top Announcement Banner Headline *</label>
                      <input
                        type="text"
                        required
                        value={heroForm.announcement}
                        onChange={(e) => setHeroForm({ ...heroForm, announcement: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none font-medium text-[#171717]"
                        placeholder="e.g. COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase text-gray-700 mb-1">Badge Tagline *</label>
                        <input
                          type="text"
                          required
                          value={heroForm.tagline}
                          onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase text-gray-700 mb-1">Main Brand Title *</label>
                        <input
                          type="text"
                          required
                          value={heroForm.title}
                          onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase text-gray-700 mb-1">Highlight Subtitle (Italic Gold) *</label>
                        <input
                          type="text"
                          required
                          value={heroForm.highlight}
                          onChange={(e) => setHeroForm({ ...heroForm, highlight: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase text-gray-700 mb-1">CTA Button Text *</label>
                        <input
                          type="text"
                          required
                          value={heroForm.buttonText}
                          onChange={(e) => setHeroForm({ ...heroForm, buttonText: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-gray-700 mb-1">CTA Button Target Link *</label>
                      <input
                        type="text"
                        required
                        value={heroForm.buttonLink}
                        onChange={(e) => setHeroForm({ ...heroForm, buttonLink: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-gray-700 mb-1">Hero Description Paragraph *</label>
                      <textarea
                        rows={3}
                        required
                        value={heroForm.description}
                        onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none"
                      />
                    </div>

                    {/* Hero Background Image Upload */}
                    <div>
                      <label className="block font-semibold uppercase text-gray-700 mb-1">Hero Cover Background Image URL *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={heroForm.bgImage}
                          onChange={(e) => setHeroForm({ ...heroForm, bgImage: e.target.value })}
                          className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-[#C9A648] outline-none font-mono text-[11px]"
                        />
                        <label className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold uppercase text-[10px] hover:bg-gray-200 cursor-pointer flex items-center shrink-0 border border-gray-300">
                          <span>📁 Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingImage(true);
                              try {
                                const formData = new FormData();
                                formData.append("file", file);
                                const res = await fetch("/api/upload", { method: "POST", body: formData });
                                const data = await res.json();
                                if (res.ok && data.url) {
                                  setHeroForm((prev) => ({ ...prev, bgImage: data.url }));
                                  showNotification("Hero background image uploaded successfully!");
                                } else {
                                  alert(data.error || "Failed to upload image.");
                                }
                              } catch {
                                showNotification("Failed to upload image.");
                              } finally {
                                setUploadingImage(false);
                              }
                            }}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-widest font-medium rounded-lg transition-colors shadow-lg mt-4"
                    >
                      ✨ Save Hero Banner Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-serif text-gray-900 font-semibold">Customer Orders</h3>
                <p className="text-xs text-gray-500">Track purchase transactions, update shipping statuses, and review client details.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Fulfillment Status</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <span className="font-semibold text-gray-900 block font-mono text-xs">{o.id}</span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-gray-900 block">{o.user?.name || "Anonymous Client"}</span>
                          <span className="text-[11px] text-gray-500">{o.user?.email || "N/A"}</span>
                        </td>

                        <td className="p-4 font-semibold text-gray-900 font-sans">
                          &#8377;{o.totalAmount.toLocaleString("en-IN")}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {o.paymentStatus} ({o.paymentMethod || "ONLINE"})
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              o.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800"
                                : o.status === "CONFIRMED"
                                ? "bg-amber-100 text-amber-800"
                                : o.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                o.id,
                                e.target.value as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
                              )
                            }
                            className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs focus:border-[#C9A648] outline-none cursor-pointer font-medium"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS & USERS */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-serif text-gray-900 font-semibold">User Directory</h3>
                <p className="text-xs text-gray-500">View registered client accounts, roles, and historical orders.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Registration Date</th>
                      <th className="p-4 text-right">Total Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="p-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#171717] text-[#D4AF37] font-serif font-bold flex items-center justify-center text-sm border border-[#C9A648]/40">
                            {c.name[0]}
                          </div>
                          <span className="font-semibold text-gray-900">{c.name}</span>
                        </td>

                        <td className="p-4 text-gray-600 font-light">{c.email}</td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              c.role === "ADMIN"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {c.role}
                          </span>
                        </td>

                        <td className="p-4 text-gray-500 text-[11px]">
                          {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        <td className="p-4 text-right font-semibold text-gray-900">
                          {c._count?.orders || 2} Orders
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 text-lg"
            >
              &times;
            </button>
            <h3 className="text-xl font-serif text-gray-900 font-semibold mb-1">
              {editingProductId ? "Edit Product Details" : "Add New Haute Couture Product"}
            </h3>
            <p className="text-xs text-gray-500 mb-6 font-light">
              Configure product info, upload cover image from device, or paste custom URLs.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aurelia Satin Wrap Dress"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4999"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 4299"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.categoryName}
                    onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Dresses">Dresses</option>
                        <option value="Ethnic Wear">Ethnic Wear</option>
                        <option value="Menswear">Menswear</option>
                        <option value="Accessories">Accessories</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>
              </div>

              {/* COVER IMAGE MANAGEMENT & LOCAL DEVICE UPLOAD SECTION */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold uppercase text-gray-900">
                    1. Primary Cover Image *
                  </label>
                  <span className="text-[10px] text-[#C9A648] font-semibold uppercase">Featured Card Cover</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-14 rounded bg-white overflow-hidden border border-gray-300 shrink-0 shadow-sm">
                    <Image
                      src={productForm.coverImage || "/images/collections/dresses.png"}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://... or click button below to upload from computer"
                    value={productForm.coverImage}
                    onChange={(e) => setProductForm({ ...productForm, coverImage: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                {/* Local Computer File Upload Button */}
                <div className="pt-1 flex items-center justify-between">
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white rounded text-[11px] font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{uploadingImage ? "Uploading File..." : "📁 Upload Cover Image from Device"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCoverImageFile}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  {productForm.coverImage.startsWith("/uploads/") && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold uppercase">
                      ✓ Uploaded from Device
                    </span>
                  )}
                </div>

                {/* Sample Preset Image Pickers */}
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block mb-1.5">
                    Or Pick Sample Fashion Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Dresses Collection", url: "/images/collections/dresses.png" },
                      { label: "Ethnic Collection", url: "/images/collections/ethnic.png" },
                      { label: "Menswear Collection", url: "/images/collections/menswear.png" },
                      { label: "Hero Banner", url: "/images/hero/hero_fashion.png" },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => setProductForm({ ...productForm, coverImage: preset.url })}
                        className="px-2.5 py-1 bg-white border border-gray-300 hover:border-[#C9A648] text-[10px] font-medium rounded text-gray-700 transition-colors"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GALLERY IMAGES & LOCAL DEVICE UPLOADS SECTION */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold uppercase text-gray-900">
                    2. Additional Gallery Images ({productForm.galleryImages.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddGalleryImageField}
                    className="text-[11px] text-[#C9A648] hover:underline font-bold uppercase"
                  >
                    + Add Image Field
                  </button>
                </div>

                {productForm.galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-12 rounded bg-[#FAF8F5] overflow-hidden border border-gray-300 shrink-0">
                        <Image
                          src={imgUrl || "/images/collections/dresses.png"}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={`Gallery Image #${idx + 1} URL or upload from device`}
                        value={imgUrl}
                        onChange={(e) => handleGalleryImageChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:border-[#C9A648] outline-none text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImageField(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 font-bold"
                        title="Remove image URL"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <label className="cursor-pointer inline-flex items-center space-x-1.5 text-gray-700 hover:text-[#C9A648] font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Upload File from Device for Image #{idx + 1}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadGalleryImageFile(idx, e)}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>

                      {imgUrl.startsWith("/uploads/") && (
                        <span className="text-emerald-700 font-bold">✓ Uploaded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-widest font-medium rounded transition-colors shadow-lg"
              >
                {editingProductId ? "Save Product Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 text-lg"
            >
              &times;
            </button>
            <h3 className="text-xl font-serif text-gray-900 font-semibold mb-1">
              {editingCategoryId ? "Edit Category Details" : "Add New Category"}
            </h3>
            <p className="text-xs text-gray-500 mb-6 font-light">
              Define custom categories and parent hierarchy for your haute couture products.
            </p>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Gowns"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">URL Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. evening-gowns"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Parent Category (Optional)</label>
                <select
                  value={categoryForm.parentCategoryId}
                  onChange={(e) => setCategoryForm({ ...categoryForm, parentCategoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {categories
                    .filter((c) => c.id !== editingCategoryId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-widest font-medium rounded transition-colors shadow-lg mt-2"
              >
                {editingCategoryId ? "Save Category Changes" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCollectionModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 text-lg"
            >
              &times;
            </button>
            <h3 className="text-xl font-serif text-gray-900 font-semibold mb-1">
              {editingCollectionId ? "Edit Collection Details" : "Add New Featured Collection"}
            </h3>
            <p className="text-xs text-gray-500 mb-6 font-light">
              Create and manage curated collections displayed on the home page with custom banners and titles.
            </p>

            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Collection Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dresses & Evening Gowns"
                  value={collectionForm.title}
                  onChange={(e) => setCollectionForm({ ...collectionForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Silk & Satin Silhouettes"
                  value={collectionForm.subtitle}
                  onChange={(e) => setCollectionForm({ ...collectionForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Badge (Item Count)</label>
                <input
                  type="text"
                  placeholder="e.g. 12 PIECES"
                  value={collectionForm.itemCount}
                  onChange={(e) => setCollectionForm({ ...collectionForm, itemCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Target Redirect URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /shop?category=Dresses or /category/dresses"
                  value={collectionForm.targetUrl}
                  onChange={(e) => setCollectionForm({ ...collectionForm, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none font-mono text-[11px]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave blank to automatically filter shop page by <strong>/shop?category=[Title]</strong>
                </p>
              </div>

              {/* Cover Image Upload & URL */}
              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">Collection Cover Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={collectionForm.image}
                    onChange={(e) => setCollectionForm({ ...collectionForm, image: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none font-mono text-[11px]"
                  />
                  <label className="px-3 py-2 bg-gray-100 text-gray-800 rounded font-semibold uppercase text-[10px] hover:bg-gray-200 cursor-pointer flex items-center shrink-0 border border-gray-300">
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (res.ok && data.url) {
                            setCollectionForm((prev) => ({ ...prev, image: data.url }));
                            showNotification("Collection cover image uploaded successfully!");
                          } else {
                            alert(data.error || "Failed to upload image.");
                          }
                        } catch {
                          showNotification("Failed to upload image.");
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {collectionForm.image && (
                  <div className="mt-2 relative w-24 h-28 rounded overflow-hidden border border-gray-300 bg-gray-50">
                    <Image src={collectionForm.image} alt="Collection Cover Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeaturedCollection"
                  checked={collectionForm.isFeatured}
                  onChange={(e) => setCollectionForm({ ...collectionForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A648] cursor-pointer"
                />
                <label htmlFor="isFeaturedCollection" className="text-xs text-gray-800 font-semibold cursor-pointer">
                  Featured (Display on Home Page)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-widest font-medium rounded transition-colors shadow-lg mt-2"
              >
                {editingCollectionId ? "Save Collection Changes" : "Create Collection"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
