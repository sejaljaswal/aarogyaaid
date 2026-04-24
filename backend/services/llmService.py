import os
import time
import google.generativeai as genai
import logging
from config import settings

logger = logging.getLogger(__name__)

# Configure official client
genai.configure(api_key=settings.GOOGLE_API_KEY)

MODEL_NAME = "gemini-2.0-flash"

def generate_response(prompt: str):
    """
    Directly calls the official Google Generative AI client.
    Includes retry logic for 429 quota errors and a static fallback.
    """
    max_retries = 2
    retry_delay = 5  # Base delay in seconds
    
    for attempt in range(max_retries + 1):
        try:
            logger.info(f"[LLM] Using model: {MODEL_NAME} (Attempt {attempt + 1})")

            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(prompt)

            if not response or not response.text:
                logger.warning("[LLM] Received empty response")
                return {
                    "status": "error",
                    "message": "Empty response from LLM"
                }

            return {
                "status": "success",
                "data": response.text
            }

        except Exception as e:
            err_msg = str(e)
            logger.error(f"[LLM ERROR] {err_msg}")
            
            # Check for 429 Quota Error
            if "429" in err_msg or "quota" in err_msg.lower():
                if attempt < max_retries:
                    logger.info(f"[LLM RETRY] Quota exceeded. Waiting {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
                else:
                    logger.error("[LLM QUOTA EXHAUSTED] All retries failed.")
                    return {
                        "status": "fallback",
                        "data": "I'm having trouble with advanced AI right now, but I can still help with basic information."
                    }
            
            # If we've exhausted retries or it's a different error
            return {
                "status": "error",
                "message": err_msg,
                "data": "AI service temporarily unavailable"
            }

