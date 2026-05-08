import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.database import engine, Base
from .api.endpoints import auth, translation, health

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:3000",
    "https://vaakya-smart-cultural-translator.vercel.app"
]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Note: In production, use Alembic for migrations instead of create_all
        await conn.run_sync(Base.metadata.create_all)

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(translation.router, prefix="/api/translate", tags=["translate"])
