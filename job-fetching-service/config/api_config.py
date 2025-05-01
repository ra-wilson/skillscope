import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API key
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST")


if not RAPIDAPI_KEY:
    raise ValueError("RAPIDAPI_KEY is missing! Make sure it's in the .env file.")

JOBS_ENDPOINT = f"https://{RAPIDAPI_HOST}/v2/list"