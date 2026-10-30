"use client";

import { AnimatePresence, motion } from "framer-motion";

// Covers the page until the 3D stage is ready, so content and robot
// appear together instead of the robot popping in late.
export default function IntroOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="intro-overlay"
          aria-hidden
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeOut" } }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-navy-950"
        >
          <noscript>
            <style>{"#intro-overlay{display:none}"}</style>
          </noscript>
          <span className="glow-text text-sm tracking-[0.5em] pl-[0.5em]">JORGE ADANZA</span>
          <div className="h-px w-40 overflow-hidden bg-navy-800">
            <div className="h-full w-1/3 bg-cyan-glow animate-intro-bar" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
