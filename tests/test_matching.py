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
from matching.ranking import rank_schemes


def test_multi_scheme_ranking():

    profile = {
        "income": 180000,
        "state": "Andhra Pradesh",
        "business_type": "Tailoring",
        "project_cost": 300000
    }

    schemes = [
        {
            "scheme_id": "S001",
            "scheme_name": "Tailoring Support Scheme",
            "max_income": 300000,
            "states": ["Andhra Pradesh"],
            "business_types": ["Tailoring"],
            "min_project_cost": 100000,
            "max_project_cost": 500000
        },
        {
            "scheme_id": "S002",
            "scheme_name": "Small Business Scheme",
            "max_income": 150000,
            "states": ["Andhra Pradesh"],
            "business_types": ["Tailoring"],
            "min_project_cost": 100000,
            "max_project_cost": 500000
        },
        {
            "scheme_id": "S003",
            "scheme_name": "Manufacturing Scheme",
            "max_income": 500000,
            "states": ["Andhra Pradesh"],
            "business_types": ["Manufacturing"],
            "min_project_cost": 100000,
            "max_project_cost": 1000000
        }
    ]

    results = rank_schemes(profile, schemes)

    for result in results:
        print(
            result["scheme_name"],
            "->",
            result["score"],
            "%",
            "->",
            "Eligible" if result["eligible"] else "Not Eligible"
        )

    assert len(results) == 3
    assert results[0]["score"] >= results[1]["score"]
    assert results[1]["score"] >= results[2]["score"]