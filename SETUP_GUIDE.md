# ELANTRAA Haute Couture — Comprehensive Setup & Testing Guide

Welcome to **ELANTRAA**, a luxury haute couture e-commerce web application built using Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, NextAuth.js, and Razorpay.

---

## 🚀 1. Testing the Local Application

Your development server is running locally at **`http://localhost:3000`**.

### 📋 Interactive Feature Testing Checklist

#### A. Global Layout & Branding
- [x] **Splash Screen**: Animated gold-on-dark ELANTRAA logo splash screen on initial page load.
- [x] **Floating WhatsApp Button**: Fixed bottom-right button opening WhatsApp pre-filled query (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
- [x] **Header & Navigation**: Sticky navbar with search overlay, account link, wishlist badge counter, and shopping bag badge counter.

#### B. Home Page (`/`)
- [x] **Hero Banner**: Full-width luxury fashion hero banner with CTAs.
- [x] **Featured Collections**: Interactive category cards (*Dresses, Ethnic Wear, Menswear*).
- [x] **New Arrivals & Best Sellers**: Product cards with hover image zoom, quick view, add-to-bag, and wishlist heart triggers.
- [x] **Brand Story & Newsletter**: Haute couture heritage section and email subscription form.

#### C. Shop & Category Pages (`/shop` & `/category/[slug]`)
- [x] **Product Catalogue**: Grid product listing powered by PostgreSQL queries.
- [x] **Filtering Sidebar**: Filter by category, size, color, price range, and minimum customer rating.
- [x] **Mobile Drawer**: Collapsible filter drawer for small screens.
- [x] **Category Pages**: Dedicated pages for `/category/women`, `/category/men`, `/category/accessories`, `/category/new-arrivals`, and `/category/sale`.

#### D. Product Detail Page (PDP) (`/products/[slug]`)
- [x] **Image Gallery & Zoom**: Hover magnification lens + thumbnail carousel + fullscreen lightbox preview.
- [x] **Variant Pickers**: Interactive color swatches and size selection.
- [x] **Size Guide Modal**: Modal displaying garment measurements in inches.
- [x] **Quantity & CTAs**: `+` / `-` controls, gold gradient *"Add To Bag"* button, and wishlist toggle.
- [x] **Customer Reviews**: Rating breakdown bars (4.9 / 5.0) and interactive *"Write a Review"* modal.

#### E. Shopping Bag & Checkout Flow (`/cart` & `/checkout`)
- [x] **Shopping Bag**: Real-time quantity edits, item removal, and order summary.
- [x] **Promo Codes**: Interactive promo code input (Try code `ELANTRAAGOLD` for ₹500 off).
- [x] **Express Checkout**: Shipping address form with **Guest Checkout support**.
- [x] **Razorpay Test Mode**: Integrated Razorpay test payment popup modal (`/api/razorpay/order`).
- [x] **Order Confirmation**: Receipt page (`/checkout/success?orderId=...`) with shipping delivery timeline.

#### F. Authentication & User Account (`/login`, `/signup`, `/account`)
- [x] **NextAuth.js Auth**: Credentials email/password login + Google OAuth options.
- [x] **1-Click Demo Logins**:
  - Click **"Client Demo"** to log in as a customer.
  - Click **"Admin Demo"** to log in as an administrator.
- [x] **Account Dashboard**:
  - **Order History Tab**: Past orders list with delivery status badges (*SHIPPED, DELIVERED*).
  - **Saved Addresses Tab**: Address cards with *Add New Address* form modal.
  - **My Wishlist Tab**: Saved products grid with quick view and move to bag.

#### G. Admin Control Panel (`/admin`)
- [x] **Protected Route**: Access restricted to users with `ADMIN` role.
- [x] **Product CRUD**: Create new products, edit price/stock, delete products, toggle `Active`/`Hidden` status, toggle `Featured` status.
- [x] **Order Fulfillment**: Update order status (*Pending, Confirmed, Shipped, Delivered, Cancelled*).
- [x] **Customers View**: List registered users, email addresses, and total order counts.

---

## 🗄️ 2. PostgreSQL Database Setup Guide

Follow these steps to connect your PostgreSQL database and run migrations:

### Step 1: Update Environment Connection String
Open your [`.env.local`](file:///d:/ELANTRAA/.env.local) file and configure your PostgreSQL database URL:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/elantraa?schema=public"
```

### Step 2: Run Prisma Database Migrations
Execute the migration command in your terminal to create the database schema:

```bash
npx prisma migrate dev --name init
```

### Step 3: Seed Dummy Products & Categories
Populate your database with 10 dummy fashion products and category trees:

```bash
npm run db:seed
```

---

## 🔑 3. Environment Variables Reference

Below is the complete list of environment variables used by ELANTRAA:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elantraa?schema=public"

# App & Public Variables
NEXT_PUBLIC_WHATSAPP_NUMBER="919015342951"

# NextAuth.js Authentication
NEXTAUTH_SECRET="elantraa_luxury_haute_couture_secret_key_2026"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID="rzp_test_elantraa_key_123"
RAZORPAY_KEY_SECRET="rzp_test_elantraa_secret_456"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_elantraa_key_123"

# Email Notifications (Nodemailer / Resend)
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
EMAIL_FROM="ELANTRAA Concierge <elantraa.01@gmail.com>"
```

---

## 🛠️ 4. Useful Project Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle and checks all TypeScript types |
| `npm run start` | Starts Next.js production server |
| `npx tsc --noEmit` | Checks for TypeScript errors across the codebase |
| `npx prisma studio` | Opens interactive Prisma web GUI database manager |
| `npm run db:seed` | Runs seed script to insert dummy products into PostgreSQL |

---

## 📄 5. Site Policy & System Pages

- [x] **Shipping Policy**: `/shipping`
- [x] **Returns & Exchanges**: `/returns`
- [x] **Privacy Policy**: `/privacy`
- [x] **Terms & Conditions**: `/terms`
- [x] **Sitemap**: `/sitemap.xml`
- [x] **Robots Rule**: `/robots.txt`
- [x] **404 Page**: Custom luxury `not-found` page.
