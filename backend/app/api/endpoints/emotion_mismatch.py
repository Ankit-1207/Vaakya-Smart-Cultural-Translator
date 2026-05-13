from fastapi import APIRouter, Depends
from ...schemas.emotion import EmotionMismatchRequest, EmotionMismatchResponse
from ..dependencies import get_current_user
from ...models.user import User
from ...services.emotion_service import analyze_emotion_mismatch

router = APIRouter()

@router.post("/", response_model=EmotionMismatchResponse)
async def emotion_mismatch(
    request: EmotionMismatchRequest,
    current_user: User = Depends(get_current_user)
):
    analysis = await analyze_emotion_mismatch(request.text, request.voice_emotion)
    return EmotionMismatchResponse(**analysis)
