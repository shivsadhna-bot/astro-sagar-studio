import google.generativeai as genai
import os
from dotenv import load_dotenv
from researcher import get_research

# 🔹 load env
load_dotenv()

# 🔹 configure API
genai.configure(api_key=os.getenv("AIzaSyCMN4OKoiEbXLhbBRzLFEJP5HIpFxNgkAk"))

# 🔹 model (WORKING)
model = genai.GenerativeModel("gemini-3-flash-preview")


def generate_astrology_content(topic, agent_name="Jai Trikaal"):
    try:
        research = get_research(topic)

        prompt = f"""
तुम एक प्रोफेशनल ज्योतिष एक्सपर्ट हो।

Agent Name: {agent_name}

विषय: {topic}

Research Data:
{research}

निर्देश:
- भाषा सरल, प्राकृतिक और बोलचाल की हिंदी हो
- ऐसा लगे जैसे कोई इंसान YouTube पर बोल रहा है
- कोई भी गलत या बढ़ा-चढ़ा दावा नहीं करना
- वैदिक ज्योतिष का सही उपयोग करना

STRUCTURE:
1. Hook
2. Basic Understanding
3. Deep Explanation
4. Real-Life Impact
5. Myth vs Reality
6. Remedies
7. Conclusion

Length:
- 1500+ words

शुरू करो:
"""

        response = model.generate_content(prompt)

        return response.text if response.text else "No content generated"

    except Exception as e:
        return f"Error generating content: {str(e)}"


def generate_multi_agent_content(topic):
    agents = ["Jai Trikaal"]  # 🔥 only 1 agent

    results = []

    for agent in agents:
        script = generate_astrology_content(topic, agent)

        results.append({
            "agent_name": agent,
            "topic": topic,
            "script": script
        })

    return results

# 🔹 test
if __name__ == "__main__":
    topic_name = input("Topic: ")
    data = generate_multi_agent_content(topic_name)

    for item in data:
        print(f"\n--- {item['agent_name']} ---\n")
        print(item["script"])