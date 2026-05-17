import os
import warnings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama

# Suppress basic warnings
warnings.filterwarnings("ignore")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

print("--- Starting RAG Session (Type 'exit' to quit) ---")

# 1. Load the "Eyes" once
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2", 
    model_kwargs={'device': 'cuda'}
)

# 2. Connect to Database once
vector_db = Chroma(persist_directory="chroma_db", embedding_function=embeddings)

# 3. Setup the "Brain" once (Llama 3.1)
llm = ChatOllama(model="llama3.1", temperature=0)

while True:
    query = input("\nAsk a question about the resume: ")
    
    if query.lower() in ['exit', 'quit', 'q']:
        print("Closing session.")
        break

    if not query.strip():
        continue

    # Change k=3 to k=6 to give the LLM more of the resume to read
    docs = vector_db.similarity_search(query, k=6)
    context = "\n\n---\n\n".join([d.page_content for d in docs])
    
    # Restructured prompt to guide professional, conversational answers
    prompt = [
        ("system", (
            "You are an expert technical recruiter analyzing a candidate's resume.\n"
            "Answer the question thoroughly and professionally using ONLY the provided resume context.\n"
            "Do not invent or assume any details. If the context does not contain the answer, "
            "simply state 'Information not present in resume.'"
        )),
        ("human", f"Resume Context:\n{context}\n\nQuestion: {query}\nProfessional Answer:")
    ]

    response = llm.invoke(prompt)

    print("\n--- AI ANALYSIS ---")
    print(response.content.strip())
    
    print("\n--- SOURCES ---")
    # Using a set to keep the source output clean if it pulls from the same page multiple times
    seen_sources = set()
    for doc in docs:
        src = doc.metadata.get('source', 'Unknown')
        pg = doc.metadata.get('page', 0)
        source_str = f"- {src} (Page {pg})"
        if source_str not in seen_sources:
            print(source_str)
            seen_sources.add(source_str)