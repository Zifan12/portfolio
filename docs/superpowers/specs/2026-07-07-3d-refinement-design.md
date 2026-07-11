# 3D Animation + Section Refinement Design

Date: 2026-07-07
Status: Approved (option A timeline)

## Goal

Add CSS-3D depth and motion across the portfolio and recompose the three weakest sections (Introduction, Academic Background, Skills). No new dependencies: pure CSS 3D transforms + small vanilla JS handlers. Content and copy unchanged.

## Constraints

- Static site (HTML/CSS/JS). No Three.js, no build step.
- Brand preserved: dark space/neon, existing accent variables (`--accent`, `--accent-deep`, `--accent-bright`).
- Animations run unconditionally (owner removed reduced-motion guard on 2026-07-07).
- Only `transform`/`opacity` animate (GPU-safe).
- Existing IA, anchors, nav labels untouched.

## Components

### 1. Shared tilt system (site-wide)

One JS handler + one CSS class (`.tilt`).

- Elements: skill cards, education cards, cert cards, intro photo panel.
- Pointer move over element: `rotateX`/`rotateY` toward cursor, max ~8deg, via CSS vars `--tx`/`--ty` set from JS.
- Glare: `::after` radial highlight following cursor (reuses `--mx`/`--my` pattern from skill spotlight).
- Pointer leave: transform resets, `transition: transform 0.4s ease` handles spring-back.
- Parent containers get `perspective: 900px`.
- Touch devices: handler skipped (`pointer: fine` check), cards stay flat.

### 2. Hero orbit plane

- `.planet-scene` gets `perspective: 1000px`.
- Orbit rings: `transform: rotateX(68deg)` so rings form an elliptical plane around the planet.
- Spin keyframes updated to preserve the X tilt while rotating Z (`rotateX(68deg) rotateZ(360deg)`).
- Moon keeps riding the outer ring.

### 3. Introduction photo panel

- Photo wrapped in `.tilt` panel with idle float animation (`translateY` ±10px, ~6s ease-in-out loop).
- Layered accent glow behind panel (`::before`, blurred radial, offset) for depth.
- Text column unchanged.

### 4. Academic Background: perspective timeline (rebuild)

Replaces the absolute-positioned horizontal timeline (magic-number margins) entirely.

- Structure: vertical center line (2px gradient), two entries alternating left/right on desktop via flexbox; each entry = school icon node on the line + a `.tilt` card.
- Cards idle at `rotateY(±6deg)` angled toward the center line; hover straightens to 0 and lifts.
- Node icons: existing school images in glowing circles positioned on the line.
- Dates render inside the cards (kills the absolutely-positioned date spans).
- Mobile (<768px): single column, line on the left, cards full-width, no idle angle.
- Existing mobile timeline CSS for the old structure is deleted with the old markup.

### 5. Skills: grouped clusters + tilt

- 15 cards regrouped into 3 labeled clusters, same card markup inside:
  - **AI / Machine Learning:** PyTorch, Scikit-learn, LangChain/LangGraph, OpenAI API, ChromaDB, NumPy, Matplotlib
  - **Languages:** Python, C, Java, JavaScript
  - **Backend & Tools:** FastAPI, Django, SQLite, GitHub
- Cluster label: small heading above each group (plain, no eyebrow styling).
- Each cluster is its own responsive grid; AOS stagger per cluster.
- Cards get `.tilt` (tilt + glare) on top of existing cursor spotlight.

## Files touched

- `index.html` — timeline markup rebuild, skills regrouping, `.tilt` classes, tilt JS snippet
- `css/style.css` — tilt system, orbit plane, intro panel, new timeline styles (old timeline styles removed), cluster styles

## Error handling / fallbacks

- No JS: cards render flat and static; layout intact.
- Touch: tilt skipped; hover states degrade to tap-highlight defaults.
- Old timeline CSS fully removed to avoid dead rules fighting new layout.

## Testing

- Preview verification at desktop, ~830px, and 375px mobile widths.
- Tilt: dispatch pointermove, assert transform changes.
- Timeline: check no overlap at all three widths (previous layout overlapped at tablet-landscape).
- Console clean.
