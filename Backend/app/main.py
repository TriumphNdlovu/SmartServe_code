# app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from rag.vector_store import load_index, search
from rag.schemas import QuestionRequest
from services.ai_service import ask_ai  # or wherever your ask_ai is
from fastapi.middleware.cors import CORSMiddleware

load_index()  # loads FAISS index and documents from disk if they exist

app = FastAPI()

app.add_middleware( # I will make the cors more strict later guys relax
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

@app.post("/ask-ai")
def ask_ai_endpoint(request: QuestionRequest):
    """
    Receives a question, retrieves context from the vector DB,
    and returns an AI-generated answer.
    """
    
    print("ask_ai_endpoint")
    answer = ask_ai(request.question)
    return {"answer": answer}

@app.get("/health")
def health_check():
    return {"status": "200 Ok"}