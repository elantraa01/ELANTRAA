"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "dashboard" | "products" | "categories" | "inventory" | "orders" | "customers" | "settings";
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

type Toast = { type: "success" | "error"; message: string } | null;
type ConfirmState = { title: string; message: string; onConfirm: () => void } | null;

const navItems: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "inventory", label: "Inventory" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
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
};

const emptyCategory = {
  name: "",
  image: "",
  isActive: true,
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
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
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
      const [productData, categoryData, orderData, customerData, settingsData] = await Promise.all([
        request<{ products: Product[] }>("/api/admin/products"),
        request<{ categories: Category[] }>("/api/admin/categories"),
        request<{ orders: Order[] }>("/api/admin/orders"),
        request<{ users: Customer[] }>("/api/admin/customers"),
        request<{ settings: Settings }>("/api/admin/settings"),
      ]);
      setProducts(productData.products || []);
      setCategories(categoryData.categories || []);
      setOrders(orderData.orders || []);
      setCustomers(customerData.users || []);
      setSettings(settingsData.settings);
      setSettingsForm(settingsData.settings);
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

  const inventoryProducts = useMemo(
    () => products.filter((product) => [product.name, product.sku].join(" ").toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  const visibleProducts = paginate(filteredProducts, page, pageSize);
  const visibleCategories = paginate(filteredCategories, page, pageSize);
  const visibleOrders = paginate(filteredOrders, page, pageSize);
  const visibleCustomers = paginate(filteredCustomers, page, pageSize);
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
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Metric label="Total Orders" value={metrics.totalOrders} />
                    <Metric label="Total Revenue" value={formatMoney(metrics.totalRevenue, settings.currency)} />
                    <Metric label="Total Products" value={metrics.totalProducts} />
                    <Metric label="Pending Orders" value={metrics.pendingOrders} tone="warning" />
                    <Metric label="Low Stock Products" value={metrics.lowStockProducts} tone="danger" />
                  </div>
                  <Panel title="Recent Orders">
                    <DataTable
                      headers={["Order ID", "Customer", "Date", "Amount", "Payment", "Status", ""]}
                      empty="No orders yet."
                      rows={orders.slice(0, 6).map((order) => [
                        shortId(order.id),
                        order.customer?.name || "Customer",
                        formatDate(order.createdAt),
                        formatMoney(order.totalAmount, settings.currency),
                        <StatusBadge key="payment" value={order.paymentStatus} />,
                        <StatusBadge key="status" value={order.status} />,
                        <button key="view" type="button" onClick={() => setOrderModal(order)} className="text-sm font-semibold text-[#9b7a1d]">View</button>,
                      ])}
                    />
                  </Panel>
                </section>
              )}

              {activeTab === "products" && (
                <Panel title="Products" action={<Button onClick={() => openProduct()}>Add Product</Button>}>
                  <Toolbar>
                    <SearchBar value={query} onChange={setQuery} placeholder="Search products or SKU" />
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
                  <DataTable
                    headers={["Product", "SKU", "Category", "Price", "Stock", "Returns", "Status", ""]}
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
                  <Pagination page={page} total={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "categories" && (
                <Panel title="Categories" action={<Button onClick={() => openCategory()}>Add Category</Button>}>
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search categories" /></Toolbar>
                  <DataTable
                    headers={["Category", "Products", "Status", ""]}
                    empty="No categories found."
                    rows={visibleCategories.map((category) => [
                      <CategoryCell key="category" category={category} />,
                      category.productsCount || 0,
                      <StatusBadge key="status" value={category.isActive === false ? "Draft" : "Active"} />,
                      <RowActions key="actions" onEdit={() => openCategory(category)} onDelete={() => deleteCategory(category)} />,
                    ])}
                  />
                  <Pagination page={page} total={filteredCategories.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "inventory" && (
                <Panel title="Inventory">
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search inventory" /></Toolbar>
                  <DataTable
                    headers={["Product", "Stock Quantity", "Low Stock", "Update"]}
                    empty="No inventory records found."
                    rows={visibleInventory.map((product) => [
                      <ProductCell key="product" product={product} />,
                      product.stock,
                      <StatusBadge key="low" value={product.stock <= 5 ? "Low Stock" : "In Stock"} />,
                      <StockEditor key="stock" value={product.stock} onSave={(stock) => updateStock(product, stock)} />,
                    ])}
                  />
                  <Pagination page={page} total={inventoryProducts.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "orders" && (
                <Panel title="Orders">
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search orders, customers, status" /></Toolbar>
                  <DataTable
                    headers={["Order ID", "Customer", "Date", "Amount", "Payment", "Order Status", ""]}
                    empty="No orders found."
                    rows={visibleOrders.map((order) => [
                      shortId(order.id),
                      order.customer?.name || "Customer",
                      formatDate(order.createdAt),
                      formatMoney(order.totalAmount, settings.currency),
                      <StatusBadge key="payment" value={order.paymentStatus} />,
                      <OrderStatusSelect key="status" value={order.status} onChange={(value) => updateOrderStatus(order, value)} />,
                      <button key="view" type="button" onClick={() => setOrderModal(order)} className="text-sm font-semibold text-[#9b7a1d]">Details</button>,
                    ])}
                  />
                  <Pagination page={page} total={filteredOrders.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
              )}

              {activeTab === "customers" && (
                <Panel title="Customers">
                  <Toolbar><SearchBar value={query} onChange={setQuery} placeholder="Search customers" /></Toolbar>
                  <DataTable
                    headers={["Name", "Email", "Phone", "Total Orders", ""]}
                    empty="No customers found."
                    rows={visibleCustomers.map((customer) => [
                      customer.name,
                      customer.email,
                      customer.phone || "-",
                      customer._count?.orders || 0,
                      <button key="view" type="button" onClick={() => setCustomerModal(customer)} className="text-sm font-semibold text-[#9b7a1d]">View</button>,
                    ])}
                  />
                  <Pagination page={page} total={filteredCustomers.length} pageSize={pageSize} onPageChange={setPage} />
                </Panel>
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
              <textarea required rows={4} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C9A648]" />
            </label>
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
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-950 text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <div>
          <p className="text-lg font-serif tracking-[0.18em] text-[#D4AF37]">ELANTRAA</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Admin Panel</p>
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
            className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
              activeTab === item.id ? "bg-[#D4AF37] text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="m-3 rounded-md border border-white/15 px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/10">
        Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-2 py-1 text-sm">Close</button>
        </div>
        <div className="p-4">{children}</div>
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
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) onChange(data.url);
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

function Metric({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "warning" | "danger" }) {
  const color = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : "text-slate-950";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
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
