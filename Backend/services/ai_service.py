import requests
from rag.retriever import retrieve_context

OLLAMA_URL = "http://localhost:11434/api/chat"

def ask_ai(question):

    print("ask_ai: {question}")
    context = retrieve_context(question)
    print(f"retrieved Context: {context}")

    prompt = f"""
    Context:
    {context}

    Question:
    {question}

    Answer using the provided context and if the information is not in context just say you do not know.
    """

    payload = {
        "model": "gemma3:4b",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)

    return response.json()["message"]["content"]