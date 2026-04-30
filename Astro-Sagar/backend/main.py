from fastapi import FastAPI, HTTPException, Form, Body
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import os
import io
from datetime import datetime
import uvicorn
from pydantic import BaseModel

from writer import generate_astrology_content, generate_multi_agent_content
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_KEY")
)
supabase = create_client(url, key)
app = FastAPI()
from fastapi import FastAPI


# 🔹 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Audio functions
async def generate_audio(text, output_file, rate="+0%", pitch="+0Hz"):
    voice = 'hi-IN-MadhurNeural'
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_file)

async def generate_audio_bytes(text, voice="hi-IN-MadhurNeural", rate="+0%", pitch="+0Hz"):
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data


# 🔹 Routes
@app.get("/")
def home():
    return {"message": "Astro Sagar API running"}

@app.get("/status")
def status():
    return {"status": "Online"}

@app.get("/voices")
async def get_voices():
    voices = await edge_tts.list_voices()
    return {"voices": voices}


# 🔹 Speak
@app.post("/speak")
async def speak(text: str = Form(...)):
    if not text:
        raise HTTPException(status_code=400, detail="Text required")

    audio_bytes = await generate_audio_bytes(text)

    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg"
    )


# 🔹 Generate audio file
@app.post("/generate-audio")
async def generate_audio_endpoint(text: str = Form(...)):
    os.makedirs("outputs", exist_ok=True)

    filename = f"outputs/audio_{datetime.now().strftime('%H%M%S')}.mp3"

    await generate_audio(text, filename)

    return {"file": filename}


@app.get("/audio/{filename}")
async def get_audio(filename: str):
    path = f"outputs/{filename}"
    if os.path.exists(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="Not found")


# 🔹 Single content
@app.post("/generate-content")
async def generate_content_endpoint(topic: str = Body(...)):
    content = generate_astrology_content(topic)
    return {"content": content}


# 🔥 FIXED MULTI AGENT
class TopicRequest(BaseModel):
    topic: str


@app.post("/generate-agents")
async def generate_agents_endpoint(data: TopicRequest):
    try:
        results = generate_multi_agent_content(data.topic)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 Run
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)