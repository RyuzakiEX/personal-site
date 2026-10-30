// Mutable state shared between the DOM and the WebGL scene. Read inside useFrame,
// so writes never trigger React renders. Keep this file free of three imports so
// DOM components can use it without pulling three into the main bundle.
export const sceneState = {
  hoveredProject: -1,
  pulseAt: -Infinity,
};

export function setHoveredProject(index: number) {
  sceneState.hoveredProject = index;
}

// Signals that a message was sent; the robot celebrates.
export function triggerPulse() {
  sceneState.pulseAt = performance.now();
}
