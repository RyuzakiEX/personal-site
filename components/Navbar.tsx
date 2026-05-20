"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (tab: Tab) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-lg border-b border-navy-800/60">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <span className="glow-text text-base sm:text-lg font-bold tracking-[0.2em] uppercase">
          Jorge Adanza
        </span>

        <div className="hidden md:flex gap-1">
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

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden p-2 text-gray-300 hover:text-cyan-glow transition-colors"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 flex flex-col gap-1 border-t border-navy-800/60">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`nav-tab text-left border-b-0 border-l-2 ${
                activeTab === tab.id
                  ? "text-cyan-glow border-cyan-glow"
                  : "text-gray-400 hover:text-white border-transparent"
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
