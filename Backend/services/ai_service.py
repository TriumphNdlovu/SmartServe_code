import os
import re
import requests
from typing import List
from dotenv import load_dotenv
from rag.retriever import retrieve_context
from services.policy_service import get_policy

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"


def clean_response(text: str) -> str:
    """Strip <think>...</think> reasoning blocks if present."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return text.strip()


def ask_ai(question: str, policy_number: str, history: List[dict] = []) -> str:
    print(f"ask_ai | model={GROQ_MODEL} | policy={policy_number} | turns={len(history)}")

    if not GROQ_API_KEY:
        return "AI service is not configured. Please set GROQ_API_KEY in your .env file."

    context_text = retrieve_context(question) or "No relevant documents found."
    policy_json  = get_policy(policy_number)

    print(f"retrieved context: {context_text}")

   
    system_prompt = (
        "You are a helpful assistant for a life insurance self-service portal. "
        "You are speaking directly with the policyholder. "
        "Answer clearly and concisely using only the information provided below. "
        "If you cannot find the answer, say: "
        "\"I'm sorry, I don't have that information in your policy documents.\"\n\n"
        f"POLICY DATA:\n{policy_json}\n\n"
        f"SUPPORTING DOCUMENTS:\n{context_text}"
    )

   
    messages = [{"role": "system", "content": system_prompt}]

    # Append conversation history (previous turns)
    for turn in history:
        messages.append({"role": turn["role"], "content": turn["content"]})

    # Append the current question as the latest user message
    messages.append({"role": "user", "content": question})

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens":  400,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }

    response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)

    if response.status_code != 200:
        return f"Error contacting AI service: {response.text}"

    raw    = response.json()["choices"][0]["message"]["content"]
    answer = clean_response(raw)

    print(f"answer: {answer}")
    return answer