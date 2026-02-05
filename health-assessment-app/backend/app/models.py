from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class QuestionOption(BaseModel):
    value: str
    label: str
    score: int

class Question(BaseModel):
    id: int
    question: str
    options: List[QuestionOption]

class Answer(BaseModel):
    value: str
    label: str
    score: int

class AssessmentRequest(BaseModel):
    answers: Dict[int, Answer]

class Recommendation(BaseModel):
    title: str
    description: str

class AssessmentResult(BaseModel):
    id: Optional[int] = None
    health_score: float
    risk_level: str
    category_scores: Dict[str, float]
    recommendations: List[Recommendation]
    created_at: Optional[datetime] = None

class AssessmentHistory(BaseModel):
    id: int
    health_score: float
    risk_level: str
    created_at: datetime
