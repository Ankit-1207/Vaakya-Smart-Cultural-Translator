import asyncio
from app.services.slang_service import analyze_slang

async def test():
    print("Testing English slang with Hindi target...")
    result_en_hi = await analyze_slang("no cap", "Hindi")
    print(f"Detected: {result_en_hi.get('slang_detected')}")
    print(f"Meaning: {result_en_hi.get('actual_meaning')}")

    print("\nTesting Hindi slang with English target...")
    result_hi_en = await analyze_slang("vibe hai", "English")
    print(f"Detected: {result_hi_en.get('slang_detected')}")
    print(f"Meaning: {result_hi_en.get('actual_meaning')}")

if __name__ == "__main__":
    asyncio.run(test())
