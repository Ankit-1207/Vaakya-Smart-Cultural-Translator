from fastapi import APIRouter, HTTPException
from ...schemas.slang import SlangAnalysisRequest, SlangAnalysisResponse
from ...services.slang_service import analyze_slang

router = APIRouter()

@router.post("/", response_model=SlangAnalysisResponse)
async def get_slang_analysis(request: SlangAnalysisRequest):
    try:
        result = await analyze_slang(request.text, request.target_language)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Slang analysis failed: {str(e)}"
        )
