from rag.embedder import embed_text
from rag.vector_store import search

def retrieve_context(query):
    query_embedding = embed_text(query)

    print(f"query embedding: {query_embedding}")

    docs = search(query_embedding)

    print(f"docs: {docs}")

    return "\n".join(docs)