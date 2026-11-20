import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

print("API key configured:", bool(api_key))
print("Model:", model)

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
else:
    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=model,
            contents="Say hello in one sentence."
        )

        print("Gemini response:", response.text)
        print("GEMINI CONNECTION SUCCESSFUL!")

    except Exception as e:
        print("GEMINI CONNECTION FAILED:")
        print(type(e).__name__, str(e))