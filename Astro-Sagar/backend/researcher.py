import requests

def get_research(topic):
    try:
        # 🔹 Wikipedia API (safe & stable)
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic}"
        res = requests.get(url)

        if res.status_code == 200:
            data = res.json()
            return data.get("extract", f"Basic research about {topic}")

        # fallback
        return f"General information about {topic}"

    except Exception as e:
        return f"Research failed: {topic}"