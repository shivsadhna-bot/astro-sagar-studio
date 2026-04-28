import asyncio
import edge_tts
import argparse

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

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate audio from text using Edge-TTS")
    parser.add_argument("text", help="The text to convert to speech")
    parser.add_argument("-o", "--output", default="output.mp3", help="Output MP3 file")
    parser.add_argument("-r", "--rate", default="+0%", help="Speaking rate, e.g., '+5%%' or '-5%%'")
    parser.add_argument("-p", "--pitch", default="+0Hz", help="Voice pitch, e.g., '+10Hz' or '-10Hz'")
    args = parser.parse_args()

    asyncio.run(generate_audio(args.text, args.output, args.rate, args.pitch))
    print(f"Audio saved to {args.output}")