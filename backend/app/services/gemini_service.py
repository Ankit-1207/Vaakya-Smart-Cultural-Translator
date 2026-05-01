import google.generativeai as genai
from ..core.config import settings

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
model = genai.GenerativeModel('gemini-2.5-flash')

async def translate_with_gemini(text: str, target_language: str = "en") -> str:
    if not settings.GEMINI_API_KEY:
        return f"[MOCK] Translated '{text}' to {target_language}. Configure GEMINI_API_KEY to use real API."
        
    prompt = f"Translate the following text into {target_language}. Provide only the translated text without extra explanation:\n\n{text}"
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API error: {e}")
        return f"Translation failed due to an API error."
