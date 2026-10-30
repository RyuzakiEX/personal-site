// Mutable state shared between the DOM and the WebGL scene. Read inside useFrame,
// so writes never trigger React renders. Keep this file free of three imports so
// DOM components can use it without pulling three into the main bundle.

/** Things that happen on the page that the robot reacts to. */
export type Reaction =
  | "sent" // the contact form went through
  | "failed" // the contact form couldn't be sent
  | "invalid" // the contact form was submitted with errors
  | "projectOpened" // a project link was clicked
  | "projectSoon" // a "coming soon" project was clicked
  | "chat"; // the WhatsApp link was clicked

export const sceneState = {
  hoveredProject: -1,
  /** True while the visitor is filling in the contact form. */
  listening: false,
  /** The latest reaction. A new object each time, so repeats are noticed. */
  reaction: null as { name: Reaction } | null,
};

export function setHoveredProject(index: number) {
  sceneState.hoveredProject = index;
}

export function setListening(listening: boolean) {
  sceneState.listening = listening;
}

export function react(name: Reaction) {
  sceneState.reaction = { name };
}
