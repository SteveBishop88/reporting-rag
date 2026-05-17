import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Setup Paths
PDF_PATH = "data/resume_sanitized.pdf"
DB_DIR = "chroma_db"

if not os.path.exists(PDF_PATH):
    print(f"Error: Could not find {PDF_PATH}. Check your data folder!")
else:
    # 2. Load and Split
    print("Loading PDF...")
    loader = PyPDFLoader(PDF_PATH)
    data = loader.load()
    
    # Using larger chunks and strict paragraph/bullet separators 
    # to protect cohesive professional history contexts
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, 
        chunk_overlap=200,
        separators=["\n\n", "\n", "•", " ", ""]
    )
    chunks = text_splitter.split_documents(data)
    print(f"Split document into {len(chunks)} chunks.")

    # 3. Create Embeddings using the GPU
    print("Initializing embeddings on GPU...")
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2", 
        model_kwargs={'device': 'cuda'}
    )

    # 4. Create and Persist the Vector Database
    print("Creating vector database...")
    vector_db = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=DB_DIR
    )
    
    print(f"Success! Vector database created in the '{DB_DIR}' folder.")