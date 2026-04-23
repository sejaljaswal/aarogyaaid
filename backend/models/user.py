from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class UserProfile(BaseModel):
    age: int = Field(..., ge=18, le=100)
    city_tier: int = Field(..., ge=1, le=3, description="1 for Metro, 2 for State Capital, 3 for others")
    annual_income: int = Field(..., ge=0)
    pre_existing_conditions: List[str] = []
    lifestyle: Dict[str, bool] = Field(
        default_factory=lambda: {"smoker": False, "habitual_drinker": False, "regular_exercise": True}
    )
    has_existing_insurance: bool = False

class PolicyRecommendationRequest(BaseModel):
    profile: UserProfile
