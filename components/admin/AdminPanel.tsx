"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "dashboard" | "products" | "categories" | "inventory" | "orders" | "customers" | "hero" | "coupons" | "settings";
type Status = "idle" | "loading" | "error" | "ready";
type OrderStatus = "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  categorySlug: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isReturnable?: boolean;
  productInformation?: string;
  deliveryTimelines?: string;
  disclaimer?: string;
  additionalInfo?: string;
  createdAt?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  isActive?: boolean;
  productsCount?: number;
};

type OrderItem = {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type Order = {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  customer?: { id: string; name: string; email: string };
  shippingAddress?: Record<string, string>;
  items?: OrderItem[];
  timeline?: { status: string; label: string; completed: boolean; date?: string | null }[];
};

type Customer = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  phone?: string;
  _count?: { orders: number; addresses: number };
  orders?: Pick<Order, "id" | "totalAmount" | "status" | "paymentStatus" | "createdAt">[];
  addresses?: Record<string, string>[];
};

type Settings = {
  storeName: string;
  storeLogo: string;
  contactEmail: string;
  currency: string;
  shippingCharge: number;
  taxPercentage: number;
};

type HeroBannerData = {
  announcement: string;
  tagline: string;
  title: string;
  highlight: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgImage: string;
  bgVideo?: string | null;
};

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend?: number | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
};

type Toast = { type: "success" | "error"; message: string } | null;
type ConfirmState = { title: string; message: string; onConfirm: () => void } | null;

const navItems: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "inventory", label: "Inventory" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
  { id: "hero", label: "Hero Banner" },
  { id: "coupons", label: "Promocodes" },
  { id: "settings", label: "Settings" },
];

const emptyProduct = {
  name: "",
  sku: "",
  description: "",
  categoryName: "",
  price: "",
  discountPrice: "",
  stock: "0",
  images: [""],
  isActive: true,
  isReturnable: true,
  productInformation: "",
  deliveryTimelines: "",
  disclaimer: "",
  additionalInfo: "",
};

const emptyCategory = {
  name: "",
  image: "",
  isActive: true,
};

const emptyHero: HeroBannerData = {
  announcement: "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000",
  tagline: "AUTUMN / WINTER 2026 COLLECTION",
  title: "ELANTRAA",
  highlight: "& Timeless Elegance",
  description:
    "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
  buttonText: "Explore Collection",
  buttonLink: "/shop",
  bgImage: "/images/hero/hero_banner.png",
  bgVideo: "",
};

const emptyCoupon = {
  code: "",
  type: "percentage" as const,
  value: "",
  minSpend: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

export default function AdminPanel() {
  const { data: session, status: authStatus } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [heroForm, setHeroForm] = useState<HeroBannerData>(emptyHero);
  const [settings, setSettings] = useState<Settings>({
    storeName: "ELANTRAA",
    storeLogo: "/images/logo/logo.png",
    contactEmail: "elantraa.01@gmail.com",
    currency: "INR",
    shippingCharge: 0,
    taxPercentage: 0,
  });

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productModal, setProductModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [orderModal, setOrderModal] = useState<Order | null>(null);
  const [customerModal, setCustomerModal] = useState<Customer | null>(null);
  const [couponModal, setCouponModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [settingsForm, setSettingsForm] = useState(settings);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const pageSize = 8;

  function notify(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  }

  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data as T;
  }

  const loadAll = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const [productData, categoryData, orderData, customerData, settingsData, heroData, couponData] = await Promise.all([
        request<{ products: Product[] }>("/api/admin/products"),
        request<{ categories: Category[] }>("/api/admin/categories"),
        request<{ orders: Order[] }>("/api/admin/orders"),
        request<{ users: Customer[] }>("/api/admin/customers"),
        request<{ settings: Settings }>("/api/admin/settings"),
        request<{ hero: HeroBannerData }>("/api/admin/hero"),
        request<{ coupons: Coupon[] }>("/api/admin/coupons"),
      ]);
      setProducts(productData.products || []);
      setCategories(categoryData.categories || []);
      setOrders(orderData.orders || []);
      setCustomers(customerData.users || []);
      setSettings(settingsData.settings);
      setSettingsForm(settingsData.settings);
      setHeroForm({ ...emptyHero, ...(heroData.hero || {}) });
      setCoupons(couponData.coupons || []);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || role !== "ADMIN") {
      setStatus("ready");
      return;
    }
    loadAll();
  }, [authStatus, session, role, loadAll]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, query, categoryFilter, statusFilter]);

  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.paymentStatus === "PAID" && order.status !== "CANCELLED")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return {
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length,
      pendingOrders: orders.filter((order) => order.status === "PENDING").length,
      lowStockProducts: products.filter((product) => product.stock <= 5).length,
    };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = [product.name, product.sku, product.category]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive !== false) ||
        (statusFilter === "draft" && product.isActive === false);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, query, categoryFilter, statusFilter]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase())),
    [categories, query]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        [order.id, order.customer?.name, order.customer?.email, order.status, order.paymentStatus]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [orders, query]
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        [customer.name, customer.email, customer.phone].join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [customers, query]
  );

  const filteredCoupons = useMemo(
    () => coupons.filter((coupon) => [coupon.code, coupon.type].join(" ").toLowerCase().includes(query.toLowerCase())),
    [coupons, query]
  );

  const inventoryProducts = useMemo(
    () => products.filter((product) => [product.name, product.sku].join(" ").toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  const visibleProducts = paginate(filteredProducts, page, pageSize);
  const visibleCategories = paginate(filteredCategories, page, pageSize);
  const visibleOrders = paginate(filteredOrders, page, pageSize);
  const visibleCustomers = paginate(filteredCustomers, page, pageSize);
  const visibleCoupons = paginate(filteredCoupons, page, pageSize);
  const visibleInventory = paginate(inventoryProducts, page, pageSize);

  function openProduct(product?: Product) {
    setProductModal({ open: true, id: product?.id });
    setProductForm(
      product
        ? {
            name: product.name,
            sku: product.sku || "",
            description: product.description,
            categoryName: product.category,
            price: String(product.price),
            discountPrice: product.discountPrice ? String(product.discountPrice) : "",
            stock: String(product.stock),
            images: product.images.length ? product.images : [""],
            isActive: product.isActive !== false,
            isReturnable: product.isReturnable !== false,
            productInformation: product.productInformation || "",
            deliveryTimelines: product.deliveryTimelines || "",
            disclaimer: product.disclaimer || "",
            additionalInfo: product.additionalInfo || "",
          }
        : { ...emptyProduct, categoryName: categories[0]?.name || "" }
    );
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.categoryName || Number(productForm.price) < 0) {
      notify("error", "Product name, category, and valid price are required.");
      return;
    }

    const payload = {
      id: productModal.id,
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      description: productForm.description.trim(),
      categoryName: productForm.categoryName,
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
      stock: Number(productForm.stock || 0),
      images: productForm.images.map((img) => img.trim()).filter(Boolean),
      isActive: productForm.isActive,
      isReturnable: productForm.isReturnable,
      productInformation: productForm.productInformation.trim(),
      deliveryTimelines: productForm.deliveryTimelines.trim(),
      disclaimer: productForm.disclaimer.trim(),
      additionalInfo: productForm.additionalInfo.trim(),
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [],
    };

    try {
      const data = await request<{ product: Product }>(
        "/api/admin/products",
        {
          method: productModal.id ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );
      setProducts((prev) =>
        productModal.id ? prev.map((item) => (item.id === data.product.id ? data.product : item)) : [data.product, ...prev]
      );
      setProductModal({ open: false });
      notify("success", productModal.id ? "Product updated." : "Product created.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to save product.");
    }
  }

  function deleteProduct(product: Product) {
    setConfirm({
      title: "Delete product",
      message: `Delete "${product.name}" from the catalogue?`,
      onConfirm: async () => {
        try {
          await request(`/api/admin/products?id=${product.id}`, { method: "DELETE" });
          setProducts((prev) => prev.filter((item) => item.id !== product.id));
          notify("success", "Product deleted.");
        } catch (err) {
          notify("error", err instanceof Error ? err.message : "Unable to delete product.");
        }
      },
    });
  }

  function openCategory(category?: Category) {
    setCategoryModal({ open: true, id: category?.id });
    setCategoryForm(
      category
        ? { name: category.name, image: category.image || "", isActive: category.isActive !== false }
        : emptyCategory
    );
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      notify("error", "Category name is required.");
      return;
    }
    try {
      const data = await request<{ category: Category }>("/api/admin/categories", {
        method: categoryModal.id ? "PATCH" : "POST",
        body: JSON.stringify({ id: categoryModal.id, ...categoryForm }),
      });
      setCategories((prev) =>
        categoryModal.id ? prev.map((item) => (item.id === data.category.id ? data.category : item)) : [...prev, data.category]
      );
      setCategoryModal({ open: false });
      notify("success", categoryModal.id ? "Category updated." : "Category created.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to save category.");
    }
  }

  function deleteCategory(category: Category) {
    setConfirm({
      title: "Delete category",
      message: `Delete "${category.name}"? Categories containing products cannot be deleted.`,
      onConfirm: async () => {
        try {
          await request(`/api/admin/categories?id=${category.id}`, { method: "DELETE" });
          setCategories((prev) => prev.filter((item) => item.id !== category.id));
          notify("success", "Category deleted.");
        } catch (err) {
          notify("error", err instanceof Error ? err.message : "Unable to delete category.");
        }
      },
    });
  }

  function openCoupon(coupon?: Coupon) {
    setCouponModal({ open: true, id: coupon?.id });
    setCouponForm(
      coupon
        ? {
            code: coupon.code,
            type: coupon.type,
            value: String(coupon.value),
            minSpend: coupon.minSpend ? String(coupon.minSpend) : "",
            isActive: coupon.isActive !== false,
            startsAt: toDateInputValue(coupon.startsAt),
            endsAt: toDateInputValue(coupon.endsAt),
          }
        : emptyCoupon
    );
  }

  async function saveHero(e: React.FormEvent) {
    e.preventDefault();
    if (!heroForm.title.trim() || !heroForm.bgImage.trim()) {
      notify("error", "Hero title and background image are required.");
      return;
    }

    try {
      const data = await request<{ hero: HeroBannerData }>("/api/admin/hero", {
        method: "PATCH",
        body: JSON.stringify(heroForm),
      });
      setHeroForm({ ...emptyHero, ...data.hero });
      notify("success", "Hero banner updated.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to save hero banner.");
    }
  }

  async function saveCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponForm.code.trim() || Number(couponForm.value) <= 0) {
      notify("error", "Promo code and a valid discount value are required.");
      return;
    }

    const payload = {
      id: couponModal.id,
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minSpend: couponForm.minSpend ? Number(couponForm.minSpend) : null,
      isActive: couponForm.isActive,
      startsAt: couponForm.startsAt || null,
      endsAt: couponForm.endsAt || null,
    };

    try {
      const data = await request<{ coupon: Coupon }>("/api/admin/coupons", {
        method: couponModal.id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setCoupons((prev) =>
        couponModal.id ? prev.map((item) => (item.id === data.coupon.id ? data.coupon : item)) : [data.coupon, ...prev]
      );
      setCouponModal({ open: false });
      notify("success", couponModal.id ? "Promocode updated." : "Promocode created.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to save promocode.");
    }
  }

  function deleteCoupon(coupon: Coupon) {
    setConfirm({
      title: "Delete promocode",
      message: `Delete "${coupon.code}"? Customers will no longer be able to apply it.`,
      onConfirm: async () => {
        try {
          await request(`/api/admin/coupons?id=${coupon.id}`, { method: "DELETE" });
          setCoupons((prev) => prev.filter((item) => item.id !== coupon.id));
          notify("success", "Promocode deleted.");
        } catch (err) {
          notify("error", err instanceof Error ? err.message : "Unable to delete promocode.");
        }
      },
    });
  }

  async function updateStock(product: Product, stock: number) {
    try {
      const data = await request<{ product: Product }>("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify({ id: product.id, stock }),
      });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? data.product : item)));
      notify("success", "Stock updated.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to update stock.");
    }
  }

  async function updateOrderStatus(order: Order, statusValue: OrderStatus) {
    try {
      await request<{ order: Order }>("/api/admin/orders", {
        method: "PATCH",
        body: JSON.stringify({ id: order.id, status: statusValue }),
      });
      setOrders((prev) => prev.map((item) => (item.id === order.id ? { ...item, status: statusValue } : item)));
      setOrderModal((prev) => (prev?.id === order.id ? { ...prev, status: statusValue } : prev));
      notify("success", "Order status updated.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to update order.");
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsForm.storeName.trim() || !settingsForm.contactEmail.trim()) {
      notify("error", "Store name and contact email are required.");
      return;
    }
    try {
      const data = await request<{ settings: Settings }>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settingsForm),
      });
      setSettings(data.settings);
      setSettingsForm(data.settings);
      notify("success", "Store settings saved.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to save settings.");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      notify("error", "New password must be at least 8 characters.");
      return;
    }
    try {
      await request("/api/admin/change-password", {
        method: "PATCH",
        body: JSON.stringify(passwordForm),
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      notify("success", "Password changed.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Unable to change password.");
    }
  }

  if (authStatus === "loading" || status === "loading") {
    return <AdminShell activeTab={activeTab} setActiveTab={setActiveTab} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}><LoadingState /></AdminShell>;
  }

  if (!session || role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-[#C9A648] font-semibold">Admin Login</p>
          <h1 className="mt-2 text-2xl font-serif text-slate-950">ELANTRAA Control Panel</h1>
          <p className="mt-3 text-sm text-slate-600">Sign in with an administrator account to manage products and orders.</p>
          <a href="/login?callbackUrl=/admin" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminShell activeTab={activeTab} setActiveTab={setActiveTab} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="min-w-0">
              <button type="button" onClick={() => setMobileNavOpen(true)} className="mr-3 rounded-md border border-slate-200 px-2 py-1 text-sm lg:hidden">Menu</button>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Admin</span>
              <h1 className="truncate text-lg font-semibold text-slate-950">{navItems.find((item) => item.id === activeTab)?.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:block">{session.user?.email}</span>
              <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:border-slate-950">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {status === "error" ? (
            <ErrorState message={error} onRetry={loadAll} />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <section className="space-y-6">
                  {/* 2-Column Mobile Grid for Metrics */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Metric label="Total Revenue" value={formatMoney(metrics.totalRevenue, settings.currency)} className="col-span-2 sm:col-span-1 bg-amber-50/90 text-amber-950 border-amber-200/90" />
                    <Metric label="Total Orders" value={metrics.totalOrders} />
                    <Metric label="Total Products" value={metrics.totalProducts} />
                    <Metric label="Pending Orders" value={metrics.pendingOrders} tone="warning" />
                    <Metric label="Low Stock" value={metrics.lowStockProducts} tone="danger" />
                  </div>

                  <Panel title="Recent Orders Overview" action={<button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-[#9b7a1d] hover:underline uppercase tracking-wider">View All Orders &rarr;</button>}>
                    {/* Desktop Data Table */}
                    <div className="hidden md:block">
                      <DataTable
                        headers={["Order ID", "Customer", "Date", "Amount", "Payment", "Status", "Action"]}
                        empty="No orders yet."
                        rows={orders.slice(0, 6).map((order) => [
                          shortId(order.id),
                          order.customer?.name || "Customer",
                          formatDate(order.createdAt),
                          formatMoney(order.totalAmount, settings.currency),
                          <StatusBadge key="payment" value={order.paymentStatus} />,
                          <StatusBadge key="status" value={order.status} />,
                          <button key="view" type="button" onClick={() => setOrderModal(order)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-xs">Details</button>,
                        ])}
                      />
                    </div>

                    {/* Mobile 2-Column Native Grid Cards */}
                    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {orders.slice(0, 6).length ? (
                        orders.slice(0, 6).map((order) => (
                          <div key={order.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900 text-xs">{shortId(order.id)}</span>
                              <StatusBadge value={order.status} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{order.customer?.name || "Guest Customer"}</p>
                              <p className="text-[11px] text-slate-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-950">{formatMoney(order.totalAmount, settings.currency)}</span>
                              <button onClick={() => setOrderModal(order)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-[11px]">Details</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-sm text-slate-500 col-span-2">No orders recorded yet.</div>
                      )}
                    </div>
                  </Panel>
                </section>
              )}

              {activeTab === "products" && (
                <Panel title="Products Catalogue" action={<div className="hidden sm:block"><Button onClick={() => openProduct()}>+ Add Product</Button></div>}>
                  <Toolbar>
                    <SearchBar value={query} onChange={setQuery} placeholder="Search products or SKU..." />
                    <Select value={categoryFilter} onChange={setCategoryFilter}>
                      <option value="all">All categories</option>
                      {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                    </Select>
                    <Select value={statusFilter} onChange={setStatusFilter}>
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </Select>
                  </Toolbar>

                  {/* Desktop Data Table */}
                  <div className="hidden md:block">
                    <DataTable
                      headers={["Product", "SKU", "Category", "Price", "Stock", "Returns", "Status", "Actions"]}
                      empty="No products match your filters."
                      rows={visibleProducts.map((product) => [
                        <ProductCell key="product" product={product} />,
                        product.sku || "-",
                        product.category,
                        formatMoney(product.discountPrice || product.price, settings.currency),
                        product.stock,
                        <StatusBadge key="returns" value={product.isReturnable === false ? "Non-Returnable" : "Returnable"} />,
                        <StatusBadge key="status" value={product.isActive === false ? "Draft" : "Active"} />,
                        <RowActions key="actions" onEdit={() => openProduct(product)} onDelete={() => deleteProduct(product)} />,
                      ])}
                    />
                  </div>

                  {/* Mobile Android App Native Product Cards */}
                  <div className="md:hidden space-y-3">
                    {visibleProducts.length ? (
                      visibleProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-slate-100 shrink-0 border border-slate-200">
                                <Image src={product.images[0] || "/images/collections/dresses.png"} alt={product.name} fill className="object-cover" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 text-sm leading-snug">{product.name}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku || product.category}</p>
                                <p className="text-sm font-bold text-[#9b7a1d] mt-1">{formatMoney(product.discountPrice || product.price, settings.currency)}</p>
                              </div>
                            </div>
                            <StatusBadge value={product.isActive === false ? "Draft" : "Active"} />
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <span className={`font-semibold ${product.stock <= 5 ? "text-amber-600" : "text-slate-600"}`}>
                              Stock: {product.stock} pcs
                            </span>
                            <div className="flex gap-2">
                              <button onClick={() => openProduct(product)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-xs">Edit</button>
                              <button onClick={() => deleteProduct(product)} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold rounded-md text-xs">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No products found.</div>
                    )}
                  </div>

                  <Pagination page={page} total={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "categories" && (
                <Panel title="Categories" action={<div className="hidden sm:block"><Button onClick={() => openCategory()}>+ Add Category</Button></div>}>
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search categories..." /></Toolbar>
                  
                  {/* Desktop Data Table */}
                  <div className="hidden md:block">
                    <DataTable
                      headers={["Category", "Products", "Status", "Actions"]}
                      empty="No categories found."
                      rows={visibleCategories.map((category) => [
                        <CategoryCell key="category" category={category} />,
                        category.productsCount || 0,
                        <StatusBadge key="status" value={category.isActive === false ? "Draft" : "Active"} />,
                        <RowActions key="actions" onEdit={() => openCategory(category)} onDelete={() => deleteCategory(category)} />,
                      ])}
                    />
                  </div>

                  {/* Mobile Android Native Category Cards */}
                  <div className="md:hidden space-y-3">
                    {visibleCategories.length ? (
                      visibleCategories.map((category) => (
                        <div key={category.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                          <CategoryCell category={category} />
                          <div className="flex items-center gap-2">
                            <button onClick={() => openCategory(category)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-xs">Edit</button>
                            <button onClick={() => deleteCategory(category)} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold rounded-md text-xs">Delete</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No categories found.</div>
                    )}
                  </div>

                  <Pagination page={page} total={filteredCategories.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "inventory" && (
                <Panel title="Inventory Stock Management">
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search inventory stock..." /></Toolbar>
                  
                  {/* Desktop Data Table */}
                  <div className="hidden md:block">
                    <DataTable
                      headers={["Product", "Stock Quantity", "Low Stock", "Update Stock"]}
                      empty="No inventory records found."
                      rows={visibleInventory.map((product) => [
                        <ProductCell key="product" product={product} />,
                        product.stock,
                        <StatusBadge key="low" value={product.stock <= 5 ? "Low Stock" : "In Stock"} />,
                        <StockEditor key="stock" value={product.stock} onSave={(stock) => updateStock(product, stock)} />,
                      ])}
                    />
                  </div>

                  {/* Mobile Android Native Inventory Cards */}
                  <div className="md:hidden space-y-3">
                    {visibleInventory.length ? (
                      visibleInventory.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <ProductCell product={product} />
                            <StatusBadge value={product.stock <= 5 ? "Low Stock" : "In Stock"} />
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Quick Adjust Stock:</span>
                            <StockEditor value={product.stock} onSave={(stock) => updateStock(product, stock)} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No inventory records found.</div>
                    )}
                  </div>

                  <Pagination page={page} total={inventoryProducts.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "orders" && (
                <Panel title="Customer Orders Management">
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search orders, customer names, status..." /></Toolbar>
                  
                  {/* Desktop Data Table */}
                  <div className="hidden md:block">
                    <DataTable
                      headers={["Order ID", "Customer", "Date", "Amount", "Payment", "Order Status", "Actions"]}
                      empty="No orders found."
                      rows={visibleOrders.map((order) => [
                        shortId(order.id),
                        order.customer?.name || "Customer",
                        formatDate(order.createdAt),
                        formatMoney(order.totalAmount, settings.currency),
                        <StatusBadge key="payment" value={order.paymentStatus} />,
                        <OrderStatusSelect key="status" value={order.status} onChange={(value) => updateOrderStatus(order, value)} />,
                        <button key="view" type="button" onClick={() => setOrderModal(order)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-xs">Details</button>,
                      ])}
                    />
                  </div>

                  {/* Mobile Android Native Order Cards */}
                  <div className="md:hidden space-y-3">
                    {visibleOrders.length ? (
                      visibleOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                              <span className="font-mono font-bold text-slate-900 text-xs">{shortId(order.id)}</span>
                              <p className="text-[11px] text-slate-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <StatusBadge value={order.status} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">{order.customer?.name || "Guest Customer"}</p>
                              <p className="text-slate-500 text-[11px]">{order.customer?.email}</p>
                            </div>
                            <p className="text-base font-bold text-slate-950">{formatMoney(order.totalAmount, settings.currency)}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <OrderStatusSelect value={order.status} onChange={(value) => updateOrderStatus(order, value)} />
                            <button onClick={() => setOrderModal(order)} className="px-4 py-2 bg-slate-900 text-[#D4AF37] font-semibold rounded-lg text-xs shadow-sm">Details</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No orders found.</div>
                    )}
                  </div>

                  <Pagination page={page} total={filteredOrders.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "customers" && (
                <Panel title="Customer Accounts">
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search customer accounts..." /></Toolbar>
                  
                  {/* Desktop Data Table */}
                  <div className="hidden md:block">
                    <DataTable
                      headers={["Name", "Email", "Phone", "Total Orders", "Actions"]}
                      empty="No customers found."
                      rows={visibleCustomers.map((customer) => [
                        customer.name,
                        customer.email,
                        customer.phone || "-",
                        customer._count?.orders || 0,
                        <button key="view" type="button" onClick={() => setCustomerModal(customer)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-xs">View Profile</button>,
                      ])}
                    />
                  </div>

                  {/* Mobile Android Native Customer Cards */}
                  <div className="md:hidden space-y-3">
                    {visibleCustomers.length ? (
                      visibleCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-[#D4AF37] font-bold flex items-center justify-center text-sm shrink-0">
                              {customer.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 text-xs">{customer.name}</h4>
                              <p className="text-[11px] text-slate-500">{customer.email}</p>
                              <span className="text-[10px] text-slate-400 font-semibold">{customer._count?.orders || 0} Orders</span>
                            </div>
                          </div>
                          <button onClick={() => setCustomerModal(customer)} className="px-3 py-1.5 bg-slate-900 text-[#D4AF37] font-semibold rounded-md text-xs">View</button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No customers found.</div>
                    )}
                  </div>

                  <Pagination page={page} total={filteredCustomers.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {/* Mobile Android Floating Action Button (FAB) */}
              {(activeTab === "products" || activeTab === "categories") && (
                <button
                  type="button"
                  onClick={() => (activeTab === "products" ? openProduct() : openCategory())}
                  className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-slate-950 rounded-full shadow-2xl flex items-center justify-center font-bold text-2xl active:scale-95 transition-transform border border-amber-300/40"
                  aria-label="Add New Item"
                >
                  +
                </button>
              )}

              {activeTab === "settings" && (
                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                  <Panel title="Store Settings">
                    <form onSubmit={saveSettings} className="grid gap-4 sm:grid-cols-2">
                      <Field label="Store Name" value={settingsForm.storeName} onChange={(value) => setSettingsForm({ ...settingsForm, storeName: value })} required />
                      <Field label="Contact Email" type="email" value={settingsForm.contactEmail} onChange={(value) => setSettingsForm({ ...settingsForm, contactEmail: value })} required />
                      <Field label="Currency" value={settingsForm.currency} onChange={(value) => setSettingsForm({ ...settingsForm, currency: value })} required />
                      <Field label="Shipping Charge" type="number" value={String(settingsForm.shippingCharge)} onChange={(value) => setSettingsForm({ ...settingsForm, shippingCharge: Number(value) })} />
                      <Field label="Tax Percentage" type="number" value={String(settingsForm.taxPercentage)} onChange={(value) => setSettingsForm({ ...settingsForm, taxPercentage: Number(value) })} />
                      <ImageUpload label="Store Logo" value={settingsForm.storeLogo} onChange={(value) => setSettingsForm({ ...settingsForm, storeLogo: value })} />
                      <div className="sm:col-span-2"><Button type="submit">Save Settings</Button></div>
                    </form>
                  </Panel>
                  <Panel title="Change Password">
                    <form onSubmit={changePassword} className="space-y-4">
                      <Field label="Current Password" type="password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} required />
                      <Field label="New Password" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} required />
                      <Button type="submit">Update Password</Button>
                    </form>
                  </Panel>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {productModal.open && (
        <Modal title={productModal.id ? "Edit Product" : "Add Product"} onClose={() => setProductModal({ open: false })}>
          <form onSubmit={saveProduct} className="grid gap-4 sm:grid-cols-2">
            <Field label="Product Name" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value })} required />
            <Field label="SKU" value={productForm.sku} onChange={(value) => setProductForm({ ...productForm, sku: value })} />
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select required value={productForm.categoryName} onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#C9A648]">
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
            </label>
            <Field label="Price" type="number" value={productForm.price} onChange={(value) => setProductForm({ ...productForm, price: value })} required />
            <Field label="Sale Price" type="number" value={productForm.discountPrice} onChange={(value) => setProductForm({ ...productForm, discountPrice: value })} />
            <Field label="Stock Quantity" type="number" value={productForm.stock} onChange={(value) => setProductForm({ ...productForm, stock: value })} required />
            <label className="sm:col-span-2 block text-sm font-medium text-slate-700">
              Description
              <textarea required rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
            </label>

            {/* Product Detail Accordion Tabs Section */}
            <div className="sm:col-span-2 border-t border-b border-slate-200 py-4 my-2 space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#C9A648]">Product Accordion Tabs (Shown on Product Page)</h4>
              
              <label className="block text-sm font-medium text-slate-700">
                Product Information
                <textarea rows={2} placeholder="Detailed product info, fit, craftsmanship..." value={productForm.productInformation} onChange={(e) => setProductForm({ ...productForm, productInformation: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Delivery Timelines
                <textarea rows={2} placeholder="e.g., Express shipping: 2-4 days, Dispatch in 24 hours" value={productForm.deliveryTimelines} onChange={(e) => setProductForm({ ...productForm, deliveryTimelines: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Disclaimer
                <textarea rows={2} placeholder="e.g., Color may slightly vary due to studio lighting" value={productForm.disclaimer} onChange={(e) => setProductForm({ ...productForm, disclaimer: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Additional Information
                <textarea rows={2} placeholder="e.g., Fabric details, care instructions, customization availability" value={productForm.additionalInfo} onChange={(e) => setProductForm({ ...productForm, additionalInfo: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
              </label>
            </div>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })} className="h-4 w-4 accent-[#C9A648]" />
                Active product
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={productForm.isReturnable} onChange={(e) => setProductForm({ ...productForm, isReturnable: e.target.checked })} className="h-4 w-4 accent-[#C9A648]" />
                Returns & Exchange Available
              </label>
            </div>
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Product Images</span>
                <button type="button" onClick={() => setProductForm({ ...productForm, images: [...productForm.images, ""] })} className="text-sm font-semibold text-[#9b7a1d]">Add Image</button>
              </div>
              {productForm.images.map((image, index) => (
                <ImageUpload
                  key={index}
                  label={`Image ${index + 1}`}
                  value={image}
                  onChange={(value) => setProductForm({ ...productForm, images: productForm.images.map((item, itemIndex) => itemIndex === index ? value : item) })}
                />
              ))}
            </div>
            <div className="sm:col-span-2"><Button type="submit">{productModal.id ? "Save Product" : "Create Product"}</Button></div>
          </form>
        </Modal>
      )}

      {categoryModal.open && (
        <Modal title={categoryModal.id ? "Edit Category" : "Add Category"} onClose={() => setCategoryModal({ open: false })}>
          <form onSubmit={saveCategory} className="space-y-4">
            <Field label="Name" value={categoryForm.name} onChange={(value) => setCategoryForm({ ...categoryForm, name: value })} required />
            <ImageUpload label="Image" value={categoryForm.image} onChange={(value) => setCategoryForm({ ...categoryForm, image: value })} />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} className="h-4 w-4 accent-[#C9A648]" />
              Active category
            </label>
            <Button type="submit">{categoryModal.id ? "Save Category" : "Create Category"}</Button>
          </form>
        </Modal>
      )}

      {orderModal && (
        <Modal title={`Order ${shortId(orderModal.id)}`} onClose={() => setOrderModal(null)}>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Customer" value={`${orderModal.customer?.name || "Customer"} (${orderModal.customer?.email || "No email"})`} />
              <Info label="Order Date" value={formatDate(orderModal.createdAt)} />
              <Info label="Payment Method" value={orderModal.paymentMethod || "Online"} />
              <Info label="Payment Status" value={orderModal.paymentStatus} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Shipping Address</p>
              <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">{formatAddress(orderModal.shippingAddress)}</p>
            </div>
            <DataTable
              headers={["Product", "Qty", "Price"]}
              empty="No items found."
              rows={(orderModal.items || []).map((item) => [
                item.productName,
                item.quantity,
                formatMoney(item.price, settings.currency),
              ])}
            />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Order Timeline</p>
              <div className="space-y-2">
                {(orderModal.timeline || []).map((step) => (
                  <div key={step.status} className="flex items-center gap-3 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${step.completed ? "bg-[#C9A648]" : "bg-slate-300"}`} />
                    <span className={step.completed ? "text-slate-900" : "text-slate-500"}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusSelect value={orderModal.status} onChange={(value) => updateOrderStatus(orderModal, value)} />
              <Button variant="secondary" onClick={() => updateOrderStatus(orderModal, "CANCELLED")}>Cancel Order</Button>
            </div>
          </div>
        </Modal>
      )}

      {customerModal && (
        <Modal title={customerModal.name} onClose={() => setCustomerModal(null)}>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Email" value={customerModal.email} />
              <Info label="Phone" value={customerModal.phone || "-"} />
              <Info label="Total Orders" value={String(customerModal._count?.orders || 0)} />
              <Info label="Joined" value={formatDate(customerModal.createdAt)} />
            </div>
            <DataTable
              headers={["Order ID", "Date", "Amount", "Status"]}
              empty="No order history."
              rows={(customerModal.orders || []).map((order) => [
                shortId(order.id),
                formatDate(order.createdAt),
                formatMoney(order.totalAmount, settings.currency),
                <StatusBadge key="status" value={order.status} />,
              ])}
            />
          </div>
        </Modal>
      )}

      {confirm && <ConfirmationDialog state={confirm} onClose={() => setConfirm(null)} />}
      {toast && <ToastMessage toast={toast} />}
    </AdminShell>
  );
}

function AdminShell({
  children,
  activeTab,
  setActiveTab,
  mobileNavOpen,
  setMobileNavOpen,
}: {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
}) {
  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <div>
          <p className="text-lg font-serif tracking-[0.18em] text-[#D4AF37]">ELANTRAA</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Admin Control Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.id);
              setMobileNavOpen(false);
            }}
            className={`w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
              activeTab === item.id ? "bg-[#D4AF37] text-slate-950 font-semibold shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="m-3 rounded-lg border border-white/15 px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/10">
        Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 pb-20 lg:pb-0">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      {/* Android Native Bottom Navigation Bar (Mobile / Tablet) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950 border-t border-slate-800 shadow-2xl flex items-center justify-around h-16 px-1">
        {[
          {
            id: "dashboard" as Tab,
            label: "Overview",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            id: "products" as Tab,
            label: "Products",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ),
          },
          {
            id: "orders" as Tab,
            label: "Orders",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
          },
          {
            id: "categories" as Tab,
            label: "Category",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ),
          },
          {
            id: "settings" as Tab,
            label: "Settings",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            ),
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all ${
                isActive ? "text-[#D4AF37]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? "bg-[#D4AF37]/15" : ""}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-medium tracking-tight ${isActive ? "font-bold text-[#D4AF37]" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="lg:pl-64">{children}</div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-col gap-3 sm:flex-row">{children}</div>;
}

function DataTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length ? rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-middle text-slate-700">{cell}</td>)}</tr>) : (
            <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-slate-500">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648] sm:max-w-xs" />;
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#C9A648]">{children}</select>;
}

function Pagination({ page, total, pageSize, onPageChange }: { page: number; total: number; pageSize: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-950 text-white p-4 rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-4 bg-[#D4AF37] rounded-full"></span>
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-800 p-1.5 text-slate-300 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmationDialog({ state, onClose }: { state: NonNullable<ConfirmState>; onClose: () => void }) {
  return (
    <Modal title={state.title} onClose={onClose}>
      <p className="text-sm text-slate-600">{state.message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { state.onConfirm(); onClose(); }}>Delete</Button>
      </div>
    </Modal>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("paid") || normalized.includes("active") || normalized.includes("delivered") || normalized.includes("stock")
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : normalized.includes("pending") || normalized.includes("low")
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : normalized.includes("cancel") || normalized.includes("failed") || normalized.includes("draft")
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${tone}`}>{titleCase(value)}</span>;
}

function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) onChange(data.url);
      if (!res.ok) setError(data.error || "Upload failed. Paste an image URL instead.");
    } catch {
      setError("Upload failed. Paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="grid gap-2 sm:grid-cols-[72px_1fr_auto] sm:items-end">
      <div className="relative h-16 w-16 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {value ? <Image src={value} alt={label} fill className="object-cover" /> : null}
      </div>
      <Field label={label} value={value} onChange={onChange} />
      <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#C9A648]">
        {uploading ? "Uploading" : "Upload"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      {error ? <p className="text-xs text-rose-600 sm:col-span-3">{error}</p> : null}
    </div>
  );
}

function Button({ children, type = "button", onClick, variant = "primary" }: { children: React.ReactNode; type?: "button" | "submit"; onClick?: () => void; variant?: "primary" | "secondary" }) {
  return (
    <button type={type} onClick={onClick} className={variant === "primary" ? "rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-[#D4AF37] hover:bg-[#C9A648] hover:text-white" : "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-950"}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
    </label>
  );
}

function Metric({ label, value, tone = "default", className = "" }: { label: string; value: string | number; tone?: "default" | "warning" | "danger"; className?: string }) {
  const color = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : "text-slate-950";
  const borderTone = tone === "danger" ? "border-rose-200 bg-rose-50/40" : tone === "warning" ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border p-3.5 sm:p-4 shadow-sm transition-all ${borderTone} ${className}`}>
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">{label}</p>
      <p className={`mt-1.5 text-lg sm:text-2xl font-bold font-sans ${color} tracking-tight`}>{value}</p>
    </div>
  );
}

function ProductCell({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-md bg-slate-100">
        <Image src={product.images[0] || "/images/collections/dresses.png"} alt={product.name} fill className="object-cover" />
      </div>
      <span className="font-medium text-slate-900">{product.name}</span>
    </div>
  );
}

function CategoryCell({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-md bg-slate-100">
        {category.image ? <Image src={category.image} alt={category.name} fill className="object-cover" /> : null}
      </div>
      <span className="font-medium text-slate-900">{category.name}</span>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-3">
      <button type="button" onClick={onEdit} className="text-sm font-semibold text-[#9b7a1d]">Edit</button>
      <button type="button" onClick={onDelete} className="text-sm font-semibold text-rose-600">Delete</button>
    </div>
  );
}

function StockEditor({ value, onSave }: { value: number; onSave: (stock: number) => void }) {
  const [stock, setStock] = useState(String(value));
  return (
    <div className="flex gap-2">
      <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      <button type="button" onClick={() => onSave(Number(stock || 0))} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold">Save</button>
    </div>
  );
}

function OrderStatusSelect({ value, onChange }: { value: OrderStatus; onChange: (value: OrderStatus) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as OrderStatus)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm">
      {["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
    </select>
  );
}

function ToastMessage({ toast }: { toast: NonNullable<Toast> }) {
  return <div className={`fixed bottom-5 right-5 z-[60] rounded-md px-4 py-3 text-sm font-semibold shadow-lg ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>{toast.message}</div>;
}

function LoadingState() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading admin panel...</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
      <p className="font-semibold text-rose-700">Unable to load admin panel</p>
      <p className="mt-1 text-sm text-rose-600">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Retry</button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-slate-900">{value}</p></div>;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function shortId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAddress(address?: Record<string, string>) {
  if (!address) return "No shipping address provided.";
  return Object.values(address).filter(Boolean).join(", ") || "No shipping address provided.";
}
