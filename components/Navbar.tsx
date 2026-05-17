"use client";

import type { Tab } from "@/app/page";

const tabs: { id: Tab; label: string }[] = [
  { id: "about", label: "About Me" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-lg border-b border-navy-800/60">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <span className="glow-text text-lg font-bold tracking-[0.2em] uppercase">
          Jorge Adanza
        </span>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`nav-tab ${
                activeTab === tab.id
                  ? "nav-tab-active"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
