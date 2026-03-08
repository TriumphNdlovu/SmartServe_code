from rag.embedder import embed_text
from rag.vector_store import search

def retrieve_context(query):
    query_embedding = embed_text(query)

    docs = search(query_embedding)

    return "\n".join(docs)