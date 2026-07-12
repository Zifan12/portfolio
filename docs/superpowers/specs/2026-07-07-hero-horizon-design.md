# Hero "Planet Horizon" Recomposition Design

Date: 2026-07-07
Status: Approved

## Goal

Replace the generic "photo left / bio right" hero with a cinematic full-viewport scene: the planet video rises huge from the bottom edge like a world on the horizon, text floats centered above it, socials become a left-edge vertical rail.

## Composition

- `section.home`: `position: relative; overflow: hidden; height: 100dvh`.
- Planet scene: `position: absolute; left: 50%; bottom: 0`, sized `min(120vw, 1100px)` square, translated down so ~40% of the planet crests the bottom edge. Orbit rings stay (scaled insets), reading as a ring system over the horizon.
- Atmosphere: stronger layered accent glow on the planet rim (box-shadow layers).
- Bottom of section: thin gradient fade into the next section's dark background.
- Content column centered, `padding-top ~18vh`, text-align center: greeting, larger `.hero-name` (up to ~5.5rem), typewriter, description capped at 60ch. Copy unchanged.
- Socials: same four anchors, container repositioned as an absolute vertical rail on the hero's left edge with gradient hairlines above/below; hover glow + 2px slide. Mobile (<768px): rail becomes a static centered horizontal row under the description.

## Motion

- Cursor parallax on the planet stays, strengthened to ±24px; implementation switches from writing `style.transform` (would clobber the new base translate) to CSS vars `--par-x/--par-y` consumed inside the base transform's `calc()`.
- Idle drift: `translateY` ±8px, ~9s loop, applied to `.profile-image` (composes with the scene's positioning transform; coexists with the `--ring-angle` conic animation as a second animation entry).
- Existing ring spin, typewriter, AOS entrances untouched.

## Mechanics / files

- `index.html`: hero markup order unchanged; social-links stays inside `.content` (absolute positioning pulls it to the section edge on desktop); parallax script updated to set `--par-x/--par-y`.
- `css/style.css`: hero-scoped rules only. All media-query rules currently sizing `.main-container .profile-image` are repurposed to size `.planet-scene` (profile-image becomes 100% of scene).

## Out of scope

Other sections, nav, chatbot, copy changes.
