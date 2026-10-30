"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Navbar from "@/components/Navbar";
import RobotStage from "@/components/RobotStage";
import IntroOverlay from "@/components/ui/IntroOverlay";
import AboutMe from "@/components/sections/AboutMe";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import { use3DEnabled } from "@/hooks/use3DEnabled";

export type Tab = "about" | "experience" | "projects" | "contact";

// Navbar order. Moving to a later tab turns the content one way, an earlier
// tab the other.
const TAB_ORDER: Tab[] = ["about", "experience", "projects", "contact"];

const sections: Record<Tab, React.ComponentType> = {
  about: AboutMe,
  experience: Experience,
  projects: Projects,
  contact: Contact,
};

// Reveal the page even if the robot is slow to load or fails to start.
const MAX_INTRO_MS = 4000;

// Sections turn like the faces of a cube. Going forward, the old face swings
// away on its left edge and the new one swings in on its right edge; going
// back mirrors it. `direction` is 1 or -1.
const CUBE_ANGLE = 75;
const pageVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    rotateY: -CUBE_ANGLE * direction,
    originX: direction > 0 ? 1 : 0,
  }),
  animate: (direction: number) => ({
    opacity: 1,
    rotateY: 0,
    originX: direction > 0 ? 1 : 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: CUBE_ANGLE * direction,
    originX: direction > 0 ? 0 : 1,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  }),
};

const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function Home() {
  const [[activeTab, direction], setTab] = useState<[Tab, number]>(["about", 1]);
  const reduceMotion = useReducedMotion();
  const enable3D = use3DEnabled();
  const [sceneReady, setSceneReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const ActiveSection = sections[activeTab];

  const handleTabChange = useCallback((tab: Tab) => {
    setTab(([current, currentDirection]) => {
      if (tab === current) return [current, currentDirection];
      return [tab, TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(current) ? 1 : -1];
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), MAX_INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  const revealed = enable3D === false || sceneReady || timedOut;

  return (
    <div className="min-h-screen">
      <IntroOverlay visible={!revealed} />
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-44 lg:pb-16 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-12">
        <RobotStage
          activeTab={activeTab}
          enable3D={enable3D}
          revealed={revealed}
          onReady={handleSceneReady}
        />
        <motion.main
          initial={false}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0"
          // Vanish toward the middle of the screen, not the middle of a long section.
          style={{ perspective: 1200, perspectiveOrigin: "50% 50vh" }}
        >
          {/* Sections keep their fades but drop movement for reduced motion. */}
          <MotionConfig reducedMotion="user">
            <AnimatePresence
              mode="wait"
              custom={direction}
              // Start each section at its top, while neither section is visible.
              onExitComplete={() => window.scrollTo({ top: 0 })}
            >
              <motion.div
                key={activeTab}
                custom={direction}
                variants={reduceMotion ? fadeVariants : pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ActiveSection />
              </motion.div>
            </AnimatePresence>
          </MotionConfig>
        </motion.main>
      </div>
    </div>
  );
}
