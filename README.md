# Zifan's Portfolio Website

A personal portfolio website featuring an AI-powered chatbot built with Retrieval-Augmented Generation (RAG).

## Features

- **Interactive Portfolio**: Showcases education, skills, projects, and certificates
- **AI Chatbot**: RAG-powered assistant that answers questions about my background
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Particle effects, animations, and glassmorphism design

## Project Structure

```
Portfolio Website/
├── css/                    # Stylesheets
│   ├── style.css          # Main styles
│   └── chatbot.css        # Chatbot component styles
├── js/                     # JavaScript files
│   └── chatbot.js         # Chatbot frontend logic
├── images/                 # Image assets
│   ├── backgrounds/       # Background images
│   ├── certificates/      # Certificate images
│   ├── education/         # Education logos
│   ├── icons/             # Skill & tech icons
│   ├── profile/           # Profile photos
│   ├── projects/          # Project screenshots
│   └── robot/             # Chatbot avatar
├── documents/              # PDF documents (certificates)
├── favicon/                # Favicon files
├── backend/                # Python RAG backend
│   ├── main.py            # FastAPI server
│   ├── rag.py             # RAG retrieval logic
│   ├── ingest.py          # Document ingestion
│   ├── data/              # Source documents for RAG
│   └── requirements.txt   # Python dependencies
├── index.html              # Main HTML file
├── particles.json          # Particle.js configuration
└── .gitignore             # Git ignore rules
```

## Getting Started

### Frontend

Simply open `index.html` in a browser or serve with any static file server.

### Backend (RAG Chatbot)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   

   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Create a .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

5. Add documents to `backend/data/` and run ingestion:
   ```bash
   python ingest.py
   ```

6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```


### Frontend
- HTML / CSS / JavaScript
- Particle.js (background effects)
- Swiper.js (project carousel)
- AOS (scroll animations)
- Typed.js (typewriter effect)
- PDF.js (certificate rendering)

### Backend
- Python 
- FastAPI
- LangChain
- OpenAI API
- ChromaDB (vector database)

