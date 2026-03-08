import faiss
import numpy as np

dimension = 384
index = faiss.IndexFlatL2(dimension)

documents = []

def add_document(text, embedding):
    global documents

    documents.append(text)
    index.add(np.array([embedding]).astype("float32"))

def search(query_embedding, k=3):
    distances, indices = index.search(
        np.array([query_embedding]).astype("float32"), k
    )

    results = []
    for i in indices[0]:
        results.append(documents[i])

    return results