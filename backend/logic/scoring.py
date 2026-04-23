from typing import List, Tuple
from models.user import UserProfile
from models.policy import InsurancePolicy, PolicyRecommendation

# Mock Database of Policies
MOCK_POLICIES = [
    InsurancePolicy(
        id="p1",
        name="Optima Secure",
        provider="HDFC Ergo",
        sum_insured=1000000,
        base_premium=15000,
        waiting_period_months=24,
        cashless_hospitals=12000,
        has_opd_cover=False,
        description="Best-in-class coverage with 4X secure benefit."
    ),
    InsurancePolicy(
        id="p2",
        name="Assure",
        provider="Niva Bupa",
        sum_insured=500000,
        base_premium=8000,
        waiting_period_months=36,
        cashless_hospitals=8000,
        has_opd_cover=True,
        description="Comprehensive plan with physical & mental health cover."
    ),
    InsurancePolicy(
        id="p3",
        name="Young Star",
        provider="Star Health",
        sum_insured=300000,
        base_premium=5000,
        waiting_period_months=12,
        cashless_hospitals=14000,
        has_opd_cover=True,
        description="Affordable plan specifically for young adults."
    ),
    InsurancePolicy(
        id="p4",
        name="Senior Citizen Red Carpet",
        provider="Star Health",
        sum_insured=500000,
        base_premium=25000,
        waiting_period_months=12,
        cashless_hospitals=14000,
        has_opd_cover=False,
        description="Premium plan for seniors with low waiting period on PED."
    )
]

def score_policy(user: UserProfile, policy: InsurancePolicy) -> Tuple[float, List[str]]:
    score = 100.0
    reasons = []

    # 1. PED & Waiting Period
    if user.pre_existing_conditions:
        if policy.waiting_period_months <= 12:
            score += 30
            reasons.append("Short waiting period (12mo) for your health conditions")
        elif policy.waiting_period_months <= 24:
            score += 10
            reasons.append("Moderate waiting period (24mo)")
        else:
            score -= 20
            reasons.append("Long waiting period for pre-existing conditions")

    # 2. Income & Affordability
    monthly_income = user.annual_income / 12
    max_premium = user.annual_income * 0.05
    if policy.base_premium > max_premium:
        score -= 40
        reasons.append("Premium might be slightly high for your income bracket")
    else:
        score += 15
        reasons.append("Excellent value within your affordability range")

    # 3. City Tier & Sum Insured
    if user.city_tier == 1:
        if policy.sum_insured < 1000000:
            score -= 25
            reasons.append("Recommended higher sum insured (10L+) for Metro cities")
        else:
            score += 20
            reasons.append("Strong coverage for high medical costs in Tier 1 cities")

    # 4. Lifestyle & OPD
    if user.lifestyle.get("habitual_drinker") or user.lifestyle.get("smoker"):
        if policy.has_opd_cover:
            score += 15
            reasons.append("Includes OPD cover for preventative health checkups")

    # 5. Age Adjustments
    if user.age > 50:
        if policy.name.lower().find("senior") != -1:
            score += 25
            reasons.append("Tailored for senior citizen requirements")
    elif user.age < 30:
         if policy.name.lower().find("young") != -1:
            score += 20
            reasons.append("Designed for young healthy professionals")

    return round(max(0, score), 2), reasons

def get_recommendations(user: UserProfile) -> List[PolicyRecommendation]:
    recommendations = []
    for policy in MOCK_POLICIES:
        score, reasons = score_policy(user, policy)
        recommendations.append(
            PolicyRecommendation(
                policy=policy,
                score=score,
                matching_reasons=reasons,
                estimated_premium=policy.base_premium # Simplified for MVP
            )
        )
    
    # Sort by score descending
    return sorted(recommendations, key=lambda x: x.score, reverse=True)
