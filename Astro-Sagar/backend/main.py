from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import edge_tts
import os
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_audio(text, output_file, rate="+0%", pitch="+0Hz"):
    """
    Generate high-quality audio from text using Microsoft Edge TTS.

    Args:
        text (str): The text to convert to speech.
        output_file (str): The path to save the MP3 file.
        rate (str): Speaking rate adjustment, e.g., "+5%" or "-5%".
        pitch (str): Voice pitch adjustment, e.g., "+10Hz" or "-10Hz".
    """
    voice = 'hi-IN-MadhurNeural'
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_file)

@app.get("/")
def home():
    return {"message": "Astro Sagar API is running successfully!"}

@app.get("/status")
def status():
    return {"status": "Online", "language": "Hindi-Devnagari"}

@app.post("/generate-audio")
async def generate_audio_endpoint(
    text: str = Form(...),
    rate: str = Form("+0%"),
    pitch: str = Form("+0Hz")
):
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # Create outputs directory if not exists
    os.makedirs("outputs", exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"outputs/audio_{timestamp}.mp3"
    
    try:
        await generate_audio(text, output_file, rate, pitch)
        return {"message": "Audio generated successfully", "file": output_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    file_path = f"outputs/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/mpeg")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")