from matching.eligibility import check_eligibility
from matching.scoring import calculate_match_score
from matching.explanation import generate_explanation
from database.database import get_eligibility_rules


def rank_schemes(profile, schemes):
    """
    Check, score, and rank multiple schemes using
    eligibility rules stored in the database.
    """

    results = []

    for scheme in schemes:
        scheme_id = scheme.get("scheme_id")

        # Fetch eligibility rules for this scheme
        rules = get_eligibility_rules(scheme_id)

        # Check eligibility using database rules
        eligibility_result = check_eligibility(
            profile,
            scheme,
            rules
        )

        # Calculate match score
        score = calculate_match_score(eligibility_result)

        # Generate explanation
        explanation = generate_explanation(eligibility_result)

        result = {
            "scheme_id": scheme_id,
            "scheme_name": scheme.get("scheme_name"),
            "eligible": eligibility_result["eligible"],
            "score": score,
            "matched_rules": eligibility_result["matched_rules"],
            "failed_rules": eligibility_result["failed_rules"],
            "explanation": explanation
        }

        results.append(result)

    # Highest score first
    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results