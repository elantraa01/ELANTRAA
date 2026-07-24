export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  categorySlug: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  details?: string[];
  materials?: string;
  careInstructions?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  image: string;
  itemCount: string;
}

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    title: "Haute Couture Dresses",
    subtitle: "Fluid silhouettes & evening drapes",
    slug: "dresses",
    image: "/images/collections/dresses.png",
    itemCount: "24 Designs",
  },
  {
    id: "col-2",
    title: "Tailored Menswear",
    subtitle: "Crisp shirts & structured overshirts",
    slug: "menswear",
    image: "/images/collections/menswear.png",
    itemCount: "18 Designs",
  },
  {
    id: "col-3",
    title: "Festive Ethnic Wear",
    subtitle: "Embroidered kurtas & statement co-ords",
    slug: "ethnic",
    image: "/images/collections/ethnic.png",
    itemCount: "30 Designs",
  },
  {
    id: "col-4",
    title: "Gold Accent Accessories",
    subtitle: "Handcrafted leather totes & jewelry",
    slug: "accessories",
    image: "/images/collections/dresses.png",
    itemCount: "15 Items",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aurelia Satin Wrap Dress",
    slug: "aurelia-satin-wrap-dress",
    description: "A gold-toned satin wrap dress with a soft drape, flattering waist tie, and evening-ready finish. Crafted from pure mulberry silk satin with hand-finished hemline.",
    price: 5499,
    discountPrice: 4799,
    category: "Dresses",
    categorySlug: "dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Champagne", "Ivory"],
    images: [
      "/images/collections/dresses.png",
      "/images/hero/hero_banner.png",
      "/images/collections/ethnic.png",
    ],
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 38,
    createdAt: "2026-07-01",
    details: [
      "Wrap-style front with adjustable waist tie",
      "V-neckline with delicate metallic trim",
      "Floor-length fluid drape silhouette",
      "Unlined for lightweight breathability",
    ],
    materials: "100% Pure Mulberry Silk Satin with Gold Thread Accent",
    careInstructions: "Dry clean only. Cool iron on reverse using press cloth.",
  },
  {
    id: "prod-2",
    name: "Noor Embroidered Kurta Set",
    slug: "noor-embroidered-kurta-set",
    description: "A lightweight kurta set with tonal embroidery and a relaxed festive silhouette.",
    price: 3999,
    discountPrice: 3499,
    category: "Ethnic",
    categorySlug: "ethnic",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Gold"],
    images: ["/images/collections/ethnic.png", "/images/collections/dresses.png"],
    stock: 18,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.8,
    reviewCount: 24,
    createdAt: "2026-07-10",
    details: ["Includes straight kurta and matching pants", "Intricate gold zari needlework"],
    materials: "Organic Cotton & Raw Silk Blend",
    careInstructions: "Gentle hand wash in cold water or dry clean.",
  },
  {
    id: "prod-3",
    name: "Elan Classic Oxford Shirt",
    slug: "elan-classic-oxford-shirt",
    description: "A crisp cotton oxford shirt designed for sharp everyday styling.",
    price: 2499,
    discountPrice: null,
    category: "Shirts",
    categorySlug: "shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Sky Blue"],
    images: ["/images/collections/menswear.png", "/images/collections/ethnic.png"],
    stock: 25,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.7,
    reviewCount: 42,
    createdAt: "2026-06-15",
    details: ["Button-down collar", "Mother-of-pearl buttons", "Curved hem"],
    materials: "100% Egyptian Giza Cotton",
    careInstructions: "Machine wash warm. Tumble dry low.",
  },
  {
    id: "prod-4",
    name: "Siena Linen Co-ord Set",
    slug: "siena-linen-coord-set",
    description: "A breathable linen blend co-ord set with tailored ease.",
    price: 4299,
    discountPrice: 3799,
    category: "Tops",
    categorySlug: "tops",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory", "Sage"],
    images: ["/images/collections/dresses.png", "/images/collections/ethnic.png"],
    stock: 8,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 19,
    createdAt: "2026-07-15",
  },
  {
    id: "prod-5",
    name: "Ryder Textured Overshirt",
    slug: "ryder-textured-overshirt",
    description: "A textured layerable overshirt with utility pockets and a structured fit.",
    price: 3299,
    discountPrice: 2999,
    category: "Outerwear",
    categorySlug: "outerwear",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Stone", "Olive"],
    images: ["/images/collections/menswear.png", "/images/hero/hero_banner.png"],
    stock: 14,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 31,
    createdAt: "2026-05-20",
  },
  {
    id: "prod-6",
    name: "Mira Pleated Midi Skirt",
    slug: "mira-pleated-midi-skirt",
    description: "A fluid pleated midi skirt with a clean waistband and soft movement.",
    price: 2899,
    discountPrice: null,
    category: "Dresses",
    categorySlug: "dresses",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Pearl", "Black"],
    images: ["/images/collections/dresses.png", "/images/collections/ethnic.png"],
    stock: 20,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.6,
    reviewCount: 15,
    createdAt: "2026-06-05",
  },
  {
    id: "prod-7",
    name: "Leora Pearl Button Blouse",
    slug: "leora-pearl-button-blouse",
    description: "A refined blouse with pearl-style buttons and a softly structured collar.",
    price: 2299,
    discountPrice: 1999,
    category: "Tops",
    categorySlug: "tops",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Blush"],
    images: ["/images/collections/ethnic.png", "/images/collections/dresses.png"],
    stock: 22,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.9,
    reviewCount: 27,
    createdAt: "2026-07-20",
  },
  {
    id: "prod-8",
    name: "Cairo Quilted Jacket",
    slug: "cairo-quilted-jacket",
    description: "A lightweight quilted jacket with a minimal profile and warm lining.",
    price: 4999,
    discountPrice: 4499,
    category: "Outerwear",
    categorySlug: "outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Charcoal"],
    images: ["/images/collections/menswear.png", "/images/hero/hero_banner.png"],
    stock: 6,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 45,
    createdAt: "2026-04-12",
  },
  {
    id: "prod-9",
    name: "Sol Gold Accent Tote",
    slug: "sol-gold-accent-tote",
    description: "A structured everyday tote finished with subtle gold hardware.",
    price: 3599,
    discountPrice: null,
    category: "Accessories",
    categorySlug: "accessories",
    sizes: ["One Size"],
    colors: ["White", "Tan", "Gold"],
    images: ["/images/collections/dresses.png", "/images/collections/ethnic.png"],
    stock: 15,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 52,
    createdAt: "2026-07-22",
  },
  {
    id: "prod-10",
    name: "Arden Slim Chino",
    slug: "arden-slim-chino",
    description: "A polished slim chino with stretch comfort for workdays and weekends.",
    price: 2799,
    discountPrice: 2399,
    category: "Shirts",
    categorySlug: "shirts",
    sizes: ["30", "32", "34", "36", "38"],
    colors: ["Khaki", "Navy"],
    images: ["/images/collections/menswear.png", "/images/hero/hero_banner.png"],
    stock: 30,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    rating: 4.5,
    reviewCount: 18,
    createdAt: "2026-03-01",
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userName: "Ananya Sharma",
    rating: 5,
    title: "Exquisite drape and luxurious silk quality!",
    comment: "I wore this for an evening gala in Delhi. The satin fabric feels divine against the skin and the champagne gold sheen looks incredible under warm lighting.",
    date: "July 18, 2026",
    verifiedBuyer: true,
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userName: "Vikram Malhotra",
    rating: 5,
    title: "Bought as a birthday gift for my wife",
    comment: "Packaging was supreme with ELANTRAA gold ribbon box. The fitting was true to size and she absolutely loved the metallic accent trim.",
    date: "July 12, 2026",
    verifiedBuyer: true,
  },
  {
    id: "rev-3",
    productId: "prod-1",
    userName: "Priya Roy",
    rating: 4,
    title: "Beautiful dress, prompt express shipping",
    comment: "The dress arrived within 48 hours. Stitching quality is top notch. Slightly longer than expected for 5'4 height, but easily hemmed.",
    date: "June 28, 2026",
    verifiedBuyer: true,
  },
];
