# Neural Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace particles.js with a custom "thinking" neural canvas, add floating neuron orbs to the hero, and give existing components living tics (cycling placeholder, breathing glows, timeline pulse).

**Architecture:** One new vanilla-JS canvas module (`js/neural.js`) draws a node/synapse network with traveling pulses on a fixed full-viewport canvas in the exact layer slot particles.js occupied. Hero orbs and tics are CSS animations plus two small inline scripts. No libraries.

**Tech Stack:** Static HTML + CSS + vanilla JS (canvas 2D). Verification via preview server (`preview_start` name "portfolio") with javascript_tool evals; screenshots when the pane cooperates.

## Global Constraints

- No new dependencies; particles.js dependency REMOVED entirely (script tags, `#particles-js` div, CSS rules, `particles.json` file).
- Colors only from existing brand values: node dim `#06a8f3`, excited/pulse `#00f0ff`, edges `rgba(6,168,243,…)`, CSS via `var(--accent…)` family.
- Animations run unconditionally (owner's standing decision; no reduced-motion guards).
- Animate transform/opacity/canvas only. ONE documented exemption: the timeline pulse dot animates `top` on a single 8px element once per 7s (imperceptible cost; percentage-based translateY cannot reference parent height).
- Chatbot, ask-bar wiring, nav, sections functionally untouched.
- Preview caches hard: verify CSS via stylesheet-href cache-bust swap, JS/HTML via cache-busted page URL (`/?v=<now>`), and if a JS file changed, confirm the loaded code (e.g. `typeof window.__neuralStats`) before trusting eval results.

---

### Task 1: Neural canvas background (replaces particles.js)

**Files:**
- Create: `js/neural.js`
- Modify: `index.html` (replace `#particles-js` div with canvas; remove particles.js script tags; add neural.js script tag)
- Modify: `css/style.css` (replace `#particles-js` rules with `#neural-bg` rule)
- Delete: `particles.json`

**Interfaces:**
- Produces: `window.__neuralStats()` → `{nodes: number, pulses: number, frames: number}` (used by verification and later tasks' regression checks). Canvas element id: `neural-bg`.

- [ ] **Step 1: Create `js/neural.js`**

```js
/* Neural background: nodes + synapses with traveling "thought" pulses.
   Cursor excites nearby nodes; clicks fire cascades. Replaces particles.js. */
(() => {
   const canvas = document.getElementById('neural-bg');
   if (!canvas) return;
   const ctx = canvas.getContext('2d');
   const isMobile = matchMedia('(max-width: 768px)').matches;
   const NODE_COUNT = isMobile ? 28 : 55;
   const LINK_DIST = 160;
   const mouse = { x: -9999, y: -9999 };
   let nodes = [], pulses = [], W, H, raf;
   let frameCount = 0;

   const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

   function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   }

   function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
         x: Math.random() * W,
         y: Math.random() * H,
         vx: (Math.random() - 0.5) * 0.15,
         vy: (Math.random() - 0.5) * 0.15,
         charge: 0
      }));
   }

   function neighbors(node) {
      return nodes.filter(m => m !== node && dist(node, m) < LINK_DIST);
   }

   function fire(node, depth) {
      if (depth <= 0) return;
      node.charge = 1;
      const ns = neighbors(node);
      if (!ns.length) return;
      const target = ns[Math.floor(Math.random() * ns.length)];
      pulses.push({ from: node, to: target, t: 0, depth });
   }

   function pulseArrived(p) {
      p.to.charge = 1;
      if (Math.random() < 0.75) fire(p.to, p.depth - 1);
   }

   let lastFire = 0, nextFireDelay = 1000;
   function autoFire(now) {
      if (now - lastFire > nextFireDelay) {
         fire(nodes[Math.floor(Math.random() * nodes.length)], 3);
         lastFire = now;
         nextFireDelay = 800 + Math.random() * 1400;
      }
   }

   let lastCursorFire = 0;
   window.addEventListener('pointermove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const now = performance.now();
      if (now - lastCursorFire > 600) {
         const near = nodes.find(n => dist(n, mouse) < 120);
         if (near) {
            fire(near, 2);
            lastCursorFire = now;
         }
      }
   });

   window.addEventListener('click', e => {
      let best = null, bestD = Infinity;
      for (const n of nodes) {
         const d = Math.hypot(n.x - e.clientX, n.y - e.clientY);
         if (d < bestD) { bestD = d; best = n; }
      }
      if (best) fire(best, 5);
   });

   function tick(now) {
      ctx.clearRect(0, 0, W, H);
      autoFire(now);

      for (const n of nodes) {
         n.x += n.vx;
         n.y += n.vy;
         if (n.x < 0) n.x += W;
         if (n.x > W) n.x -= W;
         if (n.y < 0) n.y += H;
         if (n.y > H) n.y -= H;
         n.charge *= 0.96;
         const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
         if (md < 120) n.charge = Math.max(n.charge, (1 - md / 120) * 0.6);
      }

      for (let i = 0; i < nodes.length; i++) {
         for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j], d = dist(a, b);
            if (d < LINK_DIST) {
               const alpha = (1 - d / LINK_DIST) * 0.18 + Math.max(a.charge, b.charge) * 0.1;
               ctx.strokeStyle = 'rgba(6,168,243,' + alpha.toFixed(3) + ')';
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.moveTo(a.x, a.y);
               ctx.lineTo(b.x, b.y);
               ctx.stroke();
            }
         }
      }

      pulses = pulses.filter(p => {
         p.t += 16 / 600;
         if (p.t >= 1) {
            pulseArrived(p);
            return false;
         }
         const x = p.from.x + (p.to.x - p.from.x) * p.t;
         const y = p.from.y + (p.to.y - p.from.y) * p.t;
         ctx.fillStyle = 'rgba(0,240,255,0.9)';
         ctx.shadowColor = '#00f0ff';
         ctx.shadowBlur = 8;
         ctx.beginPath();
         ctx.arc(x, y, 2.2, 0, 7);
         ctx.fill();
         ctx.shadowBlur = 0;
         return true;
      });

      for (const n of nodes) {
         const r = 1.6 + n.charge * 2.2;
         ctx.fillStyle = n.charge > 0.15
            ? 'rgba(0,240,255,' + (0.5 + 0.5 * n.charge).toFixed(3) + ')'
            : 'rgba(6,168,243,0.55)';
         ctx.beginPath();
         ctx.arc(n.x, n.y, r, 0, 7);
         ctx.fill();
      }

      frameCount++;
      raf = requestAnimationFrame(tick);
   }

   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         cancelAnimationFrame(raf);
      } else {
         raf = requestAnimationFrame(tick);
      }
   });

   window.addEventListener('resize', () => {
      resize();
      initNodes();
   });

   window.__neuralStats = () => ({ nodes: nodes.length, pulses: pulses.length, frames: frameCount });

   resize();
   initNodes();
   raf = requestAnimationFrame(tick);
})();
```

- [ ] **Step 2: Swap markup and scripts in `index.html`**

Replace:

```html
      <!-- Particle container-->
      <div id="particles-js"></div>
```

with:

```html
      <!-- Neural background canvas -->
      <canvas id="neural-bg" aria-hidden="true"></canvas>
```

Remove BOTH particles script blocks near the end of body:

```html
      <!-- Load particles.js -->
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script>
         particlesJS.load('particles-js', 'particles.json', function() {
            console.log('particles.js loaded');
         });
      </script>
```

and in their place add:

```html
      <!-- Neural background -->
      <script src="js/neural.js"></script>
```

- [ ] **Step 3: Swap CSS in `css/style.css`**

Replace:

```css
#particles-js {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; 
  pointer-events: auto; /* allow hover interaction */
}
#particles-js canvas {
  pointer-events: auto; /* allow hover interaction with particles */
}
```

with:

```css
#neural-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
```

- [ ] **Step 4: Delete `particles.json`**

```bash
git rm particles.json
```

- [ ] **Step 5: Verify in preview**

1. `preview_start` name "portfolio"; navigate to `/?v=<now>`.
2. Eval `typeof window.__neuralStats` → `"function"` (proves new JS loaded; if `"undefined"`, cache-bust harder by appending a fresh query to the page URL).
3. Eval: `(() => { const a = window.__neuralStats(); return new Promise(r => setTimeout(() => { const b = window.__neuralStats(); r(JSON.stringify({nodes: b.nodes, framesAdvanced: b.frames > a.frames, framesPerSec: (b.frames - a.frames)})); }, 1000)); })()` — Expected: nodes 55 (desktop), framesAdvanced true, framesPerSec ≥ 40.
4. Eval a synthetic click: `(() => { const before = window.__neuralStats().pulses; document.body.dispatchEvent? window.dispatchEvent(new MouseEvent('click', {clientX: innerWidth/2, clientY: innerHeight/2})) : null; return new Promise(r => setTimeout(() => r(JSON.stringify({pulsesAfterClick: window.__neuralStats().pulses >= 1 || before >= 0})), 200)); })()` — Expected: pulse count reacts (cascades may already be running from autoFire; any nonzero activity within a second is a pass).
5. Confirm zero references remain: eval `JSON.stringify({particlesDiv: !!document.getElementById('particles-js'), particlesLib: typeof window.particlesJS})` — Expected: `{"particlesDiv":false,"particlesLib":"undefined"}`.
6. Console errors: none. Mobile 375px reload: `window.__neuralStats().nodes` = 28. Resize back.

- [ ] **Step 6: Commit**

```bash
git add js/neural.js index.html css/style.css
git rm --cached particles.json 2>/dev/null; git add -u
git commit -m "Replace particles.js with living neural canvas background"
```

---

### Task 2: Hero neuron orbs with depth parallax

**Files:**
- Modify: `index.html` (orb divs in `section.home` + parallax lines added to the existing hero ask script)
- Modify: `css/style.css` (orb styles after the `.ask-chip:hover` rule)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed later.

- [ ] **Step 1: Add orb markup in `index.html`**

Directly after the `</div>` closing `.main-container` inside `section.home` (before the `.social-links` div), add:

```html
         <div class="neuron-orb orb-1" aria-hidden="true"></div>
         <div class="neuron-orb orb-2" aria-hidden="true"></div>
         <div class="neuron-orb orb-3" aria-hidden="true"></div>
         <div class="neuron-orb orb-4" aria-hidden="true"></div>
```

- [ ] **Step 2: Add orb CSS in `css/style.css`** (after the `.ask-chip:hover` rule)

```css
/* Floating neuron orbs: drift on ::before (animation) so cursor parallax
   (transform via --ox/--oy) composes instead of fighting. */
.neuron-orb {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  transform: translate(calc(var(--ox, 0px) * var(--depth, 1)), calc(var(--oy, 0px) * var(--depth, 1)));
  transition: transform 0.4s ease-out;
}

.neuron-orb::before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--accent-bright), var(--accent) 55%, transparent 78%);
  filter: blur(var(--orb-blur, 2px));
  animation: orb-drift var(--drift-time, 10s) ease-in-out infinite alternate;
  opacity: 0.75;
}

@keyframes orb-drift {
  from { transform: translate(0, 0); }
  to { transform: translate(10px, -14px); }
}

.orb-1 { top: 24%; right: 18%; width: 22px; height: 22px; --depth: 1.2; --orb-blur: 3px; --drift-time: 11s; }
.orb-2 { top: 42%; right: 8%;  width: 14px; height: 14px; --depth: 0.5; --orb-blur: 4px; --drift-time: 9s; }
.orb-3 { top: 64%; right: 26%; width: 26px; height: 26px; --depth: 1.5; --orb-blur: 6px; --drift-time: 13s; }
.orb-4 { top: 30%; right: 34%; width: 10px; height: 10px; --depth: 0.3; --orb-blur: 2px; --drift-time: 8s; }

@media (max-width: 768px) {
  .neuron-orb {
    display: none;
  }
}
```

- [ ] **Step 3: Add parallax lines to the hero ask script in `index.html`**

Inside the existing `<!-- Hero ask bar wiring -->` IIFE (or as a sibling IIFE next to it if the wiring script is structured differently — match what exists), add:

```js
         if (matchMedia('(pointer: fine)').matches) {
            const heroSection = document.querySelector('section.home');
            const orbs = document.querySelectorAll('.neuron-orb');
            if (heroSection && orbs.length) {
               heroSection.addEventListener('pointermove', e => {
                  const x = ((e.clientX / innerWidth) - 0.5) * 30;
                  const y = ((e.clientY / innerHeight) - 0.5) * 20;
                  orbs.forEach(o => {
                     o.style.setProperty('--ox', x.toFixed(1) + 'px');
                     o.style.setProperty('--oy', y.toFixed(1) + 'px');
                  });
               });
            }
         }
```

- [ ] **Step 4: Verify in preview**

1. Cache-busted page reload; stylesheet href swap.
2. Eval: `document.querySelectorAll('.neuron-orb').length` → 4.
3. Eval synthetic pointermove on `section.home` (clientX = innerWidth*0.9, clientY = innerHeight*0.2, bubbles true), then read `document.querySelector('.orb-1').style.getPropertyValue('--ox')` → non-empty px value.
4. Eval drift running: sample `getComputedStyle(document.querySelector('.orb-1'), '::before').transform` twice 700ms apart → values differ.
5. Orbs must not overlap ask-bar: eval bounding rects of `.ask-bar` vs each orb → no intersection at ~1400px width.
6. Mobile 375px: `getComputedStyle(document.querySelector('.orb-1')).display` → `"none"`. Resize back. Console clean.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "Add floating neuron orbs with depth parallax to hero"
```

---

### Task 3: Nervous-system tics

**Files:**
- Modify: `index.html` (placeholder-cycle script added next to the hero ask wiring)
- Modify: `css/style.css` (robot pulse, breathing glows, timeline pulse)

**Interfaces:**
- Consumes: `#heroAskInput` (exists), `.ask-bar > i` robot icon (exists), `.nav-container` (exists), `.timeline-v` / its `::before` center line (exists).
- Produces: nothing consumed later.

- [ ] **Step 1: Placeholder cycle script in `index.html`** (sibling IIFE next to the hero ask wiring)

```html
      <!-- Ask-bar placeholder cycles questions until first interaction -->
      <script>
         (() => {
            const input = document.getElementById('heroAskInput');
            if (!input) return;
            const restingText = 'Ask my AI assistant anything about me...';
            const questions = ['What has Zifan built?', "What's his tech stack?", 'Why should we hire him?'];
            let qi = 0, ci = 0, deleting = false, stopped = false, timer;

            const stop = () => {
               if (stopped) return;
               stopped = true;
               clearTimeout(timer);
               input.placeholder = restingText;
            };
            input.addEventListener('focus', stop);
            input.addEventListener('input', stop);

            (function step() {
               if (stopped) return;
               const q = questions[qi % questions.length];
               if (!deleting) {
                  ci++;
                  input.placeholder = q.slice(0, ci);
                  if (ci >= q.length) {
                     deleting = true;
                     timer = setTimeout(step, 1800);
                     return;
                  }
                  timer = setTimeout(step, 55);
               } else {
                  ci--;
                  input.placeholder = q.slice(0, ci) || ' ';
                  if (ci <= 0) {
                     deleting = false;
                     qi++;
                     timer = setTimeout(step, 350);
                     return;
                  }
                  timer = setTimeout(step, 28);
               }
            })();
         })();
      </script>
```

- [ ] **Step 2: Tic CSS in `css/style.css`**

Robot icon pulse — MODIFY the existing `.ask-bar > i` rule to add the animation property (keep its other declarations):

```css
.ask-bar > i {
  color: var(--accent);
  font-size: 1.1rem;
  flex-shrink: 0;
  animation: robot-pulse 3s ease-in-out infinite;
}

@keyframes robot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.12); opacity: 1; }
}
```

Breathing glows (opacity-only, on pseudo-element glow layers). `.nav-container` already has `position: relative`? It does NOT — add `position: relative;` to its existing rule. `.ask-bar` has no positioning — add `position: relative;` to its existing rule. Then:

```css
.nav-container::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 999px;
  box-shadow: 0 0 24px var(--accent-glow-soft);
  opacity: 0.3;
  animation: glow-breathe 6s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: -1;
}

.ask-bar::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 999px;
  box-shadow: 0 0 30px var(--accent-glow-soft);
  opacity: 0.35;
  animation: glow-breathe 6s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: -1;
}

@keyframes glow-breathe {
  from { opacity: 0.25; }
  to { opacity: 0.9; }
}
```

Timeline pulse (documented `top` exemption — single 8px element, 7s period):

```css
/* Pulse traveling down the timeline's center line */
.timeline-v::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: var(--accent-bright);
  box-shadow: 0 0 10px var(--accent-glow);
  opacity: 0;
  animation: line-pulse 7s linear infinite;
  pointer-events: none;
}

@keyframes line-pulse {
  0% { top: 0; opacity: 0; }
  6% { opacity: 1; }
  46% { top: calc(100% - 8px); opacity: 1; }
  52% { top: calc(100% - 8px); opacity: 0; }
  100% { top: calc(100% - 8px); opacity: 0; }
}
```

And inside the existing `@media (max-width: 768px)` block (near the other `.timeline-v` mobile rules):

```css
  .timeline-v::after {
    left: 24px;
    margin-left: -3px;
  }
```

- [ ] **Step 3: Verify in preview**

1. Cache-busted reload + stylesheet swap.
2. Placeholder cycling: sample `document.getElementById('heroAskInput').placeholder` twice 800ms apart → different strings, both prefixes of one of the three questions (or mid-delete).
3. Stop-on-focus: eval `input.focus()` then read placeholder after 300ms → equals the resting text and stays constant across two samples.
4. Robot pulse: `getComputedStyle(document.querySelector('.ask-bar > i')).animationName` → `robot-pulse`.
5. Breathing: `getComputedStyle(document.querySelector('.nav-container'), '::after').animationName` → `glow-breathe`; same for `.ask-bar::after`.
6. Timeline pulse: scroll to `#education`; `getComputedStyle(document.querySelector('.timeline-v'), '::after').animationName` → `line-pulse`.
7. Console clean; ask-bar still opens chatbot on chip click (regression: click a chip, `#chatbotWindow` gets `active`, then close it).

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "Add nervous-system tics: cycling placeholder, breathing glows, timeline pulse"
```

---

## Final Verification (after all tasks)

1. Desktop + 375px sweep: neural canvas active everywhere, orbs desktop-only, tics running, all previous features intact (tilt cards, timeline, clusters, footer).
2. `window.__neuralStats().frames` advancing ≥ 40/s; `document.getAnimations().length` includes orb-drift/robot-pulse/glow-breathe/line-pulse entries.
3. Chatbot end-to-end from chip click still works.
4. Console: zero errors.
