# Jorge Adanza — Personal Portfolio

My portfolio site, live at **[jorgeadanza.vercel.app](https://jorgeadanza.vercel.app/)**.

It is a Next.js app with four sections (About Me, Experience, Projects and Contact), each at its own URL, next to an interactive 3D robot that watches the cursor and reacts to what you do on the page.

## Features

- **Interactive 3D robot.** Built with React Three Fiber. It follows the cursor across the whole page and plays a gesture when each tab opens. Clicking it makes it react, and if you click it too many times in a row it gets annoyed. When left alone it fidgets, and after a while it sits down. It also reacts to page events: it dances when a contact message is sent, shakes its head when the form has errors, and gives a thumbs-up when you hover over a project.
- **3D transitions.** Each tab gets its own camera angle and accent color for the rim light, visor and background glow. On first load the camera dollies in and the visor powers on. Sections turn like the faces of a cube, and project cards tilt toward the cursor.
- **Intro overlay.** The page stays hidden until the 3D scene has rendered, so the content and the robot appear together. If the scene takes longer than 4 seconds, the page is shown anyway.
- **Graceful fallback.** Browsers without WebGL and visitors who prefer reduced motion get a static orb instead of the robot, and section changes become plain fades.
- **Responsive layout.** On large screens the robot sits in a sticky column beside the content. On small screens it shrinks to a frosted card in the bottom-left corner that lets taps pass through.
- **Contact form.** Validated with React Hook Form and Zod on the client and again in the API route, then sent as a styled email through [Resend](https://resend.com).
- **Linkable sections.** Each section has its own path (`/`, `/experience`, `/projects`, `/contact`) with its own title and description. Switching tabs updates the URL without reloading the page, so the robot and transitions carry on, and the back button, refreshes and shared links all land on the right section.
- **SEO and link previews.** Every page has Open Graph and Twitter tags pointing at a generated preview card, plus a canonical URL. The site also serves `sitemap.xml`, `robots.txt` and JSON-LD `Person` data.
- **Years of experience.** The total on About Me is calculated from the earliest start date in `data/experience.ts`, so it stays current without manual edits.

## Tech stack

| Area       | Tools                                                     |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 14 (App Router), React 18, TypeScript             |
| 3D         | Three.js, React Three Fiber, Drei, maath                  |
| Styling    | Tailwind CSS, Framer Motion, lucide-react                 |
| Forms      | React Hook Form, Zod                                      |
| Email      | Resend                                                    |
| Hosting    | Vercel                                                    |

## Getting started

Requires Node.js 18.17 or later.

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The contact form needs these in `.env`, which git ignores. `.env.example` lists them with empty values.

| Variable            | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `RESEND_API_KEY`    | Resend API key                                                |
| `RESEND_EMAIL_FROM` | Sender address. Its domain must be verified in Resend          |
| `RESEND_EMAIL_TO`   | Inbox that receives contact messages                          |

The rest of the site works without them; only sending the contact form will fail.

### Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Build for production         |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

## Project structure

```
app/
  [[...tab]]/page.tsx   One static page per tab, with its metadata
  layout.tsx            Fonts (Rajdhani, Exo 2), site metadata, JSON-LD, robot model preload
  opengraph-image.tsx   Link preview card shown when the site is shared
  sitemap.ts, robots.ts
  api/contact/route.ts  Validates the form and sends the email via Resend
components/
  Home.tsx              Tab from the URL, intro reveal and cube section transitions
  Navbar.tsx
  RobotStage.tsx        Sticky column / mobile card hosting the 3D canvas
  sections/             AboutMe, Experience, Projects, Contact
  three/
    RobotCanvas.tsx     Scene, lighting, camera rig and per-tab poses
    Robot.tsx           Model, cursor tracking, gestures, faces and idle behavior
    sceneState.ts       Shared state the DOM writes and the scene reads each frame
    palette.ts          Theme colors and per-tab accents
  ui/                   Badge, Card, IntroOverlay, SocialIcon
data/                   Experience, projects and certificates content
hooks/
  use3DEnabled.ts       Checks for WebGL and reduced motion
  useTilt.ts            Cursor-driven card tilt
lib/
  tabs.ts               Tab order, paths, titles and descriptions, site URL
                        Plus motion presets, class helpers, Zod schemas
public/
  models/robot-expressive.glb
  Jorge-Gabriel-Adrian-Adanza-CV-v3.pdf
  profile-picture.jpeg
```

### Editing content

Most content lives in plain TypeScript files in `data/`:

- `data/experience.ts`: work history, bullet points and stack per role
- `data/projects.ts`: project cards. Set `comingSoon: true` for projects without a live link.
- `data/certificates.ts`: certificates. This file isn't shown on the site at the moment.

The About Me and Contact copy, along with social links, are in their components under `components/sections/`.

### How the robot reacts to the page

DOM components talk to the 3D scene through `components/three/sceneState.ts`, a mutable object the scene reads in `useFrame`. This means updates don't trigger React re-renders, and the file has no `three` import so it doesn't pull Three.js into the main bundle. To add a new reaction:

1. Add a name to the `Reaction` type in `sceneState.ts`.
2. Map it to an act in `REACTIONS` in `Robot.tsx`.
3. Call `react("yourReaction")` from the component.

## Deployment

The site is deployed on Vercel. Set the three `RESEND_*` variables in the project's environment settings.

## Credits

- 3D model: [RobotExpressive](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive) by Tomás Laulhé (CC0 1.0), with expressions by Don McCurdy, restyled to the site's palette.
