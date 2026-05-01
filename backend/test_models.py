import google.generativeai as genai
import os
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

models_to_test = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest'
]

for m in models_to_test:
    print(f"Testing {m}...")
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("Translate 'break a leg' to Spanish")
        print(f"Success with {m}: {response.text}")
        break
    except Exception as e:
        print(f"Error with {m}: {e}")
