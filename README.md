# Local Reporting RAG Pipeline

A localized, high-performance Retrieval-Augmented Generation (RAG) pipeline designed to ingest and query unstructured documents (such as PDF reports or resumes) completely on a local GPU. 

This architecture leverages **LangChain** and **LangGraph** for orchestration, **ChromaDB** for local vector storage, and **Ollama (Llama 3.1)** as the local LLM brain, ensuring total data privacy with zero external API dependencies.

## 🛠️ Tech Stack & Architecture

* **Orchestration:** LangChain & LangGraph
* **Vector Store:** ChromaDB (Stored locally)
* **Embeddings:** HuggingFace `all-MiniLM-L6-v2` running locally via CUDA GPU acceleration
* **LLM:** Ollama (`llama3.1`)
* **Data Ingestion:** PyPDFLoader

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Ollama](https://ollama.com/) installed and running locally with the Llama 3.1 model pulled:
```bash
ollama run llama3.1