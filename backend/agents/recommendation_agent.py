import json
import logging
from services.llmService import generate_response
from agents.tools import retrieve_all_policies

logger = logging.getLogger(__name__)

def get_recommendation(profile: dict, all_collection_names: list) -> str:
    """
    Revised recommender using official Google SDK.
    Manually retrieves context to ensure grounded responses.
    """
    profile_str = json.dumps(profile, indent=2)
    
    # 1. Manually retrieve policy context from vector store
    # We query for general suitability based on profile traits
    query = f"Health insurance for {profile.get('age')} year old with {profile.get('pre_existing_conditions')}"
    context = retrieve_all_policies(query)
    
    # 2. Build the structured prompt
    prompt = f"""
You are an empathetic Indian health insurance advisor named Aarogya.
Your goal is to recommend the best insurance policy for a user based on their health profile and the provided policy documents.

USER PROFILE:
{profile_str}

AVAILABLE POLICY DATA:
{context}

INSTRUCTIONS:
1. Compare the user's needs against the available policies.
2. Provide a response in EXACTLY this format with three clearly marked sections:

[PEER COMPARISON TABLE]
(A markdown table comparing the top 2-3 matching policies. Include columns: Policy Name, Insurer, Premium (approx), Cover Amount, Waiting Period, Key Benefit, Suitability Score)

[COVERAGE DETAIL]
(Detail the specific inclusions and exclusions of the RECOMMENDED policy. Use '+' for inclusions and '-' for exclusions.)

[WHY THIS POLICY]
(A personalized 2-3 paragraph explanation of why this specific policy is the best match for the user's conditions, income, and lifestyle.)

Begin your response:
"""

    # 3. Call the official SDK service
    result = generate_response(prompt)
    
    if result["status"] == "success":
        return result["data"]
    
    # Return the entire dict so the router can check 'status'
    return result
