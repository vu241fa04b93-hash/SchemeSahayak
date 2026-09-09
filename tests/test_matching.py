from matching.eligibility import check_eligibility
from matching.scoring import calculate_match_score
from matching.explanation import generate_explanation


profile = {
    "income": 400000,
    "state": "Telangana",
    "business_type": "Tailoring",
    "project_cost": 300000
}

scheme = {
    "max_income": 300000,
    "states": ["Andhra Pradesh"],
    "business_types": ["Tailoring", "Handicrafts"],
    "min_project_cost": 100000,
    "max_project_cost": 500000
}

result = check_eligibility(profile, scheme)

score = calculate_match_score(result)

explanation = generate_explanation(result)

print(result)
print("Score:", score)
print(explanation)