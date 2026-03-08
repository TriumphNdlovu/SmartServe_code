import requests
from rag.retriever import retrieve_context

OLLAMA_URL = "http://localhost:11434/api/chat"

def ask_ai(question):

    print("ask_ai: {question}")
    context = retrieve_context(question)
    print(f"retrieved Context: {context}")

    prompt = f"""
    You are an assistant for a self-service insurance portal. Answer questions using only the information provided in the context below. 
    Do not guess or provide information that is not in the context. 
    If the answer is not available in the context, respond politely: "I’m sorry, I don’t have that information in your policy documents".

    User: User
    Question: {question}

    Context:
    {context}

    Answer:
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