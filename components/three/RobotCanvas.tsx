"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Tab } from "@/app/page";
import Robot, { ROBOT_HEIGHT, type PointerState } from "./Robot";
import { COLORS } from "./palette";

const FOV = 30;
// Space the camera keeps in frame around the robot, leaving room for raised arms.
const FRAME_HEIGHT = ROBOT_HEIGHT + 0.8;
const FRAME_WIDTH = 4;
// The small mobile card frames tighter so the robot isn't tiny; raised arms
// may brush its edges.
const COMPACT_MAX_WIDTH = 240;
const COMPACT_FRAME_WIDTH = 3;
// Frames to render after the model mounts before reporting ready, so its
// shaders are compiled and the environment map is drawn.
const READY_AFTER_FRAMES = 2;

// Backs the camera off far enough to fit the robot in both directions,
// whether the stage is a tall desktop column or the small mobile card.
function FitCamera() {
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera);
  const { width, height } = useThree((state) => state.size);

  useEffect(() => {
    const aspect = width / height;
    const frameWidth = width <= COMPACT_MAX_WIDTH ? COMPACT_FRAME_WIDTH : FRAME_WIDTH;
    const vertical = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const distance = Math.max(FRAME_HEIGHT / 2 / vertical, frameWidth / 2 / (vertical * aspect));
    camera.position.set(0, 0.2, distance);
    camera.lookAt(0, 0, 0);
  }, [camera, width, height]);

  return null;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);

  useFrame(() => {
    frames.current += 1;
    if (frames.current === READY_AFTER_FRAMES) onReady();
  });

  return null;
}

// Soft studio reflections for the robot's glossy shell, rendered once.
function StudioReflections() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={[COLORS.navy900]} />
      <Lightformer intensity={3} position={[0, 5, 2]} scale={[10, 3, 1]} target={[0, 0, 0]} />
      <Lightformer intensity={1.5} position={[0, 1, 6]} scale={[8, 2, 1]} target={[0, 0, 0]} />
      <Lightformer intensity={3} color={COLORS.cyan} position={[-5, 0.5, 1]} scale={[3, 9, 1]} target={[0, 0, 0]} />
      <Lightformer intensity={2} color={COLORS.electric} position={[5, -1, -1]} scale={[3, 9, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

interface RobotCanvasProps {
  activeTab: Tab;
  revealed: boolean;
  onReady: () => void;
}

export default function RobotCanvas({ activeTab, revealed, onReady }: RobotCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });

  // Track the cursor anywhere on the page, relative to the stage, so the
  // robot keeps watching while the visitor reads the content beside it.
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const rect = container.current?.getBoundingClientRect();
      if (!rect) return;
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.current.active = true;
    };
    const handleLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", handleMove);
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div ref={container} className="absolute inset-0">
      <Canvas
        aria-hidden
        dpr={[1, 1.75]}
        camera={{ fov: FOV, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        resize={{ offsetSize: true }}
      >
        <FitCamera />
        <StudioReflections />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        {/* Cyan rim light from behind */}
        <directionalLight position={[-3, 2, -4]} intensity={2.5} color={COLORS.cyan} />
        <Suspense fallback={null}>
          <Robot activeTab={activeTab} revealed={revealed} pointer={pointer} />
          <ContactShadows
            position={[0, -ROBOT_HEIGHT / 2, 0]}
            scale={5}
            blur={2.4}
            far={2}
            opacity={0.6}
            resolution={256}
          />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
