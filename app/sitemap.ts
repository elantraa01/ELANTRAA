import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  const routes = [
    "",
    "/shop",
    "/cart",
    "/checkout",
    "/account",
    "/login",
    "/signup",
    "/category/women",
    "/category/men",
    "/category/accessories",
    "/category/new-arrivals",
    "/category/sale",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/shop" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/shop" ? 0.9 : 0.7,
  }));
}
