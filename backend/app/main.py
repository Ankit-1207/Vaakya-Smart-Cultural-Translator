from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.database import engine, Base
from .api.endpoints import auth, translation, health, voice_translation, emotion, emotion_mismatch, sarcasm

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(
    health.router,
    prefix="/api/health",
    tags=["health"]
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"]
)

app.include_router(
    translation.router,
    prefix="/api/translate",
    tags=["translate"]
)

app.include_router(
    voice_translation.router,
    prefix="/api/voice-translate",
    tags=["voice-translate"]
)

app.include_router(
    emotion.router,
    prefix="/api/detect-tone",
    tags=["emotion"]
)

app.include_router(
    emotion_mismatch.router,
    prefix="/api/emotion-mismatch",
    tags=["emotion-mismatch"]
)

app.include_router(
    sarcasm.router,
    prefix="/api/detect-sarcasm",
    tags=["sarcasm"]
)

@app.get("/")
async def root():
    return {
        "message": "Vaakya Smart Cultural Translator API is running"
    }