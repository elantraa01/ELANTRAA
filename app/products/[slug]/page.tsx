import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

type ProductPageProps = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";

async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountPrice: true,
        sizes: true,
        colors: true,
        tags: true,
        images: true,
        stock: true,
        isFeatured: true,
        isReturnable: true,
        productInformation: true,
        deliveryTimelines: true,
        disclaimer: true,
        additionalInfo: true,
        sizeChart: true,
        sizeChartCm: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            id: true,
            productId: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) return null;

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      category: product.category?.name || "Uncategorized",
      categorySlug: product.category?.slug || "uncategorized",
      sizes: product.sizes,
      colors: product.colors,
      tags: Array.isArray(product.tags) ? product.tags : [],
      images: product.images,
      stock: product.stock,
      isFeatured: product.isFeatured,
      isReturnable: product.isReturnable !== false,
      rating: product.reviews.length > 0 ? Math.round(avgRating * 10) / 10 : 0,
      reviewCount: product.reviews.length,
      createdAt: product.createdAt.toISOString(),
      productInformation: product.productInformation || "",
      deliveryTimelines: product.deliveryTimelines || "",
      disclaimer: product.disclaimer || "",
      additionalInfo: product.additionalInfo || "",
      sizeChart: product.sizeChart || null,
      sizeChartCm: product.sizeChartCm || null,
      details: [],
      materials: "",
      careInstructions: "",
      reviews: product.reviews.map((review) => ({
        id: review.id,
        productId: review.productId,
        userName: review.user?.name || "Client",
        rating: review.rating,
        title: "",
        comment: review.comment || "",
        date: new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        verifiedBuyer: true,
      })),
    };
  } catch (error) {
    console.error("getProductBySlug error:", error);
    return null;
  }
}

function truncateDescription(description: string) {
  const normalized = description.replace(/\s+/g, " ").trim();
  return normalized.length > 155 ? `${normalized.slice(0, 152)}...` : normalized;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const description = truncateDescription(product.description);
  const image = product.images[0] || "/images/logo/logo.png";
  const title = `${product.name} | ${product.category}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/${product.slug}`,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://elantraa.in";

  const productUrl = `${siteUrl}/products/${product.slug}`;
  const effectivePrice = product.discountPrice ?? product.price;

  // Format images as absolute URLs for Google Bot indexing
  const absoluteImages = (product.images || []).map((img) =>
    img.startsWith("http") ? img : `${siteUrl}${img.startsWith("/") ? "" : "/"}${img}`
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: absoluteImages.length > 0 ? absoluteImages : [`${siteUrl}/images/logo/logo.png`],
    sku: product.slug,
    category: typeof product.category === "string" ? product.category : ((product.category as unknown as { name?: string })?.name || "Luxury Apparel"),
    brand: {
      "@type": "Brand",
      name: "ELANTRAA",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: effectivePrice,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "ELANTRAA",
        url: siteUrl,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 4,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 5,
            maxValue: 10,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: product.isReturnable
          ? "https://schema.org/MerchantReturnFiniteReturnWindow"
          : "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(product.reviews && product.reviews.length > 0
      ? {
          review: product.reviews.slice(0, 5).map((rev) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: rev.rating,
              bestRating: 5,
            },
            author: {
              "@type": "Person",
              name: rev.userName || "Verified Client",
            },
            reviewBody: rev.comment || "Exquisite luxury craftmanship.",
          })),
        }
      : {}),
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${siteUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: typeof product.category === "string" ? product.category : ((product.category as unknown as { name?: string })?.name || "Collection"),
        item: `${siteUrl}/category/${product.categorySlug || "all"}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
