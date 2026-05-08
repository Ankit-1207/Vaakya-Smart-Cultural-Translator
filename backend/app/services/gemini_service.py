import asyncio
from deep_translator import GoogleTranslator
import google.generativeai as genai
from ..core.config import settings

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
model = genai.GenerativeModel('gemini-2.5-flash')

LANGUAGE_ALIASES = {
    "en": ("en", "English"),
    "english": ("en", "English"),
    "es": ("es", "Spanish"),
    "spanish": ("es", "Spanish"),
    "fr": ("fr", "French"),
    "french": ("fr", "French"),
    "hi": ("hi", "Hindi"),
    "hindi": ("hi", "Hindi"),
    "kn": ("kn", "Kannada"),
    "kannada": ("kn", "Kannada"),
    "te": ("te", "Telugu"),
    "telugu": ("te", "Telugu"),
    "de": ("de", "German"),
    "german": ("de", "German"),
    "ja": ("ja", "Japanese"),
    "japanese": ("ja", "Japanese"),
}

def normalize_language(target_language: str) -> tuple[str, str]:
    language = target_language.strip().lower()
    return LANGUAGE_ALIASES.get(language, (language, target_language))

async def translate_with_gemini(text: str, target_language: str = "en") -> str:
    language_code, language_name = normalize_language(target_language)

    if not settings.GEMINI_API_KEY:
        try:
            return await asyncio.to_thread(GoogleTranslator(source='auto', target=language_code).translate, text)
        except Exception as e:
            print(f"Translator error: {e}")
            return f"[MOCK] Translated '{text}' to {language_name}. Configure GEMINI_API_KEY to use real API."
        
    prompt = f"Translate the following text into {language_name}. Provide only the translated text without extra explanation:\n\n{text}"
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API error: {e}")
        try:
            return await asyncio.to_thread(GoogleTranslator(source='auto', target=language_code).translate, text)
        except Exception as fallback_e:
            print(f"Fallback translation error: {fallback_e}")
            return f"Translation failed due to an API error."
