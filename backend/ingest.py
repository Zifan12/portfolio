"""
Document Ingestion Script for RAG-Powered Portfolio Chatbot

This script loads documents from the data folder, splits them into chunks,
creates embeddings using OpenAI, and stores them in ChromaDB.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()

# Configs
DATA_DIRECTORY = Path(__file__).parent / "data"
CHROMA_DIRECTORY = Path(__file__).parent / "chroma_db"
COLLECTION_NAME = "portfolio_docs"

# Chunking settings
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


def load_documents():
    """Load all documents from the data directory"""
    print(f"Loading documents from {DATA_DIRECTORY}")

    all_documents = []

    # Load PDF files
    pdf_loader = DirectoryLoader(
        DATA_DIRECTORY,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
    )
    all_documents.extend(pdf_loader.load())

    # Load Markdown files 
    md_loader = DirectoryLoader(
        DATA_DIRECTORY,
        glob="**/*.md", 
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    all_documents.extend(md_loader.load())

    print(f"Loaded {len(all_documents)} documents")

    return all_documents
   

def split_documents(documents):
    """Split documents into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = text_splitter.split_documents(documents)
    print(f"\nSplit into {len(chunks)} chunks")
    return chunks

def create_vector_store(chunks):
    """Create embeddings and store in ChromaDB."""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=str(CHROMA_DIRECTORY),
    )


    print(f"Successfully stored {len(chunks)} document chunks in ChromaDB")
    return vector_store

def main():

    documents = load_documents();

    print(f"\nLoaded {len(documents)} document(s)")

    chunks = split_documents(documents)

    vector_store = create_vector_store(chunks)


if __name__ == "__main__":
    main()