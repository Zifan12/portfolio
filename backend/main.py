"""
FastAPI Backend for RAG-Powered Portfolio Chatbot

This server provides an API endpoint for the chatbot to:
- Accept user queries
- Retrieve relevant context from the vector store
- Generate responses using OpenAI's API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

from rag import RAGRetriever

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
client = OpenAI()
retriever = RAGRetriever()


class ChatRequest(BaseModel):
    message: str



@app.post("/chat") 
async def chat(request: ChatRequest):
    # Use retriever for RAG
    chunks = retriever.retrieve_context(request.message)
    context = retriever.format_context(chunks)
    messages = retriever.build_rag_prompt(request.message, context)

    # Generate response
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
    )

    return {"response": response.choices[0].message.content}

