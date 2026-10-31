import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCursor, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { Tab } from "@/app/page";
import { COLORS, TAB_ACCENTS } from "./palette";
import { sceneState, type Reaction } from "./sceneState";

// RobotExpressive by Tomás Laulhé (CC0 1.0), with expressions by Don McCurdy.
// https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive
export const ROBOT_URL = "/models/robot-expressive.glb";
export const ROBOT_HEIGHT = 3;
// Stages up to this wide are the small mobile card.
export const COMPACT_MAX_WIDTH = 240;

type Gesture = "Wave" | "ThumbsUp" | "Dance" | "Jump";
type HeadMotion = "nod" | "shake" | "glance";
// Shape keys on the model's face.
const EXPRESSIONS = ["Angry", "Surprised", "Sad"] as const;
type Expression = (typeof EXPRESSIONS)[number];

/** Something the robot does: a body clip, a head motion and a face, each optional. */
interface Act {
  /** "Idle" stops whatever gesture is playing. */
  gesture?: Gesture | "Idle";
  head?: HeadMotion;
  face?: Expression;
  /** Performed once this act's gesture finishes. */
  then?: Act;
}

// Played once when a tab opens.
const TAB_ACTS: Record<Tab, Act> = {
  about: { gesture: "Wave" },
  experience: { head: "nod" },
  projects: { gesture: "Jump", face: "Surprised" },
  contact: { gesture: "ThumbsUp", head: "nod" },
};

// Played once the visor has powered on, before the opening tab's act.
const INTRO_ACT: Act = { gesture: "Jump", face: "Surprised" };

const REACTIONS: Record<Reaction, Act> = {
  sent: { gesture: "Dance" },
  failed: { head: "shake", face: "Sad" },
  invalid: { head: "shake" },
  projectOpened: { gesture: "Wave" },
  projectSoon: { head: "shake", face: "Sad" },
  chat: { gesture: "Wave" },
};

const PROJECT_HOVER_ACT: Act = { gesture: "ThumbsUp" };

// Clicking the robot. Too many pokes in a row make it cross.
const POKE_ACTS: Act[] = [
  { gesture: "Jump", face: "Surprised" },
  { gesture: "Wave" },
  { gesture: "ThumbsUp", head: "nod" },
  { head: "nod", face: "Surprised" },
];
const ANNOYED_ACT: Act = { gesture: "Idle", head: "shake", face: "Angry" };
const ANNOYED_POKES = 4;
const POKE_WINDOW = 3;
// A light buzz when the robot is tapped, on phones that support it. Milliseconds.
const POKE_BUZZ = 10;

// On touch screens the robot looks up as the page slides up past it, and
// down as it slides back. Speeds in pixels per second.
const SCROLL_LOOK_SPEED = 1500;
const SCROLL_PITCH = 0.3;
const SCROLL_SMOOTH = 0.15;
// A hard flick startles it, at most once per cooldown.
const FLICK_SPEED = 4000;
const FLICK_COOLDOWN = 5;
const FLICK_ACT: Act = { face: "Surprised" };
// The page glides back to the top on a tab change, which isn't the visitor
// scrolling, so scrolling is ignored for a moment after one.
const TAB_SCROLL_MUTE = 1.5;

// Left alone, the robot fidgets now and then, and eventually sits down. It
// jumps back up with a wave when the visitor returns. Times in seconds.
const FIDGET_DELAY = { min: 6, max: 12 };
const FIDGETS: Act[] = [
  { head: "glance" },
  { head: "glance" },
  { gesture: "Wave" },
  { gesture: "Jump" },
  { gesture: "Dance" },
];
const SIT_AFTER = 30;
const SIT_FADE = 0.8;
// The Sitting clip folds the legs without lowering the body, so drop the
// robot to sit it on the floor.
const SIT_DROP = 0.5;
const WAKE_ACT: Act = { gesture: "Wave", face: "Surprised" };

function fidgetDelay() {
  return THREE.MathUtils.randFloat(FIDGET_DELAY.min, FIDGET_DELAY.max);
}

// Picks a random act, avoiding a repeat of the last one.
function pickAct(acts: Act[], last: Act | null) {
  const options = acts.filter((act) => act !== last);
  return options[Math.floor(Math.random() * options.length)];
}

interface HeadPose {
  pitch: number;
  yaw: number;
}

// Procedural head motions, layered on top of the cursor tracking (the model's
// Yes and No clips pause before moving and fight the look-at turn). Each one
// starts and ends at rest with zero speed, so it blends into the tracking
// without a jolt. u runs from 0 to 1 and side is ±1. Negative pitch tips the
// head down.
const HEAD_MOTIONS: Record<HeadMotion, { time: number; pose: (u: number, side: number, out: HeadPose) => void }> = {
  // Nod down and up twice.
  nod: {
    time: 1,
    pose: (u, _side, out) => {
      out.pitch = -0.35 * Math.sin(2 * Math.PI * u) ** 2;
      out.yaw = 0;
    },
  },
  // Shake side to side three times, widest in the middle.
  shake: {
    time: 1.2,
    pose: (u, side, out) => {
      out.pitch = 0;
      out.yaw = side * 0.35 * Math.sin(6 * Math.PI * u) * Math.sin(Math.PI * u);
    },
  },
  // Look off to one side, then the other, glancing up a little.
  glance: {
    time: 3.5,
    pose: (u, side, out) => {
      out.pitch = 0.15 * Math.sin(Math.PI * u) ** 2;
      out.yaw = side * 0.7 * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * u);
    },
  },
};

// When the page is revealed the visor blinks a few times, then fades up.
const POWER_ON_TIME = 0.9;
const VISOR_GLOW = 0.25;
const ACCENT_SMOOTH = 0.3;

// Visor brightness from 0 to 1 as the power-on runs, u from 0 to 1.
function visorPower(u: number) {
  if (u >= 1) return 1;
  if (u < 0.5) return Math.floor(u * 8) % 2;
  return THREE.MathUtils.smoothstep(u, 0.5, 1);
}

// How long a face is held, and how quickly it eases in and out.
const FACE_TIME = 1.6;
const FACE_SMOOTH = 0.12;
// The curious head tilt while the visitor fills in the contact form.
const LISTEN_TILT = 0.2;
const LISTEN_SMOOTH = 0.4;

const CROSSFADE = 0.3;
// The plane between the robot and the camera that the cursor is projected onto.
const LOOK_PLANE_Z = 3;
const MAX_YAW = 1.1;
const MIN_PITCH = -0.5;
const MAX_PITCH = 0.6;
const LOOK_SMOOTH_TIME = 0.2;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
// How the turn toward the cursor is spread from the chest up to the head.
const LOOK_CHAIN: [bone: string, share: number][] = [
  ["Torso", 0.3],
  ["Neck", 0.3],
  ["Head", 0.4],
];

// The face panel: a dark visor with a faint glow in the active tab's accent.
const VISOR = new THREE.MeshStandardMaterial({
  color: "#05080f",
  roughness: 0.15,
  metalness: 0.4,
  emissive: COLORS.cyan,
  emissiveIntensity: 0,
});

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
  Black: VISOR,
};

export interface PointerState {
  /** Pointer position relative to the stage, in normalized device coordinates. */
  x: number;
  y: number;
  active: boolean;
  /** performance.now() of the visitor's last pointer, key or scroll input. */
  activeAt: number;
  /** performance.now() until which the robot looks at the last tap on a touch screen. */
  lookUntil: number;
  /** window.scrollY, tracked on touch screens only. */
  scrollY: number;
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
  // The looping clip under the gestures: Idle, or Sitting after a long idle.
  const base = useRef<THREE.AnimationAction | null>(null);
  const look = useRef({ yaw: 0, pitch: 0 });
  const headMotion = useRef<{ motion: HeadMotion; time: number; side: number } | null>(null);
  const face = useRef<{ name: Expression; left: number } | null>(null);
  const faceWeights = useRef<Record<Expression, number>>({ Angry: 0, Surprised: 0, Sad: 0 });
  const tilt = useRef({ roll: 0 });
  const headAnchor = useRef<THREE.Vector3 | null>(null);
  const lastHovered = useRef(-1);
  const lastReaction = useRef(sceneState.reaction);
  const lastAct = useRef<Act | null>(null);
  // Follows the gesture playing now.
  const queued = useRef<Act | null>(null);
  // Seconds since the page was revealed, and whether the intro has played.
  const poweredFor = useRef(0);
  const introduced = useRef(false);
  const pokes = useRef<number[]>([]);
  const lastIdle = useRef(0);
  const fidgetAt = useRef(fidgetDelay());
  const lastScrollY = useRef<number | null>(null);
  const scrollSpeed = useRef({ value: 0 });
  const scrollMutedUntil = useRef(0);
  const flickReadyAt = useRef(0);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const compact = useThree((state) => state.size.width <= COMPACT_MAX_WIDTH);

  // Restyle, then scale and center the model to a known height.
  const { fit, bones, faceMeshes } = useMemo(() => {
    const faceMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        const material = mesh.material as THREE.Material;
        mesh.material = MATERIALS[material.name] ?? material;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) faceMeshes.push(mesh);
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
      faceMeshes,
    };
  }, [scene]);

  const scratch = useMemo(
    () => ({
      target: new THREE.Vector3(),
      head: new THREE.Vector3(),
      ray: new THREE.Vector3(),
      headPose: { pitch: 0, yaw: 0 } as HeadPose,
      parent: new THREE.Quaternion(),
      delta: new THREE.Quaternion(),
      yaw: new THREE.Quaternion(),
      pitch: new THREE.Quaternion(),
      roll: new THREE.Quaternion(),
    }),
    []
  );

  const playGesture = useCallback(
    (name: Gesture) => {
      const next = actions[name];
      const from = gesture.current ?? base.current;
      if (!next) return;
      next.reset().setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
      next.play();
      // Getting up from sitting takes a moment longer.
      const fade = from === actions.Sitting ? SIT_FADE / 2 : CROSSFADE;
      if (from && from !== next) next.crossFadeFrom(from, fade, false);
      gesture.current = next;
      // Every gesture settles back into Idle, even one that interrupts sitting.
      base.current = actions.Idle ?? null;
    },
    [actions]
  );

  // Eases from a gesture back into Idle.
  const settle = useCallback(
    (from: THREE.AnimationAction) => {
      actions.Idle?.reset().play().crossFadeFrom(from, CROSSFADE, false);
      gesture.current = null;
    },
    [actions]
  );

  const perform = useCallback(
    (act: Act) => {
      if (act.gesture === "Idle") {
        if (gesture.current) settle(gesture.current);
      } else if (act.gesture) {
        playGesture(act.gesture);
      }
      if (act.head) headMotion.current = { motion: act.head, time: 0, side: Math.random() < 0.5 ? -1 : 1 };
      if (act.face) face.current = { name: act.face, left: FACE_TIME };
      // A head motion or face plays over the current gesture, so it leaves
      // whatever follows that gesture in place.
      if (act.gesture || act.then) queued.current = act.then ?? null;
      lastAct.current = act;
    },
    [playGesture, settle]
  );

  const poke = useCallback(() => {
    const now = performance.now() / 1000;
    pokes.current = pokes.current.filter((t) => now - t < POKE_WINDOW);
    pokes.current.push(now);
    perform(pokes.current.length >= ANNOYED_POKES ? ANNOYED_ACT : pickAct(POKE_ACTS, lastAct.current));
  }, [perform]);

  // The mobile card is too small to aim at the robot, so a tap anywhere on it
  // pokes.
  const tap = useCallback(() => {
    navigator.vibrate?.(POKE_BUZZ);
    poke();
  }, [poke]);

  useEffect(() => {
    actions.Idle?.play();
    base.current = actions.Idle ?? null;
    const handleFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== gesture.current) return;
      const next = queued.current;
      queued.current = null;
      // A following gesture blends straight from this one.
      if (!next?.gesture) settle(e.action);
      if (next) perform(next);
    };
    mixer.addEventListener("finished", handleFinished);
    return () => {
      mixer.removeEventListener("finished", handleFinished);
      mixer.stopAllAction();
    };
  }, [actions, mixer, settle, perform]);

  // The opening tab's act waits for the intro, which starts in the frame loop.
  useEffect(() => {
    scrollMutedUntil.current = performance.now() / 1000 + TAB_SCROLL_MUTE;
    if (introduced.current) perform(TAB_ACTS[activeTab]);
  }, [activeTab, perform]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    if (revealed) poweredFor.current += dt;
    VISOR.emissiveIntensity = VISOR_GLOW * visorPower(poweredFor.current / POWER_ON_TIME);
    easing.dampC(VISOR.emissive, TAB_ACCENTS[activeTab], ACCENT_SMOOTH, dt);
    if (!introduced.current && poweredFor.current >= POWER_ON_TIME) {
      introduced.current = true;
      perform({ ...INTRO_ACT, then: TAB_ACTS[activeTab] });
    }

    // Pose the body from the animation, then layer the look-at turn on top of
    // whatever gesture is playing.
    for (const { bone, rest } of bones) if (bone && rest) bone.quaternion.copy(rest);
    mixer.update(dt);

    // None of the clips use the face's shape keys, so the robot's expression is
    // set here alone.
    if (face.current) {
      face.current.left -= dt;
      if (face.current.left <= 0) face.current = null;
    }
    for (const name of EXPRESSIONS) {
      easing.damp(faceWeights.current, name, face.current?.name === name ? 1 : 0, FACE_SMOOTH, dt);
      for (const mesh of faceMeshes) {
        const index = mesh.morphTargetDictionary![name];
        if (index !== undefined) mesh.morphTargetInfluences![index] = faceWeights.current[name];
      }
    }

    // The Idle clip turns the head to look around, which fights the cursor
    // tracking, so drop the clip's head motion.
    const { bone: headBone, rest: headRest } = bones[bones.length - 1];
    if (!headBone || !headRest) return;
    headBone.quaternion.copy(headRest);

    const { headPose } = scratch;
    headPose.pitch = 0;
    headPose.yaw = 0;
    if (headMotion.current) {
      const { motion, side } = headMotion.current;
      const { time, pose } = HEAD_MOTIONS[motion];
      headMotion.current.time += dt;
      if (headMotion.current.time < time) pose(headMotion.current.time / time, side, headPose);
      else headMotion.current = null;
    }
    easing.damp(tilt.current, "roll", sceneState.listening ? LISTEN_TILT : 0, LISTEN_SMOOTH, dt);

    const hoveredProject = activeTab === "projects" ? sceneState.hoveredProject : -1;
    if (hoveredProject >= 0 && hoveredProject !== lastHovered.current && !gesture.current) {
      perform(PROJECT_HOVER_ACT);
    }
    lastHovered.current = hoveredProject;
    if (sceneState.reaction !== lastReaction.current) {
      lastReaction.current = sceneState.reaction;
      if (sceneState.reaction) perform(REACTIONS[sceneState.reaction.name]);
    }

    // Seconds since the visitor last did anything. It drops when they come back.
    const idle = (performance.now() - pointer.current.activeAt) / 1000;
    const sitting = base.current === actions.Sitting;
    if (idle < lastIdle.current) {
      fidgetAt.current = idle + fidgetDelay();
      if (sitting) perform(WAKE_ACT);
    } else if (introduced.current && !gesture.current && !headMotion.current) {
      if (idle > SIT_AFTER && !sitting && actions.Idle && actions.Sitting) {
        actions.Sitting.reset().setLoop(THREE.LoopOnce, 1);
        actions.Sitting.clampWhenFinished = true;
        actions.Sitting.play().crossFadeFrom(actions.Idle, SIT_FADE, false);
        base.current = actions.Sitting;
      } else if (idle > fidgetAt.current && !sitting) {
        perform(pickAct(FIDGETS, lastAct.current));
        fidgetAt.current = idle + fidgetDelay();
      }
    }
    lastIdle.current = idle;

    if (root.current) {
      const restY = base.current === actions.Sitting ? -SIT_DROP : 0;
      easing.damp(root.current.position, "y", revealed ? restY : -0.6, 0.4, dt);
    }

    const { target, head, ray } = scratch;
    const p = pointer.current;
    // Aim from a smoothed head position so the idle bob doesn't jitter the gaze.
    headBone.getWorldPosition(head);
    if (!headAnchor.current) headAnchor.current = head.clone();
    easing.damp3(headAnchor.current, head, 0.6, dt);
    head.copy(headAnchor.current);
    if (p.active || performance.now() < p.lookUntil) {
      const camera = state.camera;
      ray.set(p.x, p.y, 0.5).unproject(camera).sub(camera.position).normalize();
      target.copy(camera.position).addScaledVector(ray, (LOOK_PLANE_Z - camera.position.z) / ray.z);
    } else {
      // No mouse (touch screens, or the cursor left the page): look at the visitor.
      target.copy(state.camera.position);
    }
    target.sub(head);

    // scrollY only moves on touch screens, so elsewhere this stays at rest.
    const now = performance.now() / 1000;
    const scrolled = p.scrollY - (lastScrollY.current ?? p.scrollY);
    lastScrollY.current = p.scrollY;
    const scrollGoal = now < scrollMutedUntil.current || dt === 0 ? 0 : scrolled / dt;
    easing.damp(scrollSpeed.current, "value", scrollGoal, SCROLL_SMOOTH, dt);
    const speed = scrollSpeed.current.value;
    if (Math.abs(speed) > FLICK_SPEED && !face.current && now > flickReadyAt.current) {
      perform(FLICK_ACT);
      flickReadyAt.current = now + FLICK_COOLDOWN;
    }
    const scrollPitch = THREE.MathUtils.clamp(speed / SCROLL_LOOK_SPEED, -1, 1) * SCROLL_PITCH;

    const yawGoal = THREE.MathUtils.clamp(Math.atan2(target.x, target.z), -MAX_YAW, MAX_YAW);
    const pitchGoal = THREE.MathUtils.clamp(
      Math.atan2(target.y, Math.hypot(target.x, target.z)) + scrollPitch,
      MIN_PITCH,
      MAX_PITCH
    );
    easing.damp(look.current, "yaw", yawGoal, LOOK_SMOOTH_TIME, dt);
    easing.damp(look.current, "pitch", pitchGoal, LOOK_SMOOTH_TIME, dt);

    // Rotate each bone in world space (the robot faces +z), then convert back
    // to its parent's space. Head motions and the listening tilt ride on top
    // of the head's share.
    for (const { bone, share } of bones) {
      if (!bone?.parent) continue;
      const isHead = bone === headBone;
      scratch.yaw.setFromAxisAngle(
        THREE.Object3D.DEFAULT_UP,
        look.current.yaw * share + (isHead ? headPose.yaw : 0)
      );
      scratch.pitch.setFromAxisAngle(X_AXIS, -(look.current.pitch * share + (isHead ? headPose.pitch : 0)));
      scratch.roll.setFromAxisAngle(Z_AXIS, isHead ? tilt.current.roll : 0);
      scratch.delta.multiplyQuaternions(scratch.yaw, scratch.pitch).multiply(scratch.roll);
      bone.parent.updateWorldMatrix(true, false);
      bone.parent.getWorldQuaternion(scratch.parent);
      bone.quaternion.premultiply(scratch.parent).premultiply(scratch.delta);
      bone.quaternion.premultiply(scratch.parent.invert());
    }
  });

  return (
    <group ref={root} position-y={-0.6}>
      <primitive
        object={scene}
        scale={fit.scale}
        position={fit.position}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (compact) tap();
          else poke();
        }}
        onPointerMissed={compact ? tap : undefined}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    </group>
  );
}

useGLTF.preload(ROBOT_URL);
