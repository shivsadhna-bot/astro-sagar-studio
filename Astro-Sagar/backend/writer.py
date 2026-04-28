import google.generativeai as genai
import os

# यहाँ अपनी Gemini API Key डालें (मैं आपको बताऊंगा कहाँ से मिलेगी)
genai.configure(api_key="YOUR_GEMINI_API_KEY")

def generate_astrology_content(topic):
    model = genai.GenerativeModel('gemini-pro')
    
    prompt = f"""
    तुम एक प्रोफेशनल ज्योतिष एक्सपर्ट और 'जय त्रिकाल' यूट्यूब चैनल के स्क्रिप्ट राइटर हो।
    विषय: {topic}
    
    निर्देश:
    1. भाषा सरल, रोचक और हिंदी (देवनागरी) में होनी चाहिए।
    2. इंटरनेट से ताज़ा ग्रहों की स्थिति (Transit) और वैदिक ज्योतिष के सिद्धांतों का उपयोग करें।
    3. शुरुआत एक दमदार हुक (Hook) से करें।
    4. कंटेंट कम से कम 3000 शब्दों का या बहुत विस्तृत होना चाहिए।
    5. अंत में दर्शकों के लिए सटीक उपाय (Remedies) बताएं।
    
    लिखना शुरू करें:
    """
    
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    topic_name = input("किस विषय पर स्क्रिप्ट चाहिए?: ")
    print("AI रिसर्च कर रहा है और स्क्रिप्ट लिख रहा है, कृपया प्रतीक्षा करें...")
    script = generate_astrology_content(topic_name)
    print("\n--- आपकी स्क्रिप्ट तैयार है ---\n")
    print(script)