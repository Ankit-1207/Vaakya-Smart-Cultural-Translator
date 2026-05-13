from fastapi import APIRouter, Depends
from ...schemas.sarcasm import DetectSarcasmRequest, DetectSarcasmResponse
from ..dependencies import get_current_user
from ...models.user import User
from ...services.sarcasm_service import detect_sarcasm

router = APIRouter()

@router.post("/", response_model=DetectSarcasmResponse)
async def analyze_sarcasm(
    request: DetectSarcasmRequest,
    current_user: User = Depends(get_current_user)
):
    analysis = await detect_sarcasm(request.text)
    return DetectSarcasmResponse(**analysis)
