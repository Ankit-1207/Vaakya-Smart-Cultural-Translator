from pydantic import BaseModel

class DetectSarcasmRequest(BaseModel):
    text: str

class DetectSarcasmResponse(BaseModel):
    sarcasm_detected: bool
    literal_meaning: str
    intended_meaning: str
    emotional_tone: str
    confidence_score: float
