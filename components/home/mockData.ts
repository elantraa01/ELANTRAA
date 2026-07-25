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

export const MOCK_COLLECTIONS: Collection[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_REVIEWS: Review[] = [];
