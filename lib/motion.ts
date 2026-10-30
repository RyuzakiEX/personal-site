import type { Variants } from "framer-motion";

// A card dropping into place from a hinge along its top edge, like a
// split-flap display. Pass the delay in seconds as `custom` to stagger a list.
export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: -80, originY: 0, transformPerspective: 800 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    rotateX: 0,
    originY: 0,
    transformPerspective: 800,
    transition: {
      delay,
      opacity: { delay, duration: 0.25 },
      rotateX: { delay, type: "spring", stiffness: 140, damping: 14 },
    },
  }),
};
