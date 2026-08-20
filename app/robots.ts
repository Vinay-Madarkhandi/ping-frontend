import type { MetadataRoute } from "next";

const siteUrl = "https://pingmeheart.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/monitors",
          "/analytics",
          "/alerts",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
