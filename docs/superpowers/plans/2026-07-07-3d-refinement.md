# 3D Animation + Section Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared CSS-3D tilt system across the portfolio, tilt the hero orbit rings into a 3D plane, float the intro photo, rebuild the Academic Background timeline, and regroup Skills into labeled clusters.

**Architecture:** Pure CSS 3D transforms driven by CSS custom properties (`--tx`, `--ty`, `--idle`, `--lift`, `--zoom`, `--gx`, `--gy`); one vanilla JS pointer handler sets the vars. No libraries, no build step. All motion is `transform`/`opacity` only.

**Tech Stack:** Static HTML + CSS + vanilla JS. Verification via the local preview server (`python -m http.server 8000` via preview tools) with browser eval + screenshots.

## Global Constraints

- No new dependencies. No Three.js. No build step.
- Brand accent variables only: `var(--accent)` #06a8f3, `var(--accent-deep)` #0051ff, `var(--accent-bright)` #00f0ff, plus `--accent-glow`, `--accent-glow-soft`, `--surface`, `--line`, `--radius`.
- Animations run unconditionally (no `prefers-reduced-motion` guard — owner's explicit decision 2026-07-07).
- Animate only `transform` and `opacity`.
- Do not change section ids, nav labels, or copy text.
- Projects and Certificates sections keep their current (reverted-to-original) look; the only change allowed there is adding tilt behavior to `.cert-card` without altering its colors/borders/shadows.
- Browser caches CSS aggressively in the preview: always verify after swapping the stylesheet href with a cache-bust query (`css/style.css?v=<timestamp>`), not just a reload.
- The preview machine reports `pointer: fine` = true, so the tilt handler runs there.

**Files (whole plan):**
- Modify: `index.html` (tilt JS, tilt classes, intro photo wrap, timeline markup rebuild, skills regroup)
- Modify: `css/style.css` (tilt system, orbit plane keyframes, intro panel, new timeline styles + old timeline deletion, cluster styles)

---

### Task 1: Shared tilt system + first consumer (cert cards)

**Files:**
- Modify: `index.html` (add tilt script before the existing "Skill card cursor spotlight" script; add `tilt` class to the two `.cert-card` divs)
- Modify: `css/style.css` (add `.tilt` block after the `.skill-card:hover span` rule, i.e. end of the Skills styling area)

**Interfaces:**
- Produces: `.tilt` class contract used by Tasks 3, 4, 5. Transform formula (later tasks rely on these exact var names):
  `transform: perspective(900px) rotateX(var(--tx, 0deg)) rotateY(calc(var(--ty, 0deg) + var(--idle, 0deg))) translateY(var(--lift, 0px)) scale(var(--zoom, 1));`
  JS sets `--tx`, `--ty` (tilt angles) and `--gx`, `--gy` (glare position). CSS consumers may set `--idle` (resting Y angle), `--lift` (hover raise), `--zoom` (hover scale).

- [ ] **Step 1: Add tilt CSS to `css/style.css`**

Insert after the `.skill-card:hover span { ... }` rule:

```css
/* -------------------- Shared 3D Tilt System --------------------
   JS sets --tx/--ty (tilt) and --gx/--gy (glare).
   Consumers may set --idle (resting Y angle), --lift, --zoom. */
.tilt {
  position: relative;
  transform: perspective(900px) rotateX(var(--tx, 0deg)) rotateY(calc(var(--ty, 0deg) + var(--idle, 0deg))) translateY(var(--lift, 0px)) scale(var(--zoom, 1));
  transition: transform 0.35s ease;
  will-change: transform;
}

.tilt::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(240px circle at var(--gx, 50%) var(--gy, 50%), rgba(255, 255, 255, 0.12), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.tilt:hover::after {
  opacity: 1;
}
```

- [ ] **Step 2: Add tilt JS to `index.html`**

Insert before the `<!-- Skill card cursor spotlight -->` comment:

```html
      <!-- Shared 3D tilt handler -->
      <script>
         (() => {
            if (!matchMedia('(pointer: fine)').matches) return;
            document.querySelectorAll('.tilt').forEach(el => {
               el.addEventListener('pointermove', e => {
                  const r = el.getBoundingClientRect();
                  const px = (e.clientX - r.left) / r.width - 0.5;
                  const py = (e.clientY - r.top) / r.height - 0.5;
                  el.style.setProperty('--ty', (px * 10).toFixed(2) + 'deg');
                  el.style.setProperty('--tx', (-py * 8).toFixed(2) + 'deg');
                  el.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
                  el.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
               });
               el.addEventListener('pointerleave', () => {
                  el.style.setProperty('--tx', '0deg');
                  el.style.setProperty('--ty', '0deg');
               });
            });
         })();
      </script>
```

NOTE: this script must run after all `.tilt` elements exist in the DOM (it sits near the end of `<body>`, which satisfies that). Later tasks add `.tilt` to more elements; they are picked up automatically because the script runs once at load after all markup.

- [ ] **Step 3: Apply to cert cards**

In `index.html`, change both certificate cards:

```html
<div class="cert-card tilt">
```

(two occurrences: the Machine Learning Specialization card and the Data Camp card; do NOT touch the commented-out third card)

In `css/style.css`, the cert card must keep its original hover scale. Its current rule is `transform: scale(1.05)` on `.cert-card:hover` — replace that rule body so the tilt transform owns the scale:

```css
.cert-card:hover {
  --zoom: 1.05;
  box-shadow: 0 0 30px #0051ff, 0 0 60px #0051ff inset;
}
```

- [ ] **Step 4: Verify in preview**

1. Ensure preview running (`preview_start` name `portfolio`).
2. Navigate to `http://localhost:8000/?v=<now>` and swap stylesheet href to `css/style.css?v=<now>` via eval.
3. Eval: scroll to `#certificates`, then:

```js
(() => { const c = document.querySelector('.cert-card.tilt'); const r = c.getBoundingClientRect();
  c.dispatchEvent(new PointerEvent('pointermove', {clientX: r.left + r.width*0.9, clientY: r.top + r.height*0.1, bubbles: true}));
  return getComputedStyle(c).transform; })()
```

Expected: a `matrix3d(...)` string (NOT `none`, NOT `matrix(1, 0, 0, 1, 0, 0)`).
4. Screenshot certificates section: cert card visuals unchanged (cyan 2px border, inset glow) apart from tilt.
5. Console errors: none.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "Add shared 3D tilt system, apply to certificate cards"
```

---

### Task 2: Hero orbit plane (3D ring tilt)

**Files:**
- Modify: `css/style.css` (`.planet-scene`, `.orbit-outer`, `.orbit-inner`, `@keyframes orbit-spin`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed later. Self-contained visual change.

- [ ] **Step 1: Update orbit CSS**

In `css/style.css`, change `.planet-scene` to add perspective (keep existing properties):

```css
.planet-scene {
  position: relative;
  flex-shrink: 0;
  transition: transform 0.3s ease-out;
  perspective: 1000px;
  transform-style: preserve-3d;
}
```

Replace the `.orbit-outer`, `.orbit-inner`, and `@keyframes orbit-spin` rules with:

```css
.orbit-outer {
  inset: -70px;
  animation: orbit-spin-3d 46s linear infinite;
}

.orbit-inner {
  inset: -34px;
  animation: orbit-spin-3d 28s linear infinite reverse;
}

@keyframes orbit-spin-3d {
  from { transform: rotateX(68deg) rotateZ(0deg); }
  to { transform: rotateX(68deg) rotateZ(360deg); }
}
```

(The old `@keyframes orbit-spin { to { transform: rotate(360deg); } }` block is deleted — nothing else references it.)

- [ ] **Step 2: Verify in preview**

1. Cache-bust stylesheet swap, scroll to top.
2. Eval:

```js
getComputedStyle(document.querySelector('.orbit-outer')).transform
```

Expected: `matrix3d(...)` (3D matrix proves rotateX applied; the flat version returned a 2D `matrix(...)`).
3. Screenshot hero: rings should render as ellipses forming a plane around the planet, moon dot on the outer ellipse. If the ellipse looks too tight against the planet, widen `.orbit-outer` inset from `-70px` to `-90px` and re-check.
4. Console errors: none.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "Tilt hero orbit rings into 3D orbital plane"
```

---

### Task 3: Introduction floating photo panel

**Files:**
- Modify: `index.html` (wrap the intro image)
- Modify: `css/style.css` (panel styles; add after `.about-details .left img` rule)

**Interfaces:**
- Consumes: `.tilt` contract from Task 1 (`--tx`/`--ty` set by JS; transform formula includes them).

- [ ] **Step 1: Wrap the intro image in `index.html`**

Current markup:

```html
               <div class="left" data-aos="fade-right" data-aos-duration="800" data-aos-delay="200">
                  <img src="images/profile/intro.png" alt = ""/>
               </div>
```

Replace with:

```html
               <div class="left" data-aos="fade-right" data-aos-duration="800" data-aos-delay="200">
                  <div class="intro-panel tilt">
                     <img src="images/profile/intro.png" alt="Zifan Li outdoors" />
                  </div>
               </div>
```

- [ ] **Step 2: Add panel CSS**

The existing `.about-details .left img` rule stays (it styles the image itself: radius, border, shadow). Add after it:

```css
/* Floating 3D panel around the intro photo */
.intro-panel {
  border-radius: var(--radius);
  animation: panel-float 6s ease-in-out infinite;
}

.intro-panel::before {
  content: "";
  position: absolute;
  inset: 12% -6% -6% 12%;
  border-radius: var(--radius);
  background: radial-gradient(60% 60% at 70% 70%, var(--accent-glow-soft), transparent 75%);
  filter: blur(24px);
  z-index: -1;
}

.intro-panel img {
  display: block;
}

@keyframes panel-float {
  0%, 100% { --lift: 0px; }
  50% { --lift: -10px; }
}
```

NOTE: the float animates `--lift`, which feeds the `.tilt` transform, so float and pointer-tilt compose instead of fighting. Animating a custom property requires it to be registered to interpolate smoothly; add this alongside:

```css
@property --lift {
  syntax: '<length>';
  initial-value: 0px;
  inherits: false;
}
```

(If `@property` is unsupported the float steps between 0 and -10px every 3s instead of easing — acceptable degradation, no breakage.)

- [ ] **Step 3: Verify in preview**

1. Cache-bust stylesheet swap; scroll to `#about` (instant).
2. Eval: sample `getComputedStyle(document.querySelector('.intro-panel')).transform` twice ~800ms apart. Expected: two different matrix values (float running).
3. Dispatch pointermove on `.intro-panel` (same pattern as Task 1 Step 4). Expected: `matrix3d(...)`.
4. Screenshot: photo has soft accent glow behind its bottom-right, no layout overlap with text column at ~830px width (this section previously overlapped at tablet-landscape; re-check).
5. Console errors: none.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "Float intro photo in 3D tilt panel with layered glow"
```

---

### Task 4: Academic Background perspective timeline (rebuild)

**Files:**
- Modify: `index.html` (replace timeline markup inside `#education`)
- Modify: `css/style.css` (new `.timeline-v` styles; DELETE all old timeline rules in base styles AND in the `@media (max-width:768px)` and `@media (min-width: 600px) and (max-width: 1280px) and (orientation: portrait)` blocks)

**Interfaces:**
- Consumes: `.tilt` contract from Task 1, specifically `--idle` (resting Y angle) and `--lift`.

- [ ] **Step 1: Replace timeline markup in `index.html`**

Everything between `<h2 class="title education-title" ...>...</h2>` and the closing `</div></section>` of `#education` (the whole `.timeline-horizontal` div) is replaced with:

```html
         <div class="timeline-v">
            <div class="timeline-entry" data-aos="fade-right" data-aos-duration="800">
               <div class="timeline-node">
                  <img src="images/education/HTA2.png" alt="Holy Trinity Academy">
               </div>
               <div class="timeline-card tilt">
                  <span class="timeline-years">2020 - 2023</span>
                  <h3>High School</h3>
                  <p>Holy Trinity Academy, Okotoks, AB</p>
               </div>
            </div>

            <div class="timeline-entry entry-right" data-aos="fade-left" data-aos-duration="800" data-aos-delay="150">
               <div class="timeline-node">
                  <img src="images/education/UofA.png" alt="University of Alberta">
               </div>
               <div class="timeline-card tilt">
                  <span class="timeline-years">2023 - Present</span>
                  <h3>Bachelor of Science (BSc) Specialization in Computing Science</h3>
                  <p>University of Alberta, Edmonton, AB</p>
                  <ul>
                     <li>3rd Year - Present</li>
                  </ul>
               </div>
            </div>
         </div>
```

- [ ] **Step 2: Delete old timeline CSS**

In `css/style.css` remove these rules entirely (base area, roughly between `#education` and the Skills comment banner): `.timeline-horizontal`, `.timeline-track`, `.timeline-item`, `.timeline-icon`, `.timeline-icon.icon-uofa img`, `.timeline-icon.icon-uofa`, `.timeline-item.item-uofa`, `.timeline-content.content-uofa`, `.timeline-content ul`, `.timeline-content p`, `.timeline-date.date-uofa`, `.timeline-icon.icon-hta img`, `.timeline-item.item-hta`, `.timeline-content.content-hta`, `.timeline-date.date-hta`, `.education-background .timeline-content.content-hta, .education-background .timeline-content.content-uofa` (both the base rule and its `:hover` variant).

Also remove the old timeline rules inside `@media (max-width:768px)` (`.timeline-track`, `.timeline-item`, `.timeline-icon`, `.timeline-content.content-hta`, `.timeline-date.date-hta`, `.timeline-icon.icon-uofa`, `.timeline-content.content-uofa`, `.timeline-date.date-uofa`, `.timeline-content.content-uofa li`) and the same family inside the portrait-tablet media block.

Keep `#education` and `.education-title` rules.

- [ ] **Step 3: Add new timeline CSS**

Add where the old base timeline rules were:

```css
/* Perspective vertical timeline */
.timeline-v {
  position: relative;
  max-width: 900px;
  margin: clamp(30px, 5vh, 50px) auto 0;
  padding: 10px 0;
}

.timeline-v::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, transparent, var(--accent), var(--accent-deep), transparent);
}

.timeline-entry {
  position: relative;
  width: 50%;
  padding: 20px 48px 20px 0;
}

.timeline-entry.entry-right {
  margin-left: 50%;
  padding: 20px 0 20px 48px;
}

.timeline-node {
  position: absolute;
  top: 28px;
  right: -28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18px var(--accent-glow-soft);
  z-index: 2;
}

.timeline-entry.entry-right .timeline-node {
  right: auto;
  left: -28px;
}

.timeline-node img {
  width: 65%;
  height: 65%;
  object-fit: contain;
}

.timeline-card {
  --idle: 6deg;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px 22px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  text-align: left;
}

.timeline-entry.entry-right .timeline-card {
  --idle: -6deg;
}

.timeline-card:hover {
  --idle: 0deg;
  --lift: -6px;
}

.timeline-years {
  display: inline-block;
  color: var(--accent);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: 6px;
}

.timeline-card h3 {
  font-size: var(--text-lg);
  margin-bottom: 4px;
}

.timeline-card p {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--text-sm);
}

.timeline-card ul {
  padding-left: 20px;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.75);
  font-size: var(--text-sm);
}
```

And inside `@media (max-width:768px)` (where the old mobile timeline rules were):

```css
  .timeline-v::before {
    left: 24px;
  }

  .timeline-entry,
  .timeline-entry.entry-right {
    width: 100%;
    margin-left: 0;
    padding: 16px 0 16px 64px;
  }

  .timeline-node,
  .timeline-entry.entry-right .timeline-node {
    right: auto;
    left: 0;
    width: 48px;
    height: 48px;
    top: 20px;
  }

  .timeline-card {
    --idle: 0deg;
  }
```

- [ ] **Step 4: Verify in preview**

1. Cache-bust reload (full page — markup changed).
2. Desktop (~830px+): screenshot `#education`. Expected: vertical gradient line center, HTA card left of line with node on the line, UofA card right, cards visibly angled toward the line.
3. Eval overlap check:

```js
(() => { const cards = [...document.querySelectorAll('.timeline-card')].map(c => c.getBoundingClientRect());
  const nodes = [...document.querySelectorAll('.timeline-node')].map(n => n.getBoundingClientRect());
  return {cardsOverlap: !(cards[0].right < cards[1].left || cards[1].right < cards[0].left || cards[0].bottom < cards[1].top || cards[1].bottom < cards[0].top), nodeCount: nodes.length}; })()
```

Expected: `cardsOverlap: false, nodeCount: 2`.
4. Resize to mobile (375px), reload: line on left at 24px, cards full width, no horizontal scroll (`document.documentElement.scrollWidth <= 375`).
5. Hover eval on a card (dispatch pointermove): transform becomes `matrix3d`, and computed `--idle` path visible as card straightening in screenshot (optional visual check).
6. Console errors: none.
7. Resize back to desktop.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "Rebuild Academic Background as 3D perspective timeline"
```

---

### Task 5: Skills clusters + tilt on skill cards

**Files:**
- Modify: `index.html` (regroup the 15 skill cards into 3 clusters; add `tilt` class to every skill card)
- Modify: `css/style.css` (cluster styles; fix `.skill-card:hover` transform conflict)

**Interfaces:**
- Consumes: `.tilt` contract from Task 1 (`--lift` for hover raise).

- [ ] **Step 1: Regroup skills markup in `index.html`**

Replace the single `<div class="skills-grid"> ... </div>` (all 15 cards) with three clusters. Every card keeps its existing inner markup (img + span(s)) but gains the `tilt` class. Card-to-cluster mapping:

```html
            <div class="skill-cluster" data-aos="fade-up" data-aos-duration="800">
               <h3 class="cluster-label">AI &amp; Machine Learning</h3>
               <div class="skills-grid">
                  <div class="skill-card tilt"><img src="images/icons/PyTorch.svg" alt="PyTorch" class="skill-icon-img"><span>PyTorch</span></div>
                  <div class="skill-card tilt"><img src="images/icons/scikit-learn.svg" alt="Scikit-learn" class="skill-icon-img"><span>Scikit-learn</span></div>
                  <div class="skill-card tilt"><img src="images/icons/langchain-color.svg" alt="langchain/langgraph" class="skill-icon-img"><span>LangChain</span><span>LangGraph</span></div>
                  <div class="skill-card tilt"><img src="images/icons/openai-svgrepo-com.svg" alt="OpenAI" class="skill-icon-img"><span>OpenAI API</span></div>
                  <div class="skill-card tilt"><img src="images/icons/Chroma--Streamline-Svg-Logos.svg" alt="Chroma" class="skill-icon-img"><span>ChromaDB</span></div>
                  <div class="skill-card tilt"><img src="images/icons/numpy-svgrepo-com.svg" alt="NumPy" class="skill-icon-img"><span>NumPy</span></div>
                  <div class="skill-card tilt"><img src="images/icons/Matplotlib.svg" alt="Matplotlib" class="skill-icon-img"><span>Matplotlib</span></div>
               </div>
            </div>

            <div class="skill-cluster" data-aos="fade-up" data-aos-duration="800" data-aos-delay="100">
               <h3 class="cluster-label">Languages</h3>
               <div class="skills-grid">
                  <div class="skill-card tilt"><img src="images/icons/Python.svg" alt="Python" class="skill-icon-img"><span>Python</span></div>
                  <div class="skill-card tilt"><img src="images/icons/C.svg" alt="C" class="skill-icon-img"><span>C</span></div>
                  <div class="skill-card tilt"><img src="images/icons/Java.svg" alt="Java" class="skill-icon-img"><span>Java</span></div>
                  <div class="skill-card tilt"><img src="images/icons/javascript-logo-svgrepo-com.svg" alt="JavaScript" class="skill-icon-img"><span>JavaScript</span></div>
               </div>
            </div>

            <div class="skill-cluster" data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
               <h3 class="cluster-label">Backend &amp; Tools</h3>
               <div class="skills-grid">
                  <div class="skill-card tilt"><img src="images/icons/FastAPI.svg" alt="FastAPI" class="skill-icon-img"><span>FastAPI</span></div>
                  <div class="skill-card tilt"><img src="images/icons/django-svgrepo-com.svg" alt="Django" class="skill-icon-img"><span>Django</span></div>
                  <div class="skill-card tilt"><img src="images/icons/SQLite.svg" alt="SQLite" class="skill-icon-img"><span>SQLite</span></div>
                  <div class="skill-card tilt"><img src="images/icons/github-mark.svg" alt="github" class="skill-icon-img"><span>GitHub</span></div>
               </div>
            </div>
```

(The old per-card `data-aos` attributes are dropped; the cluster wrapper animates instead. This removes the old broken pattern where 12 cards shared `data-aos-delay="300"`.)

- [ ] **Step 2: Add cluster CSS + fix hover conflict**

Add after the `.skills-grid` rule in `css/style.css`:

```css
.skill-cluster {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.skill-cluster + .skill-cluster {
  margin-top: clamp(28px, 4vh, 44px);
}

.cluster-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0 auto;
  max-width: var(--container-max-width);
  padding: 0 clamp(10px, 2vw, 20px);
}
```

Change `.skill-card:hover` — its current `transform: translateY(-8px);` line conflicts with the tilt transform. Replace the rule with:

```css
.skill-card:hover {
  --lift: -8px;
  border-color: var(--accent);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 24px var(--accent-glow-soft);
  background: rgba(255, 255, 255, 0.08);
}
```

Also reduce `.skills-grid` vertical padding since clusters now own spacing — change its `padding` to `padding: clamp(12px, 2vw, 20px) clamp(10px, 2vw, 20px);`.

- [ ] **Step 3: Verify in preview**

1. Cache-bust reload; scroll to `#skills` (instant).
2. Screenshot: three labeled clusters ("AI & Machine Learning" 7 cards, "Languages" 4, "Backend & Tools" 4), labels left-aligned above their grids.
3. Eval card count: `document.querySelectorAll('.skill-card').length` — Expected: `15`.
4. Tilt eval on one skill card (dispatch pointermove, expect `matrix3d`), and confirm existing spotlight still works (`--mx` set by the spotlight script — both handlers coexist since they set different vars).
5. Mobile 375px: clusters stack, one column, labels visible. Resize back.
6. Console errors: none.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "Group skills into labeled clusters with 3D tilt cards"
```

---

## Final Verification (after all tasks)

1. Full-page pass at desktop + 375px: hero (orbit plane + moon), about (floating photo), education (perspective timeline), skills (clusters), projects + certificates (unchanged visuals, certs tilt).
2. `document.getAnimations().length` > 15 (background stack + orbits + float all running).
3. Console: zero errors.
4. Hamburger menu still opens/navigates at 375px.
