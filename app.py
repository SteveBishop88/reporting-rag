import os
import warnings
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# LangChain / Chroma / Ollama Core Imports
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama

# Suppress basic warnings
warnings.filterwarnings("ignore")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# --- 1. Initialize FastAPI Server ---
app = FastAPI(
    title="Local Reporting RAG API",
    description="Backend API server for localized resume and document intelligence"
)

# --- 2. Enable CORS Middleware ---
# This permits your upcoming React front-end to safely request data from this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to specific local host domains for strict security later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Warm up the RAG Engines Once on Server Boot ---
print("\n[STARTUP] Initializing CUDA Embeddings Model ('all-MiniLM-L6-v2')...")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2", 
    model_kwargs={'device': 'cuda'}
)

print("[STARTUP] Connecting to local Chroma Vector Database...")
vector_db = Chroma(persist_directory="chroma_db", embedding_function=embeddings)

print("[STARTUP] Warming up local Ollama Engine ('llama3.1')...")
llm = ChatOllama(model="llama3.1", temperature=0)
print("[STARTUP] Local RAG Engines fully loaded and standing by.\n")


# --- 4. Define Data Transfer Schemas (Pydantic) ---
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]


# --- 5. Endpoints ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "hardware": "CUDA-accelerated"}

@app.post("/api/query", response_model=QueryResponse)
async def query_rag(payload: QueryRequest):
    try:
        query = payload.question
        
        if not query.strip():
            raise HTTPException(status_code=400, detail="Question payload cannot be empty.")

        # Execute semantic similarity search against local storage
        docs = vector_db.similarity_search(query, k=6)
        context = "\n\n---\n\n".join([d.page_content for d in docs])
        
        # Build the structured, recruiter-optimized prompt
        prompt = [
            ("system", (
                "You are an expert technical recruiter analyzing a candidate's resume.\n"
                "Answer the question thoroughly and professionally using ONLY the provided resume context.\n"
                "Do not invent or assume any details. If the context does not contain the answer, "
                "simply state 'Information not present in resume.'"
            )),
            ("human", f"Resume Context:\n{context}\n\nQuestion: {query}\nProfessional Answer:")
        ]

        # Trigger local GPU model inference
        response = llm.invoke(prompt)
        ai_answer = response.content.strip()
        
        # Format source metadata cleanly for front-end consumption
        seen_sources = set()
        sources_list = []
        for doc in docs:
            src = doc.metadata.get('source', 'Unknown')
            pg = doc.metadata.get('page', 0)
            source_str = f"{src} (Page {pg})"
            if source_str not in seen_sources:
                sources_list.append(source_str)
                seen_sources.add(source_str)
        
        return QueryResponse(answer=ai_answer, sources=sources_list)
        
    except Exception as e:
        print(f"[ERROR] Exception caught during inference pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error running local inference pipeline.")