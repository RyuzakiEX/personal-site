"use client";

import dynamic from "next/dynamic";
import type { Tab } from "@/app/page";
import { cn } from "@/lib/utils";
import { TAB_ACCENTS } from "@/components/three/palette";

// Start downloading the 3D code as soon as this module loads, not after hydration.
const loadRobotCanvas = () => import("@/components/three/RobotCanvas");
if (typeof window !== "undefined") void loadRobotCanvas();

const RobotCanvas = dynamic(loadRobotCanvas, { ssr: false });

interface RobotStageProps {
  activeTab: Tab;
  /** null until the client has checked for WebGL and reduced motion. */
  enable3D: boolean | null;
  revealed: boolean;
  onReady: () => void;
}

// The robot's own space. On large screens it is a sticky column beside the
// content. On small screens it is a small frosted card pinned to the
// bottom-left corner. The desktop column takes clicks, so the robot can be
// poked there. The card takes taps on touch screens, so the robot can be poked
// there too, but lets clicks through to the content in a narrow desktop window.
export default function RobotStage({ activeTab, enable3D, revealed, onReady }: RobotStageProps) {
  return (
    <aside
      aria-hidden
      className={cn(
        "pointer-events-none fixed bottom-4 left-4 z-40 h-32 w-24 overflow-hidden rounded-2xl border border-navy-800 bg-navy-950/80 shadow-glow backdrop-blur-md transition-opacity duration-700 [@media(hover:none)]:pointer-events-auto",
        "lg:pointer-events-auto lg:sticky lg:inset-auto lg:top-24 lg:z-auto lg:h-[calc(100vh-8rem)] lg:w-auto lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none",
        revealed ? "opacity-100" : "opacity-0"
      )}
    >
      {/* One glow per tab, crossfaded, since gradients can't be transitioned. */}
      {(Object.entries(TAB_ACCENTS) as [Tab, string][]).map(([tab, color]) => (
        <div
          key={tab}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            tab === activeTab ? "opacity-100" : "opacity-0"
          )}
          // 24 is the hex for 14% alpha.
          style={{ backgroundImage: `radial-gradient(closest-side, ${color}24, transparent)` }}
        />
      ))}

      {enable3D && <RobotCanvas activeTab={activeTab} revealed={revealed} onReady={onReady} />}
      {enable3D === false && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 lg:h-64 lg:w-64 rounded-full bg-[radial-gradient(circle_at_35%_30%,#e8f4ff,#3a6fd8_45%,#0a0f1e_78%)] shadow-glow-lg" />
        </div>
      )}
    </aside>
  );
}
