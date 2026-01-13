# Zifan's Portfolio Website

A personal portfolio website featuring an AI-powered chatbot built with Retrieval-Augmented Generation (RAG). The chatbot uses semantic search over personal documents to answer questions about my background, skills, and projects.

![Portfolio Preview](images/projects/portfolio_website.png)

## Features

### Portfolio
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile devices
- **Interactive Sections** — Home, About, Education, Skills, Projects, Certificates, Contact
- **Project Carousel** — 3D coverflow effect using Swiper.js
- **PDF Certificates** — Rendered directly in-browser with PDF.js
- **Contact Form** — Integrated with Formspree for email submissions

### AI Chatbot (Exilus)
- **RAG-Powered** — Retrieves relevant context from personal documents before generating responses
- **Semantic Search** — Uses ChromaDB vector database for intelligent document retrieval
- **Rate Limited** — 10 requests per minute to prevent abuse
- **Input Validation** — 500 character limit with sanitization
- **Powered by GPT-4o-mini** — Fast, cost-effective responses

## Project Structure

```
Portfolio Website/
├── index.html              # Main HTML file
├── particles.json          # Particle.js configuration
├── README.md
│
├── css/
│   ├── style.css           # Main styles
│   └── chatbot.css         # Chatbot component styles
│
├── js/
│   └── chatbot.js          # Chatbot frontend logic
│
├── images/
│   ├── backgrounds/        # Background images
│   ├── certificates/       # Certificate images
│   ├── education/          # School/university logos
│   ├── icons/              # Skill & tech icons (SVG)
│   ├── profile/            # Profile photos
│   ├── projects/           # Project screenshots
│   └── robot/              # Chatbot avatar
│
├── documents/              # PDF certificates
│
└── backend/
    ├── main.py             # FastAPI server
    ├── rag.py              # RAG retrieval logic
    ├── ingest.py           # Document ingestion script
    ├── requirements.txt    # Python dependencies
    ├── chroma_db/          # Vector database (generated)
    └── data/               # Source documents for RAG
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

## Getting Started

### Frontend

Simply open `index.html` in a browser, or serve with any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve
```

### Backend (RAG Chatbot)

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Create a .env file with your OpenAI API key
   echo OPENAI_API_KEY=your-api-key-here > .env
   ```

5. **Ingest documents into the vector database:**
   ```bash
   python ingest.py
   ```

6. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### API Endpoint

```
POST /chat
Content-Type: application/json

{
  "message": "What are Zifan's skills?"
}
```

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 / CSS3 / JavaScript | Core web technologies |
| [Particle.js](https://vincentgarreau.com/particles.js/) | Interactive background effects |
| [Swiper.js](https://swiperjs.com/) | Project carousel with 3D coverflow |
| [AOS](https://michalsnik.github.io/aos/) | Scroll animations |
| [Typed.js](https://mattboldt.com/demos/typed-js/) | Typewriter text effect |
| [PDF.js](https://mozilla.github.io/pdf.js/) | In-browser PDF rendering |
| [Font Awesome](https://fontawesome.com/) | Icons |
| [Formspree](https://formspree.io/) | Contact form backend |

### Backend
| Technology | Purpose |
|------------|---------|
| [Python 3.13+](https://www.python.org/) | Runtime |
| [FastAPI](https://fastapi.tiangolo.com/) | Web framework |
| [LangChain](https://www.langchain.com/) | RAG orchestration |
| [OpenAI API](https://openai.com/) | GPT-4o-mini for response generation |
| [ChromaDB](https://www.trychroma.com/) | Vector database for semantic search |
| [SlowAPI](https://github.com/laurentS/slowapi) | Rate limiting |

