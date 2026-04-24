import pytest

@pytest.fixture
def sample_profile():
    return {
        "name": "Jane Doe",
        "age": 32,
        "lifestyle": "Sedentary",
        "pre_existing_conditions": "Diabetes",
        "income_band": "Under ₹3L",
        "city_tier": "Metro"
    }

@pytest.fixture
def athlete_profile():
    return {
        "name": "John Runner",
        "age": 28,
        "lifestyle": "Athlete",
        "pre_existing_conditions": "None",
        "income_band": "₹15L+",
        "city_tier": "Tier-2"
    }

@pytest.fixture
def basic_policy():
    return {
        "policy_name": "Basic Care",
        "premium": 5000,
        "covered_conditions": ["diabetes", "hypertension"],
        "has_opd": False,
        "waiting_period_years": 2
    }

@pytest.fixture
def high_waiting_policy():
    return {
        "policy_name": "Late Care",
        "premium": 4000,
        "covered_conditions": ["hypertension"],
        "has_opd": False,
        "waiting_period_years": 4
    }
