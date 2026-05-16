import google.generativeai as genai
import json
import re
from app.core.config import settings

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")


async def analyze_slang(text: str, target_language: str = "en"):

    prompt = f"""
    Analyze the following sentence for slang, Gen-Z language, 
    or internet expressions. 
    The user is translating this text to {target_language}.

    Sentence:
    "{text}"

    If the sentence is in a language other than English, analyze it in its native context.
    Return ONLY valid JSON.

    Example:
    {{
        "slang_detected": true,
        "actual_meaning": "the person is in trouble or finished (equivalent to 'kaam tamaam' in Hindi)",
        "literal_meaning": "food preparation",
        "tone": "informal",
        "confidence_score": 0.95
    }}

    IMPORTANT:
    - Return ONLY JSON
    - No markdown
    - If there is a culturally equivalent expression in {target_language}, include it in the 'actual_meaning'.
    - If the input text is already in {target_language}, explain the slang in plain terms of that language.
    """

    # Check API key
    if not settings.GEMINI_API_KEY:
        return {
            "slang_detected": False,
            "actual_meaning": "Gemini API key not configured",
            "literal_meaning": None,
            "tone": "unknown",
            "confidence_score": 0.0
        }

    try:

        response = await model.generate_content_async(prompt)

        cleaned = response.text.strip()

        # Extract JSON safely
        json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)

        if json_match:
            cleaned = json_match.group(0)
        else:
            raise ValueError("No valid JSON found")

        data = json.loads(cleaned)

        return {
            "slang_detected": bool(data.get("slang_detected", False)),
            "actual_meaning": data.get(
                "actual_meaning",
                "No slang meaning detected"
            ),
            "literal_meaning": data.get("literal_meaning"),
            "tone": data.get("tone", "neutral"),
            "confidence_score": float(
                data.get("confidence_score", 0.0)
            )
        }

    except Exception as e:

        print(f"Slang analysis error: {e}")

        return {
            "slang_detected": False,
            "actual_meaning": f"Analysis unavailable: {str(e)}",
            "literal_meaning": None,
            "tone": "unknown",
            "confidence_score": 0.0
        }