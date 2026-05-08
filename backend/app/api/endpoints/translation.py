from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ...db.database import get_db
from ...models.user import User
from ...models.history import TranslationHistory
from ...schemas.translation import TranslationRequest, TranslationResponse, TranslationHistoryResponse
from ..dependencies import get_current_user
from ...services.dataset_service import dataset_service
from ...services.gemini_service import translate_with_gemini
from ...services.s3_service import s3_service

router = APIRouter()

@router.post("/", response_model=TranslationResponse)
async def translate(
    request: TranslationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Check if input is in idiom dataset
    idiom_match = dataset_service.find_idiom(request.text)
    
    response_data = {
        "original_text": request.text,
        "translated_text": "",
        "tone": None,
        "meaning": None,
        "used_when": None,
        "formality": None,
        "is_idiom": False
    }

    if idiom_match:
        actual_meaning = idiom_match["actual_meaning"]
        response_data["translated_text"] = await translate_with_gemini(actual_meaning, request.target_language)
        response_data["tone"] = idiom_match["tone"]
        response_data["meaning"] = actual_meaning
        response_data["used_when"] = idiom_match["used_when"]
        response_data["formality"] = idiom_match["formality"]
        response_data["is_idiom"] = True
    else:
        # 2. Call Gemini
        translated_text = await translate_with_gemini(request.text, request.target_language)
        response_data["translated_text"] = translated_text

    # 3. Save to database
    history_record = TranslationHistory(
        user_id=current_user.id,
        original_text=response_data["original_text"],
        translated_text=response_data["translated_text"],
        tone=response_data["tone"],
        meaning=response_data["meaning"],
        is_idiom=response_data["is_idiom"]
    )
    db.add(history_record)
    await db.commit()
    await db.refresh(history_record)

    # 4. Upload to S3 logs
    background_tasks.add_task(
        s3_service.upload_log,
        {
            "user_id": current_user.id,
            "original_text": response_data["original_text"],
            "translated_text": response_data["translated_text"],
            "is_idiom": response_data["is_idiom"],
            "timestamp": history_record.created_at.isoformat() if history_record.created_at else None
        }
    )

    return response_data

@router.get("/history", response_model=List[TranslationHistoryResponse])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TranslationHistory)
        .where(TranslationHistory.user_id == current_user.id)
        .order_by(TranslationHistory.created_at.desc())
    )
    return result.scalars().all()
