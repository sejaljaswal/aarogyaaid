import pytest
from agents.scoring import score_policy_for_profile

def test_high_score_for_matching_profile(sample_profile, basic_policy):
    # User has Diabetes, Low Income
    # Policy covers Diabetes, is cheap (5000 < 8000)
    # Expected: Base(0.5) + Covered(0.2) + Affordable(0.2) = 0.9
    score = score_policy_for_profile(basic_policy, sample_profile)
    assert score >= 0.6
    assert score == 0.9

def test_low_score_for_mismatch(athlete_profile):
    # Athlete user, policy has no OPD
    mismatching_policy = {
        "policy_name": "No-OPD Policy",
        "premium": 70000, # Too expensive for 15L+ logic (max 60k)
        "covered_conditions": [],
        "has_opd": False,
        "waiting_period_years": 2
    }
    # Expected: Base(0.5) - Not Affordable(0) - No conditions match(0) - No OPD for Athlete(0) = 0.5
    score = score_policy_for_profile(mismatching_policy, athlete_profile)
    assert score <= 0.5

def test_waiting_period_penalty(sample_profile, high_waiting_policy):
    # User has Diabetes (pre-existing)
    # Policy has 4 years waiting period (> 3)
    # Penalty: -0.2
    # Plus, this policy doesn't cover Diabetes (only hypertension)
    # Income: Under 3L, Policy: 4000 (Affordable: +0.2)
    # Expected: Base(0.5) + Affordable(0.2) - Condition mismatch(0) - Penalty(0.2) = 0.5
    score = score_policy_for_profile(high_waiting_policy, sample_profile)
    
    # We want to verify there's a penalty compared to if it had low waiting
    normal_waiting_policy = high_waiting_policy.copy()
    normal_waiting_policy['waiting_period_years'] = 2
    normal_score = score_policy_for_profile(normal_waiting_policy, sample_profile)
    
    assert score < normal_score
    assert score == 0.5
