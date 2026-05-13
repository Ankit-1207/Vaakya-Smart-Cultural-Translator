from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.database import get_db
from ...models.user import User
from ...models.history import TranslationHistory
from ...schemas.translation import VoiceTranslationRequest, VoiceTranslationResponse
from ..dependencies import get_current_user
from ...services.dataset_service import dataset_service
from ...services.gemini_service import translate_with_gemini
from ...services.s3_service import s3_service

router = APIRouter()

@router.post("/", response_model=VoiceTranslationResponse)
async def voice_translate(
    request: VoiceTranslationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Check if input is in idiom dataset
    idiom_match = dataset_service.find_idiom(request.text)
    
    response_data = {
        "translated_text": "",
        "tone": None,
        "cultural_meaning": None,
        "usage_context": None
    }

    original_text = request.text
    is_idiom = False
    meaning_for_db = None

    if idiom_match:
        actual_meaning = idiom_match["actual_meaning"]
        response_data["translated_text"] = await translate_with_gemini(actual_meaning, request.target_language)
        response_data["tone"] = idiom_match["tone"]
        response_data["cultural_meaning"] = actual_meaning
        response_data["usage_context"] = idiom_match["used_when"]
        is_idiom = True
        meaning_for_db = actual_meaning
    else:
        # 2. Call Gemini for normal text
        translated_text = await translate_with_gemini(request.text, request.target_language)
        response_data["translated_text"] = translated_text

    # 3. Save to database for history
    history_record = TranslationHistory(
        user_id=current_user.id,
        original_text=original_text,
        translated_text=response_data["translated_text"],
        tone=response_data["tone"],
        meaning=meaning_for_db,
        is_idiom=is_idiom
    )
    db.add(history_record)
    await db.commit()
    await db.refresh(history_record)

    # 4. Upload to S3 logs
    background_tasks.add_task(
        s3_service.upload_log,
        {
            "user_id": current_user.id,
            "original_text": original_text,
            "translated_text": response_data["translated_text"],
            "is_idiom": is_idiom,
            "timestamp": history_record.created_at.isoformat() if history_record.created_at else None
        }
    )

    return response_data
