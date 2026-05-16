import asyncio
import os
from dotenv import load_dotenv
from app.services.slang_service import analyze_slang

async def test():
    print("Testing slang analysis...")
    result = await analyze_slang("that's fire")
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
