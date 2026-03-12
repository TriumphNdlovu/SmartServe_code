from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str
    policy_number: str 