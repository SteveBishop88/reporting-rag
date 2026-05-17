from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# 1. Setup the same embedding engine (must match the ingestion)
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2", 
    model_kwargs={'device': 'cuda'}
)

# 2. Connect to your local database
vector_db = Chroma(persist_directory="chroma_db", embedding_function=embeddings)

# 3. Define your question 
# (Tip: Ask something that is definitely in your PDF!)
query = "How has Steve demonstrated a commitment to staying current with modern AI and web technologies?" 

print(f"\n--- QUERYING PDF: {query} ---")

# 4. Perform the semantic search
# k=3 tells it to find the 3 most relevant snippets
docs = vector_db.similarity_search(query, k=3)

# 5. Display the results
print("\n--- TOP MATCHES FOUND ---")
for i, doc in enumerate(docs):
    print(f"\n[Result {i+1}] (Page {doc.metadata.get('page', 'N/A')}):")
    print(f"{doc.page_content[:500]}...") # Printing first 500 chars of the snippet
    print("-" * 30)