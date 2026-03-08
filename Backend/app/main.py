# app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from rag.vector_store import load_index, search
from rag.schemas import QuestionRequest
from services.ai_service import ask_ai  # or wherever your ask_ai is

# ------------------------
# Load the vector DB at startup
# ------------------------
load_index()  # loads FAISS index and documents from disk if they exist

app = FastAPI()

# ------------------------
# Request model
# ------------------------
class QuestionRequest(BaseModel):
    question: str

# ------------------------
# API endpoint
# ------------------------
@app.post("/ask-ai")
def ask_ai_endpoint(request: QuestionRequest):
    """
    Receives a question, retrieves context from the vector DB,
    and returns an AI-generated answer.
    """
    # ask_ai will internally call retrieve_context -> search()
    print("ask_ai_endpoint")
    answer = ask_ai(request.question)
    return {"answer": answer}

# ------------------------
# Optional health check
# ------------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}