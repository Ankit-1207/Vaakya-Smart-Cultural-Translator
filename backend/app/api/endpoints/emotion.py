import os
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from ...schemas.emotion import DetectToneResponse
from ..dependencies import get_current_user
from ...models.user import User
from ...services.emotion_service import detect_emotion_from_audio, analyze_context_and_match

router = APIRouter()

@router.post("/", response_model=DetectToneResponse)
async def detect_tone(
    text: str = Form(...),
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file uploaded")

    suffix = os.path.splitext(audio.filename)[1]
    if not suffix:
        suffix = ".webm"
        
    temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        with open(temp_audio.name, 'wb') as out_file:
            content = await audio.read()
            out_file.write(content)
            
        audio_analysis = await detect_emotion_from_audio(temp_audio.name)
        detected_emotion = audio_analysis["emotion"]
        confidence_score = audio_analysis["confidence"]
        
        return DetectToneResponse(
            detected_emotion=detected_emotion,
            confidence_score=confidence_score
        )
    except Exception as e:
        print(f"Detect tone error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process audio and detect tone.")
    finally:
        temp_audio.close()
        try:
            os.unlink(temp_audio.name)
        except OSError:
            pass
