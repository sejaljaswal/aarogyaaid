def score_policy_for_profile(policy_metadata: dict, profile: dict) -> float:
    """
    Scores a policy for a user profile on a scale of 0.0 to 1.0.
    """
    score = 0.5  # Base score
    
    # 1. Pre-existing conditions coverage
    user_conditions = [c.strip().lower() for c in profile.get('pre_existing_conditions', '').split(',') if c.strip()]
    covered_conditions = [c.lower() for c in policy_metadata.get('covered_conditions', [])]
    
    for condition in user_conditions:
        if condition != 'none' and condition in covered_conditions:
            score += 0.2
            
    # 2. Income Band vs Premium Affordability
    # Mock affordability logic:
    # Under ₹3L: affordable < 8000
    # ₹3L–8L: affordable < 15000
    # ₹8L–15L: affordable < 30000
    # ₹15L+: affordable < 60000
    income_band = profile.get('income_band', '')
    premium = policy_metadata.get('premium', 999999)
    
    is_affordable = False
    if "Under ₹3L" in income_band and premium < 8000: is_affordable = True
    elif "₹3L–8L" in income_band and premium < 15000: is_affordable = True
    elif "₹8L–15L" in income_band and premium < 30000: is_affordable = True
    elif "₹15L+" in income_band and premium < 60000: is_affordable = True
    
    if is_affordable:
        score += 0.2
        
    # 3. OPD cover for Active/Athlete lifestyle
    lifestyle = profile.get('lifestyle', '')
    if lifestyle in ['Active', 'Athlete'] and policy_metadata.get('has_opd', False):
        score += 0.1
        
    # 4. Waiting Period Penalty
    waiting_period = policy_metadata.get('waiting_period_years', 0)
    has_pre_existing = len([c for c in user_conditions if c != 'none']) > 0
    
    if waiting_period > 3 and has_pre_existing:
        score -= 0.2
        
    # Final clamping
    return max(0.0, min(1.0, round(score, 2)))
