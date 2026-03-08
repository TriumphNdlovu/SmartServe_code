# rag/vector_store.py
import faiss
import numpy as np
import pickle
import os

dimension = 384
index_file = "rag/index.faiss"
docs_file = "rag/documents.pkl"

# Initialize
index = faiss.IndexFlatL2(dimension)
documents = []

# ------------------------
# Add a new document
# ------------------------
def add_document(text, embedding):
    global documents
    documents.append(text)
    index.add(np.array([embedding]).astype("float32"))
    # Save immediately
    save_index()

# ------------------------
# Search
# ------------------------
def search(query_embedding, k=5):
    if len(documents) == 0:
        return []

    if query_embedding.ndim == 1:
        query_embedding = np.expand_dims(query_embedding, axis=0)

    k = min(k, len(documents))
    D, I = index.search(query_embedding, k)
    return [documents[i] for i in I[0] if i < len(documents)]

# ------------------------
# Save index & documents to disk
# ------------------------
def save_index():
    faiss.write_index(index, index_file)
    with open(docs_file, "wb") as f:
        pickle.dump(documents, f)

# ------------------------
# Load index & documents from disk
# ------------------------
def load_index():
    global index, documents
    if os.path.exists(index_file) and os.path.exists(docs_file):
        index = faiss.read_index(index_file)
        with open(docs_file, "rb") as f:
            documents = pickle.load(f)
        print("Loaded existing vector DB from disk.")
    else:
        print("No existing vector DB found. Starting fresh.")