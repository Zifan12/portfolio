# Neural Core: Living-Site Design

Date: 2026-07-12
Status: Approved (brain replaces particles.js; hero gets neuron orbs)

## Goal

Make the site read as a living system with "a brain powering the website." One coherent organism: a neural background that visibly thinks, plus quiet nervous-system tics on existing components. Exilus (the RAG chatbot) is the story's brain; the visuals are its activity.

## Components

### 1. Neural canvas background (signature - replaces particles.js)

New file `js/neural.js`, one `<canvas id="neural-bg">` fixed behind content (same layer slot particles.js used; particles.js script tag, config load, and `#particles-js` div are removed; `particles.json` deleted).

Behavior:
- ~55 nodes desktop / ~28 below 768px, randomly placed, drifting very slowly (wrap at edges).
- Edges drawn between nodes closer than ~160px, opacity by distance (familiar constellation base).
- **Firing:** every 0.8-2.2s (random), a random node emits a pulse: a bright dot travels along one of its edges to the neighbor over ~600ms, which then fires onward with decreasing probability (cascade depth ~3). Traveling pulses are the "thinking" signal.
- **Cursor excitation:** nodes within ~120px of the pointer brighten and grow slightly; the nearest node fires immediately when the cursor moves into range (throttled).
- **Click ripple:** click anywhere fires the nearest node with cascade depth 5.
- Colors: node #06a8f3 dim / #00f0ff excited; edges rgba(6,168,243,0.10-0.28); pulses #00f0ff with glow.
- Perf: single rAF loop, devicePixelRatio-aware sizing, pauses via `document.visibilitychange`. Pointer handling on window with cached mouse position (no per-node listeners).
- Interaction targets only the canvas layer (pointer-events: none on canvas; window-level listeners for position/clicks so page interactions are unaffected).

### 2. Hero neuron orbs

4 blurred glowing orbs (`.neuron-orb`, div elements in `section.home`, sizes 10-26px, blur 2-8px) placed in the hero's right half at varied heights. Each drifts on its own slow keyframe loop and shifts against cursor via the existing hero pointermove handler pattern (CSS vars, depth factors 0.3/0.6/1.0/1.4). `aria-hidden`, `pointer-events: none`.

### 3. Nervous-system tics (existing components)

- **Ask-bar placeholder cycle:** placeholder text types out, holds, deletes, cycles through 3 questions ("What has Zifan built?", "What's his tech stack?", "Why should we hire him?"). Plain JS interval on the `placeholder` attribute; stops permanently the first time the input receives focus or text.
- **Robot icon pulse:** `.ask-bar > i` gets a soft 3s glow/scale pulse.
- **Breathing glows:** nav pill (`.nav-container`) and ask-bar box-shadows oscillate subtly (~6s ease-in-out loop, +-30% glow strength).
- **Timeline pulse:** a small light dot travels down `.timeline-v::before`'s gradient line every ~7s (implemented as a child pseudo/element animated with translateY).

## Constraints

- No new dependencies; vanilla canvas + CSS only. particles.js dependency REMOVED.
- Brand palette vars only.
- Animations run unconditionally (owner's standing decision).
- transform/opacity/canvas-draw only; no layout-affecting animation.
- Chatbot, ask-bar wiring, sections, nav all functionally untouched.

## Files

- Create: `js/neural.js`
- Modify: `index.html` (canvas element, orb divs, script swaps, placeholder-cycle + orb-parallax script)
- Modify: `css/style.css` (orb styles, tic animations; remove `#particles-js` rules)
- Delete: `particles.json`

## Verification

- Canvas draws, pulses travel (sample pixel activity or expose a debug counter), cursor excitation flag, click cascade.
- 60fps-ish: frame budget sanity check via `performance.now()` deltas over 60 frames < ~20ms avg.
- Placeholder cycles then stops on focus. Orbs present, parallax responds. Mobile 375px: reduced node count, no horizontal scroll, console clean.
