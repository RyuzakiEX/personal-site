import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { Tab } from "@/app/page";
import { COLORS } from "./palette";
import { sceneState } from "./sceneState";

// RobotExpressive by Tomás Laulhé (CC0 1.0), with expressions by Don McCurdy.
// https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive
export const ROBOT_URL = "/models/robot-expressive.glb";
export const ROBOT_HEIGHT = 3;

type Gesture = "Wave" | "Yes" | "ThumbsUp" | "Dance";

// Played once when a tab opens. Projects reacts to hover and Contact to a sent
// message instead.
const TAB_GESTURES: Partial<Record<Tab, Gesture>> = {
  about: "Wave",
  experience: "Yes",
};

const CROSSFADE = 0.3;
// The plane between the robot and the camera that the cursor is projected onto.
const LOOK_PLANE_Z = 3;
const MAX_YAW = 1.1;
const MIN_PITCH = -0.5;
const MAX_PITCH = 0.6;
const LOOK_SMOOTH_TIME = 0.2;
const X_AXIS = new THREE.Vector3(1, 0, 0);
// How the turn toward the cursor is spread from the chest up to the head.
const LOOK_CHAIN: [bone: string, share: number][] = [
  ["Torso", 0.3],
  ["Neck", 0.3],
  ["Head", 0.4],
];

// Restyled from the model's yellow toy look to the site's palette.
const MATERIALS: Record<string, THREE.Material> = {
  Main: new THREE.MeshPhysicalMaterial({
    color: "#e6edf7",
    roughness: 0.32,
    metalness: 0.1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  }),
  Grey: new THREE.MeshStandardMaterial({ color: "#26314d", roughness: 0.35, metalness: 0.75 }),
  // The face panel: a dark visor with a faint glow.
  Black: new THREE.MeshStandardMaterial({
    color: "#05080f",
    roughness: 0.15,
    metalness: 0.4,
    emissive: COLORS.cyan,
    emissiveIntensity: 0.25,
  }),
};

export interface PointerState {
  /** Pointer position relative to the stage, in normalized device coordinates. */
  x: number;
  y: number;
  active: boolean;
}

interface RobotProps {
  activeTab: Tab;
  revealed: boolean;
  pointer: React.MutableRefObject<PointerState>;
}

export default function Robot({ activeTab, revealed, pointer }: RobotProps) {
  const { scene, animations } = useGLTF(ROBOT_URL);
  const { mixer, actions } = useMemo(() => {
    const mixer = new THREE.AnimationMixer(scene);
    const actions: Partial<Record<string, THREE.AnimationAction>> = {};
    for (const clip of animations) actions[clip.name] = mixer.clipAction(clip);
    return { mixer, actions };
  }, [scene, animations]);
  const root = useRef<THREE.Group>(null);
  const gesture = useRef<THREE.AnimationAction | null>(null);
  const look = useRef({ yaw: 0, pitch: 0 });
  // How much of the animation's own head motion to keep (see useFrame).
  const headAnimation = useRef(0);
  const headAnchor = useRef<THREE.Vector3 | null>(null);
  const lastHovered = useRef(-1);
  const lastPulse = useRef(sceneState.pulseAt);

  // Restyle, then scale and center the model to a known height.
  const { fit, bones } = useMemo(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        const material = mesh.material as THREE.Material;
        mesh.material = MATERIALS[material.name] ?? material;
      }
    });
    // Bones share names with meshes ("Head", "Torso"), so match bones only.
    const bones = LOOK_CHAIN.map(([name, share]) => {
      let bone: THREE.Bone | undefined;
      scene.traverse((object) => {
        if (!bone && (object as THREE.Bone).isBone && object.name === name) bone = object as THREE.Bone;
      });
      // Not every clip animates these bones, so the look-at turn starts from
      // the rest pose each frame instead of piling onto the last frame's turn.
      return { bone, share, rest: bone?.quaternion.clone() };
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = ROBOT_HEIGHT / size.y;
    return {
      fit: { scale, position: center.multiplyScalar(-scale) },
      bones,
    };
  }, [scene]);

  const scratch = useMemo(
    () => ({
      target: new THREE.Vector3(),
      head: new THREE.Vector3(),
      animated: new THREE.Quaternion(),
      ray: new THREE.Vector3(),
      parent: new THREE.Quaternion(),
      delta: new THREE.Quaternion(),
      yaw: new THREE.Quaternion(),
      pitch: new THREE.Quaternion(),
    }),
    []
  );

  const playGesture = useCallback(
    (name: Gesture) => {
      const next = actions[name];
      const from = gesture.current ?? actions.Idle;
      if (!next) return;
      next.reset().setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
      next.play();
      if (from && from !== next) next.crossFadeFrom(from, CROSSFADE, false);
      gesture.current = next;
    },
    [actions]
  );

  useEffect(() => {
    actions.Idle?.play();
    const handleFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== gesture.current || !actions.Idle) return;
      actions.Idle.reset().play().crossFadeFrom(e.action, CROSSFADE, false);
      gesture.current = null;
    };
    mixer.addEventListener("finished", handleFinished);
    return () => {
      mixer.removeEventListener("finished", handleFinished);
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useEffect(() => {
    const name = TAB_GESTURES[activeTab];
    if (revealed && name) playGesture(name);
  }, [activeTab, revealed, playGesture]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Pose the body from the animation, then layer the look-at turn on top of
    // whatever gesture is playing.
    for (const { bone, rest } of bones) if (bone && rest) bone.quaternion.copy(rest);
    mixer.update(dt);

    // The Idle clip turns the head to look around, which fights the cursor
    // tracking. Drop the clip's head motion except while nodding, where the
    // head movement is the gesture.
    const { bone: headBone, rest: headRest } = bones[bones.length - 1];
    if (!headBone || !headRest) return;
    const nodding = !!gesture.current && gesture.current === actions.Yes;
    easing.damp(headAnimation, "current", nodding ? 1 : 0, 0.2, dt);
    scratch.animated.copy(headBone.quaternion);
    headBone.quaternion.copy(headRest).slerp(scratch.animated, headAnimation.current);

    const hovered = activeTab === "projects" ? sceneState.hoveredProject : -1;
    if (hovered >= 0 && hovered !== lastHovered.current && !gesture.current) playGesture("ThumbsUp");
    lastHovered.current = hovered;
    if (sceneState.pulseAt !== lastPulse.current) {
      lastPulse.current = sceneState.pulseAt;
      playGesture("Dance");
    }

    if (root.current) {
      easing.damp(root.current.position, "y", revealed ? 0 : -0.6, 0.4, dt);
    }

    const { target, head, ray } = scratch;
    const p = pointer.current;
    // Aim from a smoothed head position so the idle bob doesn't jitter the gaze.
    headBone.getWorldPosition(head);
    if (!headAnchor.current) headAnchor.current = head.clone();
    easing.damp3(headAnchor.current, head, 0.6, dt);
    head.copy(headAnchor.current);
    if (p.active) {
      const camera = state.camera;
      ray.set(p.x, p.y, 0.5).unproject(camera).sub(camera.position).normalize();
      target.copy(camera.position).addScaledVector(ray, (LOOK_PLANE_Z - camera.position.z) / ray.z);
    } else {
      // No mouse (touch screens, or the cursor left the page): look at the visitor.
      target.copy(state.camera.position);
    }
    target.sub(head);
    const yawGoal = THREE.MathUtils.clamp(Math.atan2(target.x, target.z), -MAX_YAW, MAX_YAW);
    const pitchGoal = THREE.MathUtils.clamp(
      Math.atan2(target.y, Math.hypot(target.x, target.z)),
      MIN_PITCH,
      MAX_PITCH
    );
    easing.damp(look.current, "yaw", yawGoal, LOOK_SMOOTH_TIME, dt);
    easing.damp(look.current, "pitch", pitchGoal, LOOK_SMOOTH_TIME, dt);

    // Rotate each bone in world space (the robot faces +z), then convert back
    // to its parent's space.
    for (const { bone, share } of bones) {
      if (!bone?.parent) continue;
      scratch.yaw.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, look.current.yaw * share);
      scratch.pitch.setFromAxisAngle(X_AXIS, -look.current.pitch * share);
      scratch.delta.multiplyQuaternions(scratch.yaw, scratch.pitch);
      bone.parent.updateWorldMatrix(true, false);
      bone.parent.getWorldQuaternion(scratch.parent);
      bone.quaternion.premultiply(scratch.parent).premultiply(scratch.delta);
      bone.quaternion.premultiply(scratch.parent.invert());
    }
  });

  return (
    <group ref={root} position-y={-0.6}>
      <primitive object={scene} scale={fit.scale} position={fit.position} />
    </group>
  );
}

useGLTF.preload(ROBOT_URL);
