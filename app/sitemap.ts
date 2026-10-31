import type { MetadataRoute } from "next";
import { SITE_URL, TAB_ORDER, TABS } from "@/lib/tabs";

export default function sitemap(): MetadataRoute.Sitemap {
  return TAB_ORDER.map((tab) => ({
    url: `${SITE_URL}${TABS[tab].path === "/" ? "" : TABS[tab].path}`,
    changeFrequency: "monthly",
    priority: tab === "about" ? 1 : 0.8,
  }));
}
