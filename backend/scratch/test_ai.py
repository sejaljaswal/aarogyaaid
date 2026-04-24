import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv(dotenv_path="../.env") # Try root .env
load_dotenv(dotenv_path="backend/.env") # Try backend .env

api_key = os.getenv("GOOGLE_API_KEY")
print(f"Testing with Key: {api_key[:10]}...")

try:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
    res = llm.invoke("Hi")
    print("Success:", res.content)
except Exception as e:
    print("Error:", str(e))
