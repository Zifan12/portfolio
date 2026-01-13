"""
FastAPI Backend for RAG-Powered Portfolio Chatbot

This server provides an API endpoint for the chatbot to:
- Accept user queries
- Retrieve relevant context from the vector store
- Generate responses using OpenAI's API
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from openai import OpenAI
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from rag import RAGRetriever

load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


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

    @field_validator('message')
    @classmethod
    def validate_message_lengths(cls, value):
        if len(value) > 500: 
            raise ValueError('Message too long. Please keep it under 500 characters')
        if len(value.strip()) == 0:
            raise ValueError('Message cannot be empty')
        return value.strip()





@app.post("/chat") 
@limiter.limit("10/minute")
async def chat(request: Request, chat_request: ChatRequest):
    # Use retriever for RAG
    chunks = retriever.retrieve_context(chat_request.message)
    context = retriever.format_context(chunks)
    messages = retriever.build_rag_prompt(chat_request.message, context)

    # Generate response
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=300,  
    )

    return {"response": response.choices[0].message.content}

