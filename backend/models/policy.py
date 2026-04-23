from pydantic import BaseModel
from typing import List, Optional

class InsurancePolicy(BaseModel):
    id: str
    name: str
    provider: str
    sum_insured: int
    base_premium: int
    waiting_period_months: int
    cashless_hospitals: int
    has_opd_cover: bool = False
    has_maternity_cover: bool = False
    description: str

class PolicyRecommendation(BaseModel):
    policy: InsurancePolicy
    score: float
    matching_reasons: List[str]
    estimated_premium: int
