import asyncio
import edge_tts

async def generate_audio(text, output_file):
    """
    Generate audio from text using Microsoft Edge TTS.

    Args:
        text (str): The text to convert to speech.
        output_file (str): The path to save the MP3 file.
    """
    voice = 'hi-IN-MadhurNeural'
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

# Example usage
if __name__ == "__main__":
    text = "नमस्ते, यह एक परीक्षण संदेश है।"  # Example Hindi text
    output_file = "output.mp3"
    asyncio.run(generate_audio(text, output_file))
    print(f"Audio saved to {output_file}")