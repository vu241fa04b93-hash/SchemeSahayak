from matching.eligibility import check_eligibility
from matching.scoring import calculate_match_score
from matching.explanation import generate_explanation
from matching.ranking import rank_schemes


def test_check_eligibility():
    profile = {
        "income": 180000,
        "state": "Andhra Pradesh",
        "business_type": "Tailoring",
        "project_cost": 300000
    }

    scheme = {
        "scheme_id": "S001",
        "scheme_name": "Tailoring Support Scheme"
    }

    rules = [
        {
            "rule_id": "R001",
            "scheme_id": "S001",
            "rule_type": "income",
            "field": "income",
            "operator": "<=",
            "value": "300000",
            "description": "Income must be within ₹3 lakh."
        },
        {
            "rule_id": "R002",
            "scheme_id": "S001",
            "rule_type": "state",
            "field": "state",
            "operator": "=",
            "value": "Andhra Pradesh",
            "description": "Scheme is available in Andhra Pradesh."
        },
        {
            "rule_id": "R003",
            "scheme_id": "S001",
            "rule_type": "business_type",
            "field": "business_type",
            "operator": "=",
            "value": "Tailoring",
            "description": "Tailoring businesses are supported."
        },
        {
            "rule_id": "R004",
            "scheme_id": "S001",
            "rule_type": "project_cost",
            "field": "project_cost",
            "operator": "<=",
            "value": "500000",
            "description": "Project cost must not exceed ₹5 lakh."
        }
    ]

    result = check_eligibility(profile, scheme, rules)

    assert result["eligible"] is True
    assert len(result["matched_rules"]) == 4
    assert len(result["failed_rules"]) == 0


def test_ineligible_profile():
    profile = {
        "income": 400000,
        "state": "Telangana",
        "business_type": "Manufacturing",
        "project_cost": 700000
    }

    scheme = {
        "scheme_id": "S001",
        "scheme_name": "Tailoring Support Scheme"
    }

    rules = [
        {
            "rule_id": "R001",
            "scheme_id": "S001",
            "field": "income",
            "operator": "<=",
            "value": "300000",
            "description": "Income must be within ₹3 lakh."
        },
        {
            "rule_id": "R002",
            "scheme_id": "S001",
            "field": "state",
            "operator": "=",
            "value": "Andhra Pradesh",
            "description": "Scheme is available in Andhra Pradesh."
        },
        {
            "rule_id": "R003",
            "scheme_id": "S001",
            "field": "business_type",
            "operator": "=",
            "value": "Tailoring",
            "description": "Tailoring businesses are supported."
        }
    ]

    result = check_eligibility(profile, scheme, rules)

    assert result["eligible"] is False
    assert len(result["failed_rules"]) == 3


def test_scoring_and_explanation():
    result = {
        "eligible": True,
        "matched_rules": [
            "Income is within the limit.",
            "Business type is supported."
        ],
        "failed_rules": []
    }

    score = calculate_match_score(result)
    explanation = generate_explanation(result)

    assert score == 100.0
    assert explanation["status"] == "Eligible"


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
            "scheme_name": "Tailoring Support Scheme"
        },
        {
            "scheme_id": "S002",
            "scheme_name": "Small Business Scheme"
        },
        {
            "scheme_id": "S003",
            "scheme_name": "Manufacturing Scheme"
        }
    ]

    # Temporarily replace the database rule function with
    # controlled test data.
    import matching.ranking as ranking_module

    test_rules = {
        "S001": [
            {
                "scheme_id": "S001",
                "field": "income",
                "operator": "<=",
                "value": "300000",
                "description": "Income is within the permitted limit."
            },
            {
                "scheme_id": "S001",
                "field": "state",
                "operator": "=",
                "value": "Andhra Pradesh",
                "description": "User state is covered."
            },
            {
                "scheme_id": "S001",
                "field": "business_type",
                "operator": "=",
                "value": "Tailoring",
                "description": "Business type is supported."
            }
        ],
        "S002": [
            {
                "scheme_id": "S002",
                "field": "income",
                "operator": "<=",
                "value": "150000",
                "description": "Income must be within the limit."
            }
        ],
        "S003": [
            {
                "scheme_id": "S003",
                "field": "business_type",
                "operator": "=",
                "value": "Manufacturing",
                "description": "Manufacturing is supported."
            }
        ]
    }

    ranking_module.get_eligibility_rules = (
        lambda scheme_id: test_rules.get(scheme_id, [])
    )

    results = rank_schemes(profile, schemes)

    assert len(results) == 3
    assert results[0]["scheme_id"] == "S001"
    assert results[0]["eligible"] is True
    assert results[0]["score"] >= results[1]["score"]