from pydantic import BaseModel
from typing import Optional

class DetectToneResponse(BaseModel):
    detected_emotion: str
    confidence_score: float
    sentence_context: Optional[str] = None
    emotional_match_status: Optional[str] = None
    warning_message: Optional[str] = None

class EmotionMismatchRequest(BaseModel):
    text: str
    voice_emotion: str

class EmotionMismatchResponse(BaseModel):
    sentence_context: str
    voice_emotion: str
    mismatch_detected: bool
    warning_message: Optional[str] = None
    suggested_tone: Optional[str] = None
