"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AboutMe from "@/components/sections/AboutMe";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";

export type Tab = "about" | "experience" | "projects" | "contact";

const sections: Record<Tab, React.ComponentType> = {
  about: AboutMe,
  experience: Experience,
  projects: Projects,
  contact: Contact,
};

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(4px)" },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const ActiveSection = sections[activeTab];

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ActiveSection />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
