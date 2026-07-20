# Portfolio Website - Project Documentation

## Overview

A personal portfolio website for Zifan Li, a third-year Computer Science student at the University of Alberta specializing in AI engineering. The site showcases education, skills, projects, and certificates, and features an AI-powered chatbot ("Exilus") built with Retrieval-Augmented Generation (RAG).

**Live Site:** [zifan-portfolio.vercel.app](https://zifan-portfolio.vercel.app)

---

## Architecture

The project is split into two parts:

| Layer | Tech | Hosting |
|-------|------|---------|
| Frontend | Static HTML/CSS/JS | Vercel |
| Backend | Python FastAPI | Render |

---

## Project Structure

```
Portfolio Website/
├── index.html                 # Single-page HTML (all sections)
├── RESUME.tex                 # LaTeX resume source
├── README.md                  # Project readme
├── .gitignore
│
├── css/
│   ├── style.css              # Main stylesheet (~1800 lines)
│   └── chatbot.css            # Chatbot widget styles (~510 lines)
│
├── js/
│   ├── neural.js              # Neural-canvas background (nodes, synapses, pulses)
│   └── chatbot.js             # Chatbot frontend controller
│
├── images/
│   ├── backgrounds/           # Full-page background images
│   ├── certificates/          # Certificate thumbnails
│   ├── education/             # School logos (HTA, UofA)
│   ├── icons/                 # Skill/tech SVG icons (Python, PyTorch, etc.)
│   ├── profile/               # Profile photo & favicon
│   ├── projects/              # Project screenshots
│   ├── robot/                 # Chatbot avatar SVG
│   └── others/                # Resume PDF for download
│
├── documents/                 # PDF certificates (rendered in-browser)
├── videos/                     # Background/demo video assets (planet.mp4)
│
└── backend/
    ├── main.py                # FastAPI server & /chat endpoint
    ├── rag.py                 # RAG retrieval & prompt building
    ├── ingest.py              # Document ingestion into ChromaDB
    ├── requirements.txt       # Python dependencies
    ├── chroma_db/             # Generated vector database (gitignored)
    └── data/                  # Source markdown docs for RAG
        ├── profile_summary.md
        ├── educaton.md
        ├── skills.md
        ├── work_experience.md
        ├── career_goals.md
        ├── current_focus.md
        ├── technical_focus.md
        ├── hobbies.md
        └── heart_disease_predictor.md
```

---

## Frontend

### Single-Page Layout (`index.html`)

The entire site is a single HTML file with 7 sections, each linked from a fixed navigation bar:

1. **Home** - Typography-led hero over a living neural-canvas background. Gradient "Zifan Li" name, typewriter role cycler ("CS Student", "AI & ML Enthusiast", "Aspiring AI Engineer"), a short intro, and a **live Exilus ask-bar**: submitting the bar or tapping a suggestion chip opens the chatbot and fires the question at the RAG backend. Four floating neuron orbs drift with cursor parallax; social links (GitHub, LinkedIn, Instagram, Email) sit below.
2. **About (Introduction)** - Bio paragraph, profile photo, and a "Download Resume" button linking to a PDF.
3. **Education (Academic Background)** - Horizontal timeline with school logos (Holy Trinity Academy 2020-2023, University of Alberta 2023-Present). Timeline switches to vertical on mobile.
4. **Skills** - Grid of 15 skill cards with SVG icons: Python, Scikit-learn, PyTorch, LangChain/LangGraph, Matplotlib, SQLite, NumPy, GitHub, OpenAI API, ChromaDB, FastAPI, C, Java, JavaScript, Django.
5. **Projects** - Swiper.js carousel with 3D coverflow effect displaying 3 projects:
   - Heart Disease Predictor (ML model comparison, Streamlit deployment, SHAP interpretability)
   - Portfolio Website with AI Chatbot (this project itself)
   - Event Lottery System (Android/Java group project with Firebase)
6. **Certificates** - PDF certificates rendered directly in-browser via PDF.js, with "View Credential" links to Coursera/DataCamp.
7. **Contact** - Form powered by Formspree, submitted over AJAX (fetch) with an inline status message instead of a page redirect. Plus email/GitHub/LinkedIn links.

### Third-Party Libraries Used

| Library | Version/CDN | Purpose |
|---------|-------------|---------|
| **Typed.js** | 2.0.12 | Typewriter text animation in the hero section |
| **Swiper.js** | 11.x | Project carousel with coverflow 3D effect, autoplay, pagination, and navigation |
| **PDF.js** | 3.4.120 | Renders certificate PDFs onto `<canvas>` elements in-browser |
| **AOS** (Animate on Scroll) | 2.3.4 | Scroll-triggered animations (fade, zoom, flip) on most elements |
| **Font Awesome** | 6.5.2 | Icons throughout the site (social links, hamburger menu, chatbot, etc.) |

### CSS (`css/style.css`)

- **CSS Custom Properties** for responsive design: spacing, typography scale (`clamp()` functions), and component sizes.
- **Fonts**: Orbitron (logo/headings with neon glow) and Poppins (body text).
- **Color scheme**: Dark backgrounds with blue/cyan neon accents (`#0044ff`, `#0051ff`, `#00f0ff`, `#06a8f3`).
- **Animations**: Logo flicker effect, profile image scale-on-hover, hover transforms on skill cards and certificate cards.
- **Navigation**: Fixed top bar with frosted glass effect (`backdrop-filter: blur`), animated underline on link hover. Mobile hamburger menu with slide-down dropdown.
- **Responsive breakpoints**:
  - `max-width: 768px` - Mobile: stacked layout, hamburger menu, vertical timeline, smaller cards.
  - `600px-1280px portrait` - Tablet portrait: larger fonts, adjusted timeline.
  - `600px-1400px landscape` - Tablet/laptop landscape: two-column about section.
  - `min-width: 1600px` - Large desktop: wider padding, 5-column skill grid.
  - `min-width: 1920px` - Ultra-wide: 6-column skill grid.

### Chatbot CSS (`css/chatbot.css`)

- Floating toggle button (bottom-right) with gradient background and glow.
- Chat window with glassmorphism effect (`backdrop-filter: blur(20px)`).
- Header with animated shimmer effect and glowing robot icon.
- Message bubbles: user messages (right-aligned, blue gradient), bot messages (left-aligned, translucent dark).
- Typing indicator with bouncing dot animation.
- Custom scrollbar for the message area.

### Neural Canvas Background (`js/neural.js`)

A hand-written `<canvas>` animation that replaced particles.js. Runs as a self-contained IIFE, draws every frame via `requestAnimationFrame`, and pauses itself on `visibilitychange` when the tab is hidden.

- **Nodes & synapses**: 55 drifting nodes on desktop, 28 on mobile (`max-width: 768px`); nearby nodes (< 160px) are linked with faint cyan lines whose opacity scales with distance and charge.
- **Thought pulses**: nodes periodically fire traveling pulses along synapses to random neighbors, cascading a few hops deep and lighting up nodes as they arrive.
- **Cursor excitation**: nodes near the pointer gain charge and glow; moving the cursor fires small cascades.
- **Click cascades**: clicking fires a deeper (depth-5) pulse cascade from the nearest node.
- **DPR-aware** rendering, capped at 2× for performance.

### Hero Interactions & Nervous-System Tics

- **Neuron orbs**: four soft glowing orbs (`.neuron-orb`) drift via CSS keyframes and shift with cursor parallax (a `--ox` custom property). Hidden on mobile.
- **Live Exilus ask-bar** (`#heroAsk`): submitting the bar or clicking a suggestion chip calls `window.zifanChatbot` — it opens the chat widget, drops the question into the chatbot input, and sends it to the RAG backend. The hero bar is a shortcut into the same Exilus assistant as the floating widget.
- **Cycling placeholder**: until the first interaction, the ask-bar placeholder types out suggested questions ("What has Zifan built?", "What's his tech stack?", "Why should we hire him?") then rests on the default prompt.
- **Ambient tics**: breathing glows on accent elements and a subtle pulse on the timeline, for a "living site" feel.

---

## Backend

### FastAPI Server (`backend/main.py`)

- **Framework**: FastAPI with CORS middleware (allows all origins for frontend-backend communication).
- **Endpoint**: `POST /chat` - Accepts a JSON body `{ "message": "..." }`.
- **Rate limiting**: 10 requests per minute per IP using SlowAPI.
- **Input validation** (Pydantic):
  - Max 500 characters per message.
  - Empty/whitespace-only messages rejected.
  - Input is stripped of leading/trailing whitespace.
- **Flow**: Receives query -> retrieves relevant document chunks via RAG -> builds prompt with context -> calls OpenAI GPT-4o-mini (max 300 tokens) -> returns response.

### RAG Retriever (`backend/rag.py`)

- **Embeddings**: OpenAI `text-embedding-3-small` model.
- **Vector Store**: ChromaDB with a collection named `portfolio_docs`.
- **Retrieval**: Similarity search returning top 4 most relevant chunks with scores.
- **Prompt Building**: Constructs a system prompt defining the chatbot's persona ("Exilus"), guidelines (third person, concise bullet points, redirect off-topic questions), and injects retrieved context. Returns a messages array for the OpenAI Chat Completions API.

### Document Ingestion (`backend/ingest.py`)

- **Loaders**: LangChain `DirectoryLoader` for both PDF and Markdown files from the `backend/data/` folder.
- **Chunking**: `RecursiveCharacterTextSplitter` with 500-character chunks and 100-character overlap. Splits on paragraph breaks, newlines, sentences, words.
- **Storage**: Creates embeddings and stores chunks in ChromaDB at `backend/chroma_db/`.
- **Knowledge Base** (9 markdown documents covering): profile summary, education, skills, work experience, career goals, current focus, technical focus, hobbies, and a project description (heart disease predictor).

### Python Dependencies

- **Web**: FastAPI, Uvicorn, Pydantic, python-dotenv, SlowAPI
- **AI/ML**: OpenAI SDK, LangChain, LangChain-OpenAI, LangChain-Chroma, LangChain-Community
- **Documents**: PyPDF
- **Vector DB**: ChromaDB

---

## Chatbot Frontend (`js/chatbot.js`)

The `ChatbotController` class manages the chatbot widget:

- **Toggle/close** the chat window with CSS class toggling and smooth animations.
- **First-open welcome message** explaining the chatbot and noting potential cold-start delay (free hosting tier).
- **Message sending**: POST to the Render-hosted backend (`https://portfolio-chatbot-od42.onrender.com/chat`).
- **Typing indicator**: Animated bouncing dots displayed while waiting for the API response.
- **Response formatting**: Bot responses are parsed for bullet points (`-`, `*`, ``) and converted to HTML `<ul>/<li>` lists. Regular text becomes `<p>` tags.
- **XSS protection**: All text is escaped via DOM `textContent` before being injected as `innerHTML`.
- **Auto-scroll**: Message area scrolls to bottom after each new message.

---

## Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | `zifan-portfolio.vercel.app` |
| Backend API | Render | `portfolio-chatbot-od42.onrender.com` |
| Contact Form | Formspree | `formspree.io/f/mldlgqrd` |

---

## Key Design Decisions

1. **Single HTML file** - The entire frontend is one `index.html` with anchor-based navigation, keeping deployment simple (no build step or framework).
2. **RAG over fine-tuning** - The chatbot uses retrieval-augmented generation with personal documents rather than fine-tuning a model, making it easy to update knowledge by editing markdown files and re-running ingestion.
3. **Separate backend** - The chatbot API is a standalone FastAPI service, keeping the OpenAI API key secure on the server side and allowing rate limiting.
4. **ChromaDB as vector store** - Lightweight, file-based vector database that can be regenerated from source documents at any time (gitignored, re-created via `ingest.py`).
5. **CSS-only animations** - Heavy use of CSS transitions, `@keyframes`, and AOS for visual polish without JavaScript overhead.
6. **Responsive-first design** - CSS custom properties with `clamp()` functions and multiple media query breakpoints ensure the site works across mobile, tablet, and desktop.
