"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { Tab } from "@/app/page";
import Robot, { ROBOT_HEIGHT, type PointerState } from "./Robot";
import { COLORS, TAB_ACCENTS } from "./palette";

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

interface CameraPose {
  /** Swing around the robot in radians. Positive moves the camera to the right. */
  azimuth: number;
  /** Camera height in world units. */
  height: number;
  /** Multiplier on the distance that fits the robot in frame. */
  distance: number;
  /** Height of the point the camera looks at. */
  lookY: number;
}
type PoseKey = keyof CameraPose;
const POSE_KEYS: PoseKey[] = ["azimuth", "height", "distance", "lookY"];

// Each tab views the robot from its own angle, kept within the head's turn
// range so it can still look at the visitor.
const TAB_POSES: Record<Tab, CameraPose> = {
  about: { azimuth: 0, height: 0.2, distance: 1, lookY: 0 },
  experience: { azimuth: -0.35, height: 0.7, distance: 1, lookY: 0 },
  projects: { azimuth: 0.3, height: -1.1, distance: 1, lookY: 0.1 },
  contact: { azimuth: -0.15, height: 0.5, distance: 0.85, lookY: 0.35 },
};
// Pulled back and above, so the camera dollies in as the page is revealed.
const INTRO_POSE: CameraPose = { azimuth: 0.25, height: 1.6, distance: 1.6, lookY: 0 };
// Roughly matches the content's exit and entrance.
const CAMERA_SMOOTH = 0.45;
const ACCENT_SMOOTH = 0.3;

// Backs the camera off far enough to fit the robot in both directions,
// whether the stage is a tall desktop column or the small mobile card, then
// glides it to the active tab's pose. The small card stays front on, where an
// angle would only crop the robot.
function CameraRig({ activeTab, revealed }: { activeTab: Tab; revealed: boolean }) {
  const { width, height } = useThree((state) => state.size);
  const pose = useRef({ ...INTRO_POSE });
  const compact = width <= COMPACT_MAX_WIDTH;

  const fitDistance = useMemo(() => {
    const aspect = width / height;
    const frameWidth = compact ? COMPACT_FRAME_WIDTH : FRAME_WIDTH;
    const vertical = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    return Math.max(FRAME_HEIGHT / 2 / vertical, frameWidth / 2 / (vertical * aspect));
  }, [width, height, compact]);

  useFrame(({ camera }, delta) => {
    const goal = !revealed ? INTRO_POSE : compact ? TAB_POSES.about : TAB_POSES[activeTab];
    const dt = Math.min(delta, 0.1);
    for (const key of POSE_KEYS) easing.damp(pose.current, key, goal[key], CAMERA_SMOOTH, dt);
    const { azimuth, distance, lookY } = pose.current;
    const d = fitDistance * distance;
    camera.position.set(Math.sin(azimuth) * d, pose.current.height, Math.cos(azimuth) * d);
    camera.lookAt(0, lookY, 0);
  });

  return null;
}

// Rim light from behind, tinted with the active tab's accent.
function RimLight({ color }: { color: string }) {
  const light = useRef<THREE.DirectionalLight>(null);
  // Only the first color goes through props; a changing prop would snap the
  // light instead of easing it.
  const initialColor = useRef(color).current;

  useFrame((_, delta) => {
    if (light.current) easing.dampC(light.current.color, color, ACCENT_SMOOTH, Math.min(delta, 0.1));
  });

  return <directionalLight ref={light} position={[-3, 2, -4]} intensity={2.5} color={initialColor} />;
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
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false, activeAt: performance.now() });

  // Track the cursor anywhere on the page, relative to the stage, so the
  // robot keeps watching while the visitor reads the content beside it.
  useEffect(() => {
    const handleActivity = () => {
      pointer.current.activeAt = performance.now();
    };
    const handleMove = (e: PointerEvent) => {
      handleActivity();
      const rect = container.current?.getBoundingClientRect();
      if (!rect) return;
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.current.active = true;
    };
    const handleLeave = () => {
      pointer.current.active = false;
    };
    const activityEvents = ["pointerdown", "keydown", "wheel", "scroll"] as const;
    window.addEventListener("pointermove", handleMove);
    for (const type of activityEvents) window.addEventListener(type, handleActivity, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      for (const type of activityEvents) window.removeEventListener(type, handleActivity);
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
        <CameraRig activeTab={activeTab} revealed={revealed} />
        <StudioReflections />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <RimLight color={TAB_ACCENTS[activeTab]} />
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
