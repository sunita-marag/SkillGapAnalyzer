
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

url = (
    f"https://generativelanguage.googleapis.com/v1beta/"
    f"models/{model}:generateContent"
)

try:
    response = requests.post(
        url,
        params={"key": api_key},
        json={
            "contents": [
                {
                    "parts": [
                        {"text": "Create a short 3-step Python learning roadmap."}
                    ]
                }
            ]
        },
        timeout=120
    )

    print("HTTP Status:", response.status_code)

    if response.ok:
        data = response.json()
        answer = data["candidates"][0]["content"]["parts"][0]["text"]
        print("Gemini Answer:")
        print(answer)
        print("GEMINI GENERATION SUCCESSFUL!")
    else:
        print("API Error:", response.text[:1500])

except Exception as error:
    print("Connection Error:", type(error).__name__, str(error))
