from pydantic import BaseModel
from typing import List


class HistoryMessage(BaseModel):
    role: str     
    content: str


class QuestionRequest(BaseModel):
    question: str
    policy_number: str
    history: List[HistoryMessage] = [] 