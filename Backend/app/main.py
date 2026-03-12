import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from rag.vector_store import load_index
from rag.schemas import QuestionRequest
from services.ai_service import ask_ai
from services.policy_service import get_policy

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5500")

load_index()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.post("/ask-ai")
def ask_ai_endpoint(request: QuestionRequest):
    print(f"ask_ai_endpoint | policy={request.policy_number} | history={len(request.history)} turns")
    answer = ask_ai(request.question, request.policy_number, [h.dict() for h in request.history])
    return {"answer": answer}


@app.get("/policy/{contract_reference}")
def get_policy_endpoint(contract_reference: str):
    policy = get_policy(contract_reference)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@app.get("/health")
def health_check():
    return {"status": "200 Ok"}