import os
import google.generativeai as genai
from ..core.config import settings

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

# Initialize HuggingFace pipeline lazily to save startup time
audio_classifier = None

def get_audio_classifier():
    global audio_classifier
    if audio_classifier is None:
        from transformers import pipeline
        # Using a lightweight audio emotion classification model
        audio_classifier = pipeline("audio-classification", model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")
    return audio_classifier

async def detect_emotion_from_audio(audio_path: str) -> dict:
    try:
        classifier = get_audio_classifier()
        results = classifier(audio_path)
        if results and len(results) > 0:
            best_match = max(results, key=lambda x: x['score'])
            return {
                "emotion": best_match["label"].lower(),
                "confidence": float(best_match["score"])
            }
        return {"emotion": "neutral", "confidence": 0.0}
    except Exception as e:
        print(f"Emotion detection error: {e}")
        return {"emotion": "unknown", "confidence": 0.0}

async def analyze_emotion_mismatch(transcribed_text: str, detected_emotion: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return {
            "sentence_context": "unknown",
            "voice_emotion": detected_emotion,
            "mismatch_detected": False,
            "warning_message": None,
            "suggested_tone": None
        }

    prompt = f"""
    Analyze the emotional context of this sentence: "{transcribed_text}"
    The user's actual voice tone was detected as: {detected_emotion}.
    
    Classify the sentence emotion as one of: sad, serious, happy, angry, emotional, neutral.
    Compare this with the detected voice emotion.
    
    Return a JSON response with exactly these fields:
    1. "sentence_context": The classified emotion of the text.
    2. "voice_emotion": "{detected_emotion}"
    3. "mismatch_detected": boolean true or false. True if the spoken emotion heavily contradicts the text's natural emotion (e.g., laughing while saying something sad).
    4. "warning_message": A brief warning if there is a mismatch (e.g., "Detected tone does not match emotional meaning of sentence."), or null if it's a match.
    5. "suggested_tone": A suggested appropriate tone (e.g., "sympathetic", "excited"), or null if no mismatch.
    
    Ensure the output is valid JSON.
    """
    try:
        response = await model.generate_content_async(prompt)
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        
        result = json.loads(text.strip())
        return {
            "sentence_context": result.get("sentence_context", "unknown"),
            "voice_emotion": detected_emotion,
            "mismatch_detected": bool(result.get("mismatch_detected", False)),
            "warning_message": result.get("warning_message"),
            "suggested_tone": result.get("suggested_tone")
        }
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "sentence_context": "unknown",
            "voice_emotion": detected_emotion,
            "mismatch_detected": False,
            "warning_message": None,
            "suggested_tone": None
        }
