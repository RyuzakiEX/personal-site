import type { Metadata } from "next";
import { Rajdhani, Exo_2 } from "next/font/google";
import "./globals.css";
import { HOME_TITLE, SITE_NAME, SITE_URL, TABS } from "@/lib/tabs";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-exo2",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: TABS.about.description,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
};

// Tells search engines who the site is about and links the profiles that
// belong to the same person.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  alternateName: "Jorge Gabriel Adrian Adanza",
  jobTitle: "Full Stack Developer",
  url: SITE_URL,
  image: `${SITE_URL}/profile-picture.jpeg`,
  sameAs: [
    "https://linkedin.com/in/jorge-gabriel-adrian-adanza-770656193",
    "https://github.com/RyuzakiEX",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${exo2.variable}`}>
      <head>
        {/* Fetch the robot model alongside the page's JavaScript, not after it */}
        <link
          rel="preload"
          href="/models/robot-expressive.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
