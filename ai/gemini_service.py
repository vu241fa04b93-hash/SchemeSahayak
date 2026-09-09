import os
import json

from dotenv import load_dotenv
from google import genai

from ai.prompts import PROFILE_EXTRACTION_PROMPT
from ai.schemas import UserProfile


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=API_KEY)


def generate_response(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text


def extract_user_profile(user_input: str) -> UserProfile:

    prompt = PROFILE_EXTRACTION_PROMPT.format(
        user_input=user_input
    )

    response = generate_response(prompt)

    cleaned_response = response.strip()

    # Remove markdown code fences
    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[7:]

    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[3:]

    if cleaned_response.endswith("```"):
        cleaned_response = cleaned_response[:-3]

    cleaned_response = cleaned_response.strip()

    try:
        data = json.loads(cleaned_response)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini returned invalid JSON:\n{cleaned_response}"
        ) from e

    return UserProfile(**data)