import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elantraa",
    short_name: "Elantraa",
    description: "Elantraa Luxury Haute Couture & Bespoke Fashion",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Products Catalogue",
        url: "/admin",
        description: "Manage products, inventory & catalogue",
      },
      {
        name: "Customer Orders",
        url: "/admin",
        description: "View and update customer orders",
      },
      {
        name: "Promo Codes",
        url: "/admin",
        description: "Manage discount promo codes",
      },
    ],
  };
}
