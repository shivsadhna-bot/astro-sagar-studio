from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import edge_tts
import os
import tempfile
from datetime import datetime
import io
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="Astro Sagar TTS Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_audio_bytes(text, voice='hi-IN-MadhurNeural', rate="+0%", pitch="+0Hz"):
    """
    Generate audio from text using Microsoft Edge TTS and return as bytes.
    
    Args:
        text (str): The text to convert to speech.
        voice (str): The voice to use (e.g., 'hi-IN-MadhurNeural').
        rate (str): Speaking rate adjustment, e.g., "+5%" or "-5%".
        pitch (str): Voice pitch adjustment, e.g., "+10Hz" or "-10Hz".
    
    Returns:
        bytes: MP3 audio data
    """
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        
        # Use tempfile for better cross-platform compatibility
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp:
            output_file = tmp.name
        
        logger.debug(f"Generating audio: text={text[:50]}, voice={voice}, rate={rate}, pitch={pitch}")
        await communicate.save(output_file)
        
        # Read the file into bytes
        with open(output_file, 'rb') as f:
            audio_bytes = f.read()
        
        logger.debug(f"Audio generated successfully, size: {len(audio_bytes)} bytes")
        
        # Clean up temporary file
        os.remove(output_file)
        
        return audio_bytes
    except Exception as e:
        logger.error(f"Error in generate_audio_bytes: {str(e)}", exc_info=True)
        raise

@app.get("/")
def home():
    return {
        "message": "Astro Sagar TTS Server is running",
        "version": "1.0",
        "voice": "hi-IN-MadhurNeural",
        "endpoints": {
            "GET /": "Server info",
            "GET /voices": "List all available voices",
            "POST /speak": "Generate speech from text"
        }
    }

@app.get("/voices")
async def get_voices():
    """
    Get list of all available voices.
    
    Returns:
        List of voice objects with ShortName and Friendly Name
    """
    try:
        logger.info("Fetching available voices...")
        voices = await edge_tts.list_voices()
        
        # Convert to list and add friendly names
        voice_list = []
        for voice in voices:
            voice_list.append({
                "short_name": voice["ShortName"],
                "friendly_name": voice["FriendlyName"],
                "locale": voice["Locale"],
                "gender": voice["Gender"],
                "language": voice.get("Language", "Unknown")
            })
        
        logger.info(f"Found {len(voice_list)} voices")
        return {"voices": voice_list, "count": len(voice_list)}
    except Exception as e:
        logger.error(f"Error fetching voices: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching voices: {str(e)}")

@app.post("/speak")
async def speak(text: str = Form(...), voice: str = Form("hi-IN-MadhurNeural"), rate: str = Form("+0%"), pitch: str = Form("+0Hz")):
    """
    Generate speech from text and return MP3 audio file.
    
    Args:
        text: The text to convert to speech
        voice: The voice to use (short name), e.g., 'hi-IN-MadhurNeural'
        rate: Speaking rate, e.g., "+5%" or "-5%"
        pitch: Voice pitch, e.g., "+10Hz" or "-10Hz"
    
    Returns:
        MP3 audio file
    """
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text is required")
        
        logger.info(f"Received speak request with voice: {voice}, text: {text[:50]}...")
        
        audio_bytes = await generate_audio_bytes(text, voice, rate, pitch)
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=audio.mp3"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in speak endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
