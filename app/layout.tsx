import type { Metadata } from "next";
import { Rajdhani, Exo_2 } from "next/font/google";
import "./globals.css";
import { HOME_TITLE, SITE_NAME, SITE_URL, TABS } from "@/lib/tabs";
import { ROBOT_URL } from "@/components/three/model";

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

// Without JavaScript nothing animates in or responds to clicks, so show the
// content as it is and hide what can't work. Elements opt in with the data
// attributes below.
const noScriptCss = [
  // The intro overlay never lifts.
  "#intro-overlay{display:none}",
  // Entrance animations are server-rendered at opacity 0. Match exactly 0, not
  // values like 0.5.
  'main,main [style*="opacity:0;"],main [style$="opacity:0"]{opacity:1!important;transform:none!important}',
  // The empty robot stage would still catch taps on touch screens.
  "[data-robot-stage]{visibility:hidden}",
  // The menu can't toggle, so show the mobile links open.
  "[data-menu-toggle],[data-js-only]{display:none!important}",
  "[data-mobile-menu]{max-height:none!important;opacity:1!important}",
  // The open menu makes the fixed bar tall enough to cover the top of the
  // page, so on mobile let it scroll away with the content instead.
  "@media (max-width:767px){[data-site-nav]{position:relative!important}[data-page-body]{padding-top:1.5rem!important}}",
].join("");

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
          href={ROBOT_URL}
          as="fetch"
          crossOrigin="anonymous"
        />
        <noscript>
          {/* Raw HTML, since React would escape the selectors' quotes. */}
          <style dangerouslySetInnerHTML={{ __html: noScriptCss }} />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
