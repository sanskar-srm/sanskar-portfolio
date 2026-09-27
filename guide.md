# Portfolio — Implementation Guide for AI Agents

Read this whole file before changing anything. It explains how the site is built, which invariants keep it
working, and the exact recipe for each common change. Every rule marked **MUST** exists because breaking it
caused (or would cause) a real bug.

---

## 1. Stack at a glance

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js **15.5** App Router, React **19**, TypeScript (strict) | Do **not** upgrade to Next 16 casually (middleware/turbopack changes). |
| Styling | Tailwind CSS **v3** + `src/app/globals.css` | Design tokens live in `tailwind.config.ts`. No shadcn/Radix — it was removed. |
| 3D | three + `@react-three/fiber` v9 + `@react-three/drei` v10 + `@react-three/postprocessing` | R3F v9 requires React 19 (`>=19 <19.4`). |
| Scroll/animation | GSAP 3 (`ScrollTrigger`, `SplitText`, `@gsap/react` `useGSAP`) + Lenis + `motion` (Framer Motion) | GSAP owns scroll-linked timelines; `motion` owns hover/UI micro-interactions. |
| State | Zustand (`src/lib/store.ts`) + mutable per-frame objects (`src/lib/live.ts`) | |
| Server | Server Actions, route handler `/resume`, Genkit + Resend for the contact email | |
| Storage | Upstash Redis in production, JSON files in `data/` locally (`src/lib/kv.ts`) | |
| Hosting | Vercel | |

Commands (run from `sanskar-portfolio/`):

```bash
npm run dev            # http://localhost:9002
npx tsc --noEmit       # MUST pass before committing
npm run build          # production build
npm run hash-password -- "new-password"   # admin password hash + session secret
```

**MUST:** if a `next dev` server is running, never run a plain `next build` — it overwrites `.next` and the dev
server starts returning 500. Build into a separate folder instead and delete it afterwards:

```bash
NEXT_DIST_DIR=.next-verify npx next build && rm -rf .next-verify
```

That build rewrites `tsconfig.json` to include `.next-verify/types/**/*.ts` — **revert that change**
(`git checkout -- tsconfig.json`) before committing.

---

## 2. Directory map

```
src/
  app/
    layout.tsx               Root <html>: fonts (next/font), metadata, globals.css. No providers here.
    (site)/layout.tsx        Public site shell: Runtime, Preloader, Stage (3D), Nav, ScrollProgress, Grain, Cursor
    (site)/page.tsx          Section order + server data (experience). revalidate = 3600
    actions.ts               Contact-form server action (Genkit → Resend)
    resume/route.ts          GET /resume — streams the PDF from the Drive link in settings
    admin/                   Hidden admin (own layout, no site chrome, noindex)
      login/                 page.tsx (server) + login-form.tsx (useActionState)
      page.tsx               Auth-gated dashboard (server)
      dashboard.tsx          Experience editor (client)
      resume-panel.tsx       Resume Drive-link editor (client)
      actions.ts             loginAction, logoutAction, saveExperienceAction, saveResumeAction
  content/                   ALL copy & data. Edit content here, not in components.
    profile.ts               name, role, disciplines, tagline, bio, photo, email, socials, chapters (nav)
    skills.ts                skills grid (icon + group)
    projects.ts              projectsData (Web App Dev) + appProjects (App Dev) + realLink()
    milestones.ts            hackathons / bootcamps / courses (Journey timeline)
  components/
    providers/runtime.tsx    Capabilities, Lenis↔GSAP, scroll state, pointer/lens damping, anchor scrolling
    layout/                  stage (3D vs 2D fallback), preloader, nav, scroll-progress, cursor, grain, footer
    sections/                hero, about, skills, projects (+ app-showcase), journey, contact
    three/                   scene (main canvas), blob, particles, effects, poses, shaders, phone-scene
    ui/                      reveal (SplitReveal/FadeIn/Eyebrow), magnetic, tilt-card, xray, count-up, modal
    icons.tsx                Inline SVG skill icons (currentColor)
  lib/
    store.ts                 Zustand app store (tier, loaded, chapter, nav/menu flags)
    live.ts                  Per-frame mutable state: pointer, lens, scroll (NOT React state)
    capabilities.ts          Device tier detection
    gsap.ts                  Plugin registration + queueRefresh()
    kv.ts                    readJSON/writeJSON (Redis or data/*.json)
    experience*.ts           Experience schema (zod) + store
    settings*.ts             Settings schema (resume Drive link, driveFileId) + store (React cache)
    admin/auth.ts            scrypt verify, JWT cookie session, login throttle
    utils.ts                 cn() = twMerge(clsx())
  ai/                        Genkit config + flows (send-email is used; refine-project-descriptions is not)
public/                      profile.jpg, projectCover/*, *Cert/*, appDev/<App>/{Logo,Screenshots}
data/experience.json         Local-dev experience store (committed as []). data/settings.json is gitignored.
scripts/hash-password.mjs
```

---

## 3. Core architecture (read before touching animation or 3D)

### 3.1 Device tiers (`lib/capabilities.ts`, `lib/store.ts`)

`tier` is `'pending' | 'low' | 'mid' | 'high'`:

- **pending** — SSR / first paint. Render content normally; start no animations.
- **low** — no WebGL2, ≤2 cores or ≤2 GB, Save-Data, `?lite` in the URL, or reduced motion → **no WebGL at all**
  (`FallbackBackdrop` in `stage.tsx`; the three.js chunk is never downloaded).
- **mid** — touch devices, width < 900, ≤4 cores/GB → 3D without post-processing, fewer particles, lower DPR.
- **high** — full scene + `Effects` (bloom, chromatic aberration, vignette).

`PerformanceMonitor` in `scene.tsx` can downgrade `high → mid` at runtime.

**MUST (pin bug):** sections must **not** list the raw `tier` in `useGSAP` dependencies. A runtime downgrade would
rebuild every pin, and the rebuilt pins keep stale positions (About stayed pinned under Projects). Use the
"capabilities known" pattern already in every section:

```ts
const tier = useApp(s => (s.tier === 'pending' ? 'pending' : 'ready'));
```

Use `use3D()` only to decide whether to **render** WebGL, never as a GSAP dependency.

`reducedMotion` (OS setting) ⇒ no Lenis, no pins, no custom cursor, no WebGL, text shown without animation.
Every animation MUST early-return when `reducedMotion` is true, and the layout MUST still work without pins
(example: the Web App Dev row becomes a grid).

### 3.2 Two kinds of state

- **Zustand (`useApp`)** — values that change rarely and drive rendering: `tier`, `loaded`, `chapter` (integer),
  `navHidden`, `menuOpen`, `sceneReady`. Setters dedupe to avoid re-renders.
- **`lib/live.ts`** — values that change **every frame**; read them in `useFrame` or `gsap.ticker`, never put them in
  React state:
  - `pointer` — raw `x/y`, damped `lx/ly` (lens and cursor ring), normalized damped `nx/ny` (parallax), `velocity`
  - `lens` — radius `r` plus flags `overXray`, `overBlob`, `overInteractive`; `lensTarget()` decides open/closed
  - `scroll` — `progress` (0..1 of the page), `chapter` (float, e.g. 2.4), `velocity`, `direction`

`runtime.tsx` is the **only** writer of `pointer.*`, `scroll.*` and `lens.r`. `cursor.tsx` writes
`lens.overXray/overInteractive`; `blob.tsx` writes `lens.overBlob`.

### 3.3 Runtime (`components/providers/runtime.tsx`)

1. Detects capabilities → `setCaps`.
2. Creates Lenis (`autoRaf: false`), drives it from `gsap.ticker`, and calls `ScrollTrigger.update()` on every Lenis scroll.
3. Computes `scroll.chapter` from every element with **`data-chapter`** (in DOM order) → `setChapter(floor)`.
4. Locks scrolling until `loaded`, then calls `queueRefresh()`, again after fonts load, and whenever `#main` changes height (ResizeObserver).
5. Damps the pointer and eases `lens.r`.
6. Sends in-page `a[href^="#"]` clicks through Lenis (`scrollToTarget`) and closes the mobile menu.

`getLenis()` / `scrollToTarget()` are exported. Modals and the mobile menu call `getLenis()?.stop()/start()`.

### 3.4 Chapters (`data-chapter`)

The six top-level sections, in order, carry `data-chapter`: `#top`, `#about`, `#skills`, `#projects`, `#journey`,
`#contact`. Indices MUST match `chapters` in `content/profile.ts` (nav + progress rail) **and** the arrays in
`three/poses.ts`. Sub-blocks (`#app-dev`, `#web-dev`) MUST NOT get `data-chapter`.

### 3.5 Pinning & ScrollTrigger rules

Pins exist in: About (`refreshPriority: 3`), each App Dev showcase (`2.9 - index * 0.1`), Web App Dev gallery (`1`).

**MUST** for any new or changed pin:

1. Pin an **inner** element, never the `data-chapter` section itself (the section must keep its full pin-spacer height).
2. Give it a `refreshPriority` that is **higher for pins earlier in the page** (renumber the others if you insert one).
3. After creating it, call `queueRefresh()`; in the cleanup, call `mm.revert()` and then `queueRefresh()`.
4. Create pins inside `gsap.matchMedia()` (desktop `'(min-width: 1024px)'`) and provide a non-pinned path for mobile.
5. Guard with `if (tier === 'pending' || reducedMotion || !loaded) return;`.
6. Keep pinned content ≤ the viewport height on 1280×720 (see the card width `calc((100svh-240px)*1.15)` in projects).

Pattern (copy it):

```ts
useGSAP(() => {
  if (tier === 'pending' || reducedMotion || !loaded) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    gsap.to(target, {
      ..., ease: 'none',
      scrollTrigger: {trigger: pinRef.current, start: 'top top', end: '+=150%', scrub: 0.8,
                      pin: true, anticipatePin: 1, refreshPriority: N, invalidateOnRefresh: true},
    });
  });
  queueRefresh();
  return () => { mm.revert(); queueRefresh(); };
}, {dependencies: [tier, reducedMotion, loaded], scope: root});
```

### 3.6 Preloader

`preloader.tsx` blends real progress: fonts (25%), the portrait (25%), and `sceneReady` (50%, only on 3D tiers).
It never finishes before 1.7 s and always finishes by 7 s. When done it calls `setLoaded()`, which starts every
intro animation and unlocks scrolling. Anything that must wait for the curtain depends on `loaded`.

---

## 4. The 3D layer

### 4.1 Main scene (`three/scene.tsx`)

A fixed full-viewport `<Canvas>` behind the page (`z-0`, `pointer-events-none`, opaque clear colour `#07070a`),
lazy-loaded via `next/dynamic` in `layout/stage.tsx`. Children: `CameraRig` (mouse parallax + roll from scroll
velocity), `Blob`, `Particles`, `Effects` (high tier only), `ReadySignal`. DOM content sits above at `z-10`, so
**section backgrounds MUST stay transparent**, or the 3D disappears.

### 4.2 Blob and poses (`three/blob.tsx`, `three/poses.ts`, `three/shaders.ts`)

- The blob is an icosahedron displaced in the vertex shader by 3D simplex noise; normals are recomputed from
  neighbouring samples. The fragment shader combines fresnel iridescence (cosine palette), two fake lights, specular,
  and a lens cut-out.
- **Poses:** one entry per chapter in `desktopPoses`
  (`pos, scale, distort, freq, speed, spin, colorA/B/C, intensity`). `mobilePoses` derives from it using the
  `mobileX` / `mobileY` arrays. The blob holds a pose, then blends to the next over the last 45% of a chapter
  (`smoothstep(0.55, 1, frac)`).
- **To move or recolour the blob in a chapter, edit only `poses.ts`.** Use `intensity` (< 1) to calm it behind dense
  copy. Keep the blob away from body text; peeking from an edge or sitting behind an image works best.
- **X-ray lens:** the blob fragment shader `discard`s inside the screen-space circle `uLens/uLensR`, while the
  wireframe and core meshes (`xrayFragment`) render **only** inside it. Lens coordinates are device pixels:
  `(pointer.lx * dpr, (height - pointer.ly) * dpr)`.

### 4.3 Phone showcase (`three/phone-scene.tsx`, `sections/app-showcase.tsx`)

- Procedural phone (`RoundedBox` body, inset glass, dynamic island, buttons, camera module) lit by `Lightformer`s
  inside `<Environment>` — **no HDR downloads**. `ContactShadows` + `Float`.
- The screen is a plane with a custom shader: a rounded-rect SDF mask, and a dissolve from `uA` to `uB` driven by
  `uMix` with a lime sweep edge.
- `progress.current` (0..1 across all screens) is written by the showcase: a scroll-scrubbed pin on desktop, an
  auto-advancing timeline on mobile, or clicks on captions and dots (`goTo`). The phone's rotation follows it.
- The canvas mounts only when the stage is within 600 px of the viewport (IntersectionObserver). Low tier or reduced
  motion render `CssPhone` instead.

### 4.4 Shader gotchas (all have bitten this project)

- **MUST** update uniforms on the **live material** (`materialRef.current.uniforms.x.value = …`) or keep the
  uniforms object 100% stable (`useMemo(..., [])`) and never re-create it. three.js binds the uniforms object at
  compile time; a re-created object is silently ignored.
- **MUST** pass stable props into canvases (for example `useMemo` for arrays like `screens`), or children re-render
  and re-create things.
- **MUST NOT** call `smoothstep(e0, e1, x)` with `e0 >= e1` — it's undefined in GLSL. Use
  `1.0 - smoothstep(lo, hi, x)`.
- **MUST NOT** use GLSL reserved words as identifiers (`active`, `input`, `output`, `filter`, `sample`, …).
- End custom fragment shaders with `#include <colorspace_fragment>` (plus `<tonemapping_fragment>` if lit),
  and set textures to `colorSpace = THREE.SRGBColorSpace`.
- Keep the main scene free of network assets (no drei `Environment preset`, no remote GLTF).

---

## 5. UI primitives (reuse them — don't hand-roll new versions)

| Component | Use | Notes |
| --- | --- | --- |
| `SplitReveal` (`ui/reveal.tsx`) | Headings. `mode="chars"` for display type, `"lines"`, `"words"` (blur-in). | Props `as`, `id`, `delay`, `start`. Words get the class `split-word` (nowrap) so they never break mid-word. |
| `FadeIn` | Blocks/cards: blur + slide up on enter | Renders a plain `div` when reduced motion is on. |
| `Eyebrow` | `index="03"` + label | Chapter labels. |
| `Magnetic` | Wrap buttons and links | Disabled on touch and reduced motion. |
| `TiltCard` | 3D tilt + glare | Disabled on touch and reduced motion. |
| `XRay` | `reveal={<Layer/>}` is revealed through the cursor lens (tap on touch) | Reveal layers are `aria-hidden`; keep them visually aligned with the children. |
| `CountUp` | Animated numbers | |
| `Modal` | Native `<dialog>` | Stops/starts Lenis; `data-lenis-prevent` lets it scroll internally. |

Cursor hooks:
- `data-cursor="View"` on an element shows a label in the ring.
- Links and buttons automatically grow the ring and close the lens.
- `data-xray` (set by `XRay`) opens the lens.

---

## 6. Design system

- **Colours** (`tailwind.config.ts`): `ink-950…600` (backgrounds), `bone` (text), `mist` (muted), `acid` `#c8ff3d`
  (accent), `violet` `#9d5cff`. Stay on these tokens — no new ad-hoc hex colours in components.
- **Fonts** (`app/layout.tsx`): `font-display` Syne (uppercase headings), `font-serif` Instrument Serif italic (accent
  word inside headings), `font-body` Inter, `font-mono` JetBrains Mono (eyebrows, labels).
- **Type scale:** `text-mega` (hero/contact), `text-giga` (chapter titles), `text-huge` (sub-titles).
  **MUST:** Syne 800 is very wide — keep display words ≤ ~10 characters or check the width at 390 px.
- **Heading idiom:** `WORD <span className="font-serif font-normal normal-case italic text-acid">Word</span>`.
- **Utilities** (`globals.css`): `.eyebrow`, `.glass`, `.text-outline`, `.text-outline-acid`, `.grid-bp`, `.scanlines`, `.input-field`.
- **Layout:** sections use `mx-auto max-w-[1600px] px-5 md:px-10`. `html, body { overflow-x: clip }` prevents
  horizontal scroll (don't change it to `hidden`, which breaks sticky elements).

---

## 7. Recipes

### Edit copy, links or email
`src/content/profile.ts`. The contact form's destination address is separate: `src/ai/flows/send-email.ts` (`to:`).

### Add or remove a skill
1. Add an SVG icon to `components/icons.tsx` (`fill="currentColor"` or `stroke="currentColor"`, include `<title>`).
2. Add `{name, icon, group}` to `content/skills.ts`.

The grid (`xl:grid-cols-7`) and the About stat update automatically. Techs used in projects but not listed as skills
appear under "Also worked with".

### Add a Web App Dev project
1. Put the cover in `public/projectCover/` (landscape; it's shown at `aspect-[2.1/1]` on desktop).
2. Append to `projectsData` in `content/projects.ts`. Use `'#'` for missing links (`realLink()` hides them), and
   `hidden: true` for placeholders.

Nothing else changes: the horizontal pin length is computed from `scrollWidth`.

### Add an App Dev project
1. Add assets: `public/appDev/<Name>/Logo/icon.png` and `public/appDev/<Name>/Screenshots/*.jpeg`. Use portrait
   screenshots, ideally 720×1600 (aspect ≈ 0.45 to match the screen plane).
2. Append to `appProjects`: `title, role, tagline, description, icon, githubUrl, platforms (['Android','iOS']),
   tech, screens: [{src, title, caption}]`. Take the tech stack from the app's real `package.json`; don't guess.
3. That's all. Each app renders its own pinned `AppShowcase`, whose `refreshPriority` is computed as
   `2.9 - index * 0.1` (always between About = 3 and the web gallery = 1, descending down the page). This supports up
   to 9 apps. The A/B category pills read `appProjects.length` automatically.

### Add a hackathon, bootcamp or course
`content/milestones.ts`. `imageUrl` adds a "View certificate" modal. `hidden: true` hides an entry.

### Add a new top-level section
1. Create `components/sections/<name>.tsx` with `<section id="<id>" data-chapter aria-labelledby=…>` and a transparent background.
2. Insert it in `(site)/page.tsx` at the right position.
3. Insert `{id, label}` at the **same index** in `chapters` (`content/profile.ts`).
4. Insert a pose at the **same index** in `desktopPoses`, plus a value at that index in `mobileX` and `mobileY` (`three/poses.ts`).
5. Follow the §3.5 rules for any pin, and the §3.1 dependency pattern.
6. Verify desktop and 390 px, and reduced motion.

### Change the blob's look or position per chapter
`three/poses.ts` only. For a global look change, edit `blobFragment` in `three/shaders.ts` (respect §4.4).

### Change the resume
Nothing in code. The owner pastes a Google Drive share link in `/admin` → Resume. `/resume` streams the PDF
(`?download=1` for a download). It falls back to Drive's viewer if the file isn't public, and shows a "being
updated" page if no link is set. The resume buttons are always rendered (hero, nav, mobile menu).

### Add another admin-managed setting
1. Extend `SettingsSchema` in `lib/settings.ts`, with a `.default()` so old stored data still parses.
2. Add a server action in `admin/actions.ts`. It **MUST** start with the `isAuthenticated()` check, validate with
   zod, save, then `revalidatePath('/', 'layout')` (plus `revalidateTag` if a fetch uses a tag).
3. Add a client panel next to `resume-panel.tsx` and render it in `admin/page.tsx`.
4. Read it server-side with `getSettings()` (React-`cache`d) and pass it down as props. **Never** import `*-store.ts`
   or `kv.ts` from client components (they are `server-only`).

For a new kind of collection, follow `experience.ts` (schema) + `experience-store.ts` (`readJSON/writeJSON` with a
Redis key `portfolio:<name>` and file `data/<name>.json`).

---

## 8. Admin & security rules

- The admin URL is `/admin`. It isn't linked anywhere, is `noindex`, and has its own layout (no site chrome).
- Credentials exist **only** in env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (`salt:hash`, scrypt),
  `ADMIN_SESSION_SECRET` (≥ 32 chars). **Never** put a password or hash in source code, the README or commits.
  `.env*` is gitignored; `.env.example` documents the variables.
- Session: an HS256 JWT in the httpOnly, `SameSite=Strict`, `path=/admin` cookie `sb_admin` (7 days).
- Every mutating server action MUST check `isAuthenticated()` first.
- The login form keeps the email on failure via `LoginState.email`. React 19 resets uncontrolled form fields after
  an action — keep that pattern.
- Escape user input before putting it into HTML (see `escapeHtml` in `send-email.ts`).
- Production storage requires Upstash Redis (the Vercel integration sets `KV_REST_API_URL/TOKEN`). Without it,
  saves on Vercel throw a clear error message.

Env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN` (or `KV_*`),
`RESEND_API_KEY`, `GEMINI_API_KEY` (only for the unused AI flow).

---

## 9. Accessibility & performance invariants

- Real text stays in the DOM (SplitText adds `aria-label`). Decorative duplicates are `aria-hidden`. The hero `h1`
  contains an `sr-only` full name.
- Every image has meaningful `alt` text, or `alt=""` if it's decorative.
- Keep the skip link, `aria-current` in the nav, labelled buttons, and visible `:focus-visible` outlines.
- Use native `<dialog>` for modals.
- three.js MUST stay behind `next/dynamic` (`ssr: false`). The first-load JS of `/` is ~245 kB; don't import three,
  drei or postprocessing from non-3D modules.
- Images go through `next/image` with `sizes`.
- No new fonts via `<link>` — use `next/font`.

---

## 10. Verification checklist (do all before committing)

1. `npx tsc --noEmit` passes.
2. The isolated production build passes (§1), and `tsconfig.json` has been reverted if the build touched it.
3. Visually check desktop 1440×900 **and** 1280×720, and mobile 390×844, at every changed chapter (including
   mid-pin). Headless Edge works well — the in-app browser pane only paints when it is visible.
4. Check the `?lite=1` fallback and reduced motion (no pins, content reachable, no WebGL).
5. No overlapping pins: exactly one pinned section should be `position: fixed` at any scroll position.
6. No console errors (shader compile errors appear as console errors with the GLSL source).
7. Commit on a feature branch. Commit messages end with the co-author trailer used in the history.

---

## 11. Known quirks

- `components.json` is a leftover from shadcn and is unused.
- `src/ai/flows/refine-project-descriptions.ts` / `refineDescriptionAction` are unused (kept from the original site).
- The Next dev indicator ("N" badge, bottom-left) appears only in development.
- The `/resume` fetch is cached for 10 minutes and uses the tag `resume`; saving in admin invalidates it.
