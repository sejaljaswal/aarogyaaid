import json
import logging
from services.llmService import generate_response
from agents.tools import retrieve_policy_chunks

logger = logging.getLogger(__name__)

def get_chat_response(message, profile, recommended_policy, collection_name, chat_history):
    """
    Revised chat specialist using official Google SDK.
    """
    # 1. Retrieve specific policy chunks for the question
    try:
        context = retrieve_policy_chunks(message, collection_name)
    except Exception as e:
        logger.warning(f"[CHAT] Context retrieval failed: {str(e)}")
        context = "No specific policy data available for this query."
    
    # 2. Format history
    history_str = ""
    for msg in chat_history[-5:]: # Last 5 turns for context
        role = "User" if msg.get("role") == "user" else "Aarogya"
        history_str += f"{role}: {msg.get('content')}\n"

    # 3. Build prompt
    prompt = f"""
You are Aarogya, an empathetic health insurance specialist focusing ONLY on the policy: {recommended_policy}.
Use the provided policy context and user profile to answer questions accurately.

USER PROFILE:
{json.dumps(profile, indent=2)}

POLICY CONTEXT:
{context}

RECENT CONVERSATION:
{history_str}

USER QUESTION: {message}

INSTRUCTIONS:
- Be warm and professional.
- Do NOT ask for their profile details again.
- If the information is not in the context, say you're not sure but offer general guidance.
- Keep it concise.

Aarogya:"""

    # 4. Call official SDK
    result = generate_response(prompt)
    
    if result["status"] == "success":
        return result["data"]
    
    # 5. Intelligent Fallback Logic
    msg_low = message.lower()
    
    # CASE 1: Definitions
    definitions = {
        "co-pay": "Co-pay is the percentage of the claim amount you have to pay from your pocket, while the insurer pays the rest.",
        "deductible": "A deductible is the fixed amount you pay before the insurance company starts covering the costs.",
        "waiting period": "The waiting period is the time you must wait before the insurance company covers specific illnesses or pre-existing conditions.",
        "premium": "Premium is the regular amount you pay to keep your health insurance policy active."
    }
    
    for key, val in definitions.items():
        if key in msg_low:
            logger.info(f"[CHAT FALLBACK] Keyword detected: {key}")
            return val
            
    if any(k in msg_low for k in ["what is", "define", "meaning", "explain"]):
        logger.info("[CHAT FALLBACK] General definition request")
        return "I'm currently unable to access detailed AI definitions, but generally, I can help you understand waiting periods, co-pays, and coverage limits if you ask about them specifically."

    # CASE 2: Personalized Fallback
    if any(k in msg_low for k in ["my case", "for me", "profile", "condition"]):
        age = profile.get("age", "your age")
        conditions = profile.get("pre_existing_conditions", "your conditions")
        logger.info("[CHAT FALLBACK] Personalized query")
        return f"Based on your profile (Age: {age}, Conditions: {conditions}), we recommend prioritizing a plan like {recommended_policy} which covers pre-existing conditions after its specific waiting period."

    # CASE 3: General Fallback
    logger.info("[CHAT FALLBACK] General fallback")
    return "I'm having trouble accessing my full AI capabilities right now, but I can still help explain the key benefits and exclusions of your recommended policy if you have specific questions."

