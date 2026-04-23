import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")
    CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR")

settings = Settings()
