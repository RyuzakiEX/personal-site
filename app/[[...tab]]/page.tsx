import type { Metadata } from "next";
import Home from "@/components/Home";
import { SITE_NAME, TAB_ORDER, TABS, tabFromPath } from "@/lib/tabs";

interface PageProps {
  params: { tab?: string[] };
}

// Only the four tab paths exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return TAB_ORDER.map((tab) => ({
    tab: TABS[tab].path === "/" ? [] : [TABS[tab].path.slice(1)],
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const { path, title, description } = TABS[tabFromPath(`/${params.tab?.join("/") ?? ""}`)];
  // Setting openGraph here replaces the image Next would inherit from
  // app/opengraph-image.tsx, so point at it explicitly.
  const images = [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, url: path, title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

// Every path renders the same page; Home picks the tab from the URL.
export default function Page() {
  return <Home />;
}
