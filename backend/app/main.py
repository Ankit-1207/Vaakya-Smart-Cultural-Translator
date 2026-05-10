from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.database import engine, Base
from .api.endpoints import auth, translation, health

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

@app.get("/")
async def root():
    return {
        "message": "Vaakya Smart Cultural Translator API is running"
    }