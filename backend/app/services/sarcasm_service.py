import google.generativeai as genai
from ..core.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

async def detect_sarcasm(text: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return {
            "sarcasm_detected": False,
            "literal_meaning": "unknown",
            "intended_meaning": "unknown",
            "emotional_tone": "unknown",
            "confidence_score": 0.0
        }

    prompt = f"""
    Analyze the following sentence for sarcasm: "{text}"
    
    Determine if the literal meaning differs from the intended meaning.
    Return a JSON response with exactly these fields:
    1. "sarcasm_detected": boolean true or false
    2. "literal_meaning": A short phrase describing the literal meaning (e.g., "praise")
    3. "intended_meaning": A short phrase describing the actual intended meaning (e.g., "criticism")
    4. "emotional_tone": The underlying emotional tone (e.g., "frustrated", "annoyed", "neutral")
    5. "confidence_score": A float between 0.0 and 1.0 indicating your confidence in this assessment
    
    Ensure the output is valid JSON.
    """
    try:
        response = await model.generate_content_async(prompt)
        import json
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
        
        result = json.loads(response_text.strip())
        return {
            "sarcasm_detected": bool(result.get("sarcasm_detected", False)),
            "literal_meaning": result.get("literal_meaning", "unknown"),
            "intended_meaning": result.get("intended_meaning", "unknown"),
            "emotional_tone": result.get("emotional_tone", "unknown"),
            "confidence_score": float(result.get("confidence_score", 0.0))
        }
    except Exception as e:
        print(f"Sarcasm detection error: {e}")
        return {
            "sarcasm_detected": False,
            "literal_meaning": "error",
            "intended_meaning": "error",
            "emotional_tone": "error",
            "confidence_score": 0.0
        }
