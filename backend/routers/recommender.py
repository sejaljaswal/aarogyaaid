from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from database import get_db
from models.db import PolicyDocument, UserSession
from agents.recommendation_agent import get_recommendation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/recommend", tags=["Recommender"])

class RecommendationRequest(BaseModel):
    name: str = Field(...)
    age: int = Field(...)
    lifestyle: str = Field(...)
    pre_existing_conditions: str = Field(...)
    income_band: str = Field(...)
    city_tier: str = Field(...)

class RecommendationResponse(BaseModel):
    session_id: str
    recommendation_text: str
    recommended_policy_name: str

@router.post("/", response_model=RecommendationResponse)
def get_policy_recommendation(request: RecommendationRequest, db: Session = Depends(get_db)):
    # Validate fields implicitly via Pydantic
    profile_dict = request.dict()
    
    # Fetch all policy documents to get collection names
    docs = db.query(PolicyDocument).all()
    all_collection_names = [doc.chroma_collection_id for doc in docs if doc.chroma_collection_id]
    
    # Call the recommendation agent
    try:
        result_data = get_recommendation(profile_dict, all_collection_names)
        
        # In the new SDK model, get_recommendation returns the text direct
        # or a dict if there's a fallback/error from generate_response
        if isinstance(result_data, dict):
            if result_data.get("status") in ["fallback", "success"]:
                recommendation_text = result_data["data"]
            else:
                # Last resort error handling
                logger.error(f"[API ERROR] LLM failed and no fallback: {result_data}")
                recommendation_text = "Standard health insurance recommended. Please consult an advisor."
        else:
            recommendation_text = result_data
    except Exception as e:
        logger.error(f"[API ERROR] Internal crash: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during recommendation")
    
    # Attempt to extract recommended policy name by checking DB
    recommended_policy_name = "AI Recommendation Match"
    for doc in docs:
        # If the generated recommendation explicitely cited a specific loaded policy
        if doc.policy_name and doc.policy_name in recommendation_text:
            recommended_policy_name = doc.policy_name
            break
            
    # Create UserSession
    user_session = UserSession(
        profile=profile_dict,
        recommended_policy_id=recommended_policy_name
    )
    db.add(user_session)
    db.commit()
    db.refresh(user_session)
    
    return RecommendationResponse(
        session_id=user_session.id,
        recommendation_text=recommendation_text,
        recommended_policy_name=recommended_policy_name
    )
