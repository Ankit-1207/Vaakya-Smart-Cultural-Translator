from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    target_language: str = "en"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    tone: Optional[str] = None
    meaning: Optional[str] = None
    used_when: Optional[str] = None
    formality: Optional[str] = None
    is_idiom: bool = False

class TranslationHistoryResponse(BaseModel):
    id: int
    original_text: str
    translated_text: str
    tone: Optional[str] = None
    meaning: Optional[str] = None
    is_idiom: bool
    created_at: datetime

    class Config:
        from_attributes = True

class VoiceTranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate from voice input")
    target_language: str = "en"

class VoiceTranslationResponse(BaseModel):
    translated_text: str
    tone: Optional[str] = None
    cultural_meaning: Optional[str] = None
    usage_context: Optional[str] = None
