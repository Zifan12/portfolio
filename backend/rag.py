"""
RAG (Retrieval-Augmented Generation) module for the portfolio chatbot.

This module provides:
- Vector database connection and retrieval
- Context-aware prompt building
- Query processing with relevant document chunks
"""

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

from ingest import CHROMA_DIRECTORY, COLLECTION_NAME

load_dotenv()

# Retrieval settings
DEFAULT_TOP_K = 4

class RAGRetriever: 
    """Handles document retrieval and prompt building for the portfolio chatbot."""

    def __init__(self):
        """Initialize the RAG retriever with the vector store."""
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.vector_store = None
        self._load_vector_store()
    
    def _load_vector_store(self):
        """Load existing vector store"""
        self.vector_store = Chroma(
            persist_directory=str(CHROMA_DIRECTORY),
            embedding_function=self.embeddings,
            collection_name=COLLECTION_NAME,
        )

    def retrieve_context(self, query, top_k = DEFAULT_TOP_K):
        """
        Retrieve relevant document chunks for a given query.

        Args: 
            query: The user's question
            top_k: Number of top relevant chunks to retrieve
        
        Returns: 
            List of dictionaries containing chunk content and metadata
        """

        results = self.vector_store.similarity_search_with_score(query, k=top_k)

        context_chunks = []
        for doc, score in results:
            context_chunks.append({
                "content": doc.page_content,
                "score": score,
                "source": doc.metadata.get("source", "Unknown"),
                "metadata": doc.metadata,
            })

        return context_chunks

    def format_context(self, chunks): 
        """Format retrieved chunks into a context string for the LLM"""
        context_parts = []
        for i, chunk in enumerate(chunks, 1): 
            source_info = chunk["source"]
            context_parts.append(
                f"[Source {i}: {source_info}] \n{chunk['content']}"

            )   
        return "\n\n".join(context_parts)


    def build_rag_prompt(self, query, context):
        """
        Build a complete prompt with context for the LLM.

        Args: 
            query: The user's question
            context: Formatted context from retrieved documents

        Returns:
            Complete prompt string for the LLM
        """
        
        system_prompt = f"""You are a helpful AI assistant for Zifan's portfolio website.
        Your role is to answer questions about Zifan's background, skills, projects, education, professional experience,
        hobbies, based on the provided context. 

        If the context doesn't contain relevant information, say so honestly.

       Answer in a SHORT, CONCISE way:
       - Max 5 bullet points
       - Each bullet max 1 line
       - No paragraphs

       However, if topics include more than 5 bullet points, you can ask the user if they want to know more.


        Context from Zifan's documents:
        {context}
        """
        
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ]