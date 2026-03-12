import re
import requests
from rag.retriever import retrieve_context
from services.policy_service import get_policy

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL      = "gemma3:4b"


def clean_response(text: str) -> str:
    """Strip <think>...</think> blocks if present."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return text.strip()


def ask_ai(question: str, policy_number: str) -> str:
    print(f"ask_ai | model={MODEL} | policy={policy_number} | question={question}")

    context_text = retrieve_context(question) or "No relevant documents found."
    policy_json  = get_policy(policy_number)

    print(f"retrieved context: {context_text}")

    system_prompt = (
        "You are a helpful assistant for a life insurance self-service portal. "
        "You are speaking directly with the policyholder. "
        "Answer clearly and concisely using only the information provided. "
        "If you cannot find the answer, say: "
        "\"I'm sorry, I don't have that information in your policy documents, Please call customer care on 082 779 3863\""
    )

    user_prompt = f"""Here is the policyholder's information:

        POLICY DATA:
        {policy_json}

        SUPPORTING DOCUMENTS:
        {context_text}

        QUESTION: {question}

        Answer the question using only the information above. Be direct and concise."""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 300, 
        }
    }

    response = requests.post(OLLAMA_URL, json=payload, timeout=120)

    if response.status_code != 200:
        return f"Error contacting AI SmartServe: {response.text}"

    raw    = response.json()["message"]["content"]
    answer = clean_response(raw)

    print(f"answer: {answer}")
    return answer
