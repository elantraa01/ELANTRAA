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
  sizeChart?: string | null;
  sizeChartCm?: string | null;
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
