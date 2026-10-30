import { useEffect, useState } from "react";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// null during SSR and hydration so server and client markup match, then true
// for clients with WebGL that haven't asked for reduced motion.
export function use3DEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduceMotion && supportsWebGL());
  }, []);

  return enabled;
}
