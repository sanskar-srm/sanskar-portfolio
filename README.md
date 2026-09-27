# Sanskar Bhadani — Portfolio

A scroll-driven, 3D portfolio built with Next.js (App Router), React Three Fiber, GSAP + ScrollTrigger, Lenis and Framer Motion. Hosted on Vercel.

```bash
npm install
npm run dev        # http://localhost:9002
npm run build
```

## Where things live

| What | Where |
| --- | --- |
| Bio, links, email, resume | `src/content/profile.ts` |
| Projects | `src/content/projects.ts` (`hidden: true` keeps an entry out of the UI) |
| Skills | `src/content/skills.ts` |
| Hackathons / bootcamps / courses | `src/content/milestones.ts` |
| Work experience | `/admin` panel (stored in Upstash Redis, or `data/experience.json` locally) |
| 3D scene (blob shader, particles, post) | `src/components/three/` — per-chapter poses in `poses.ts` |
| Chapters | `src/components/sections/` |

## Experience & graceful degradation

- **high** (desktop): full scene + bloom / chromatic aberration / vignette.
- **mid** (phones, tablets, modest laptops): lighter geometry and particles, no post-processing, lower DPR.
- **low** (no WebGL2, ≤2 cores/2 GB, Save-Data, or `?lite`): animated 2D backdrop, no WebGL.
- **prefers-reduced-motion**: native scrolling, no pinning, no custom cursor, content shown without animation.

The three.js bundle is code-split and never downloaded on the low tier.

## Admin panel

`/admin` is unlinked and `noindex`. Credentials are **only** in environment variables — see `.env.example`.

```bash
npm run hash-password -- "new-password"   # prints ADMIN_PASSWORD_HASH and a fresh ADMIN_SESSION_SECRET
```

For production, add in Vercel → Project → Settings → Environment Variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `RESEND_API_KEY`, and connect **Storage → Upstash Redis** (injects the Redis URL/token).
