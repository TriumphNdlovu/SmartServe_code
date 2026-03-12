import requests
from rag.retriever import retrieve_context
from services.policy_service import get_policy

OLLAMA_URL = "http://localhost:11434/api/chat"

def ask_ai(question, policy_number):

    print(f"ask_ai: {question}")

    # Get relevant context from your vector DB
    context = retrieve_context(question)
    context_text = context if context else "No context available."

    # Get policy JSON for the user
    policy_json = get_policy(policy_number)

    print(f"retrieved Context: {context_text}")

    prompt = f"""
            You are an assistant for a self-service insurance portal. Answer questions using ONLY the information provided in the context below. 
            Do not guess or provide information that is not in the context. 
            If the answer cannot be retrieved from the context or policy details, respond politely: "I'm sorry, I don't have that information in your policy documents".

            User: Policy holder
            
            Question: {question}

            Context and Policy details:
            Context: {context_text}
            Policy: {policy_json}

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

    if response.status_code != 200:
        return f"Error contacting AI SmartServe: {response.text}"

    return response.json()["message"]["content"]