from pydantic import BaseModel
from typing import Optional

class SlangAnalysisRequest(BaseModel):
    text: str
    target_language: Optional[str] = "en"

class SlangAnalysisResponse(BaseModel):
    slang_detected: bool
    actual_meaning: str
    literal_meaning: Optional[str] = None
    tone: str
    confidence_score: float
