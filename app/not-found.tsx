import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, TAB_ORDER, TABS } from "@/lib/tabs";

// Next adds noindex to 404 responses itself.
export const metadata: Metadata = {
  title: `Page not found — ${SITE_NAME}`,
};

// Shown for any path that isn't one of the tabs, with a way back to each.
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center bg-[radial-gradient(circle_at_50%_40%,#1a2a5e_0%,#0a0f1e_60%)]">
      <Link
        href="/"
        className="glow-text text-sm tracking-[0.5em] pl-[0.5em] uppercase"
      >
        {SITE_NAME}
      </Link>
      <div className="space-y-3">
        <h1 className="text-8xl font-bold glow-text">404</h1>
        <p className="text-xl text-gray-300 tracking-widest uppercase">
          Page not found
        </p>
        <p className="text-gray-400 max-w-md">
          This page doesn&apos;t exist or has moved. Try one of these instead:
        </p>
      </div>
      <nav className="flex flex-wrap justify-center gap-3">
        {TAB_ORDER.map((tab) => (
          <Link
            key={tab}
            href={TABS[tab].path}
            className="px-5 py-2.5 border border-cyan-glow/50 text-cyan-glow rounded-lg bg-cyan-glow/10 hover:bg-cyan-glow/20 hover:shadow-glow text-sm font-semibold tracking-widest uppercase transition-all duration-200"
          >
            {TABS[tab].label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
