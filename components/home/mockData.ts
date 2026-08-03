export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  categorySlug: string;
  parentCategory?: string | null;
  parentCategorySlug?: string | null;
  sizes: string[];
  colors: string[];
  tags?: string[];
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive?: boolean;
  isReturnable?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  details?: string[];
  materials?: string;
  careInstructions?: string;
  productInformation?: string | null;
  deliveryTimelines?: string | null;
  disclaimer?: string | null;
  additionalInfo?: string | null;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
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
  targetUrl?: string;
}

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    title: "Women's Haute Couture",
    subtitle: "Fluid silhouettes & hand-embroidered silks",
    slug: "women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    itemCount: "48 SILHOUETTES",
    targetUrl: "/category/women",
  },
  {
    id: "col-2",
    title: "Tailored Menswear",
    subtitle: "Precision sharp cuts & Italian wool blends",
    slug: "men",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    itemCount: "32 Silhouettes",
    targetUrl: "/category/men",
  },
  {
    id: "col-3",
    title: "Luxury Accessories",
    subtitle: "Artisanal leather goods & heirloom jewelry",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    itemCount: "24 Items",
    targetUrl: "/category/accessories",
  },
  {
    id: "col-4",
    title: "Exclusive Sale",
    subtitle: "Curated privilege archive pieces",
    slug: "sale",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    itemCount: "Up to 30% Off",
    targetUrl: "/category/sale",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aurelia Mulberry Silk Evening Gown",
    slug: "aurelia-mulberry-silk-evening-gown",
    description: "Handcrafted from 100% pure Mulberry silk with subtle zari hand-embroidery along the plunging neckline and cascading train.",
    price: 34500,
    discountPrice: 29500,
    category: "Women",
    categorySlug: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Emerald", "Champagne Gold", "Midnight Black"],
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: "prod-2",
    name: "Milanese Cut Cashmere Blazer",
    slug: "milanese-cut-cashmere-blazer",
    description: "Structure meets softness in this double-breasted virgin cashmere blazer featuring pick-stitch lapels and horn buttons.",
    price: 42000,
    discountPrice: null,
    category: "Men",
    categorySlug: "men",
    sizes: ["38", "40", "42", "44"],
    colors: ["Charcoal Grey", "Navy Blue", "Camel"],
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 8,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 29,
  },
  {
    id: "prod-3",
    name: "Atelier Handcrafted Calfskin Tote",
    slug: "atelier-handcrafted-calfskin-tote",
    description: "Structured luxury tote carved from grain calfskin with hand-finished edges and polished 24k gold-plated brass hardware.",
    price: 28900,
    discountPrice: 24900,
    category: "Accessories",
    categorySlug: "accessories",
    sizes: ["One Size"],
    colors: ["Saddle Brown", "Onyx Black", "Ivory"],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 15,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 54,
  },
  {
    id: "prod-4",
    name: "Seraphina Draped Satin Cocktail Dress",
    slug: "seraphina-draped-satin-cocktail-dress",
    description: "Sculptural asymmetrical cocktail dress crafted from liquid satin with an internal corsetry boning for flawless fit.",
    price: 26500,
    discountPrice: 21200,
    category: "Women",
    categorySlug: "women",
    sizes: ["S", "M", "L"],
    colors: ["Ruby Red", "Champagne", "Sapphire"],
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 6,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: "prod-5",
    name: "Royal Heritage Zari Brocade Sherwani",
    slug: "royal-heritage-zari-brocade-sherwani",
    description: "Extravagant hand-embroidered Banarasi brocade sherwani adorned with micro-beading and gold metallic threadwork.",
    price: 58000,
    discountPrice: 49000,
    category: "Men",
    categorySlug: "men",
    sizes: ["38", "40", "42", "44"],
    colors: ["Ivory Gold", "Royal Crimson"],
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 5,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 5.0,
    reviewCount: 19,
  },
  {
    id: "prod-6",
    name: "Verona Silk Chiffon Scarf",
    slug: "verona-silk-chiffon-scarf",
    description: "Featherlight pure silk chiffon square scarf hand-printed with architectural botanical motifs and hand-rolled hems.",
    price: 8900,
    discountPrice: null,
    category: "Accessories",
    categorySlug: "accessories",
    sizes: ["One Size"],
    colors: ["Gold Flora", "Azure Sky", "Blush Pink"],
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 20,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 61,
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userName: "Aarya Sharma",
    userLocation: "Mumbai, India",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "Unmatched Craftsmanship & Fit",
    comment: "The Aurelia Mulberry Silk Gown is breathtaking. The drape of the silk and hand-embroidery exceeded every expectation for my sister's gala night.",
    date: "August 2026",
    verifiedBuyer: true,
  },
  {
    id: "rev-2",
    productId: "prod-2",
    userName: "Elena Rostova",
    userLocation: "Milan, Italy",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "Pure Bespoke Perfection",
    comment: "Bought the Milanese Cashmere Blazer for private events. The precision stitchwork matches standard Savile Row bespoke suits.",
    date: "July 2026",
    verifiedBuyer: true,
  },
  {
    id: "rev-3",
    productId: "prod-3",
    userName: "Devika Singhania",
    userLocation: "New Delhi, India",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "Exquisite Luxury & Speed",
    comment: "The calfskin tote arrived in luxury gift box packaging within 48 hours. Beautiful gold brass detailing and buttery soft leather.",
    date: "July 2026",
    verifiedBuyer: true,
  },
];
