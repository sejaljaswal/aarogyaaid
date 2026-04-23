from fastapi import APIRouter, HTTPException
from models.user import PolicyRecommendationRequest
from models.policy import PolicyRecommendation
from logic.scoring import get_recommendations
from typing import List

router = APIRouter(prefix="/api/recommend", tags=["Recommender"])

@router.post("/", response_model=List[PolicyRecommendation])
async def recommend_policies(request: PolicyRecommendationRequest):
    try:
        recommendations = get_recommendations(request.profile)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
