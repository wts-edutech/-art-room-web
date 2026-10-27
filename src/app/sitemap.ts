import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artroom-wts.com";
  const currentDate = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" }> = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/materials", priority: 0.9, changeFrequency: "weekly" },
    { path: "/materials/m3", priority: 0.85, changeFrequency: "weekly" },
    { path: "/materials/m4", priority: 0.85, changeFrequency: "weekly" },
    { path: "/artworks", priority: 0.9, changeFrequency: "weekly" },
    { path: "/news", priority: 0.8, changeFrequency: "weekly" },
    { path: "/ideas", priority: 0.8, changeFrequency: "weekly" },
    { path: "/awards", priority: 0.75, changeFrequency: "monthly" },
    { path: "/downloads", priority: 0.75, changeFrequency: "monthly" },
    { path: "/teachers", priority: 0.7, changeFrequency: "monthly" },
    { path: "/submissions", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.5, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
  ];

  return routes.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: currentDate,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
