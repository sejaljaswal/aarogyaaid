from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.db import PolicyDocument, UserSession
from agents.recommendation_agent import get_recommendation

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
        recommendation_text = get_recommendation(profile_dict, all_collection_names)
    except Exception as e:
        err_str = str(e).lower()
        if "chroma" in err_str or "connection" in err_str:
            raise HTTPException(status_code=503, detail="Knowledge base temporarily unavailable")
        if "google" in err_str or "llm" in err_str or "model" in err_str:
            raise HTTPException(status_code=502, detail="AI generation service failed")
        raise HTTPException(status_code=500, detail=str(e))
    
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
