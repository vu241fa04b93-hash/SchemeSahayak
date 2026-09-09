from matching.eligibility import check_eligibility
from matching.scoring import calculate_match_score
from matching.explanation import generate_explanation


def rank_schemes(profile, schemes):
    """
    Check the user's profile against multiple schemes
    and rank them based on their match score.
    """

    results = []

    for scheme in schemes:
        eligibility_result = check_eligibility(profile, scheme)

        score = calculate_match_score(eligibility_result)

        explanation = generate_explanation(eligibility_result)

        result = {
            "scheme_id": scheme.get("scheme_id"),
            "scheme_name": scheme.get("scheme_name"),
            "eligible": eligibility_result["eligible"],
            "score": score,
            "matched_rules": eligibility_result["matched_rules"],
            "failed_rules": eligibility_result["failed_rules"],
            "explanation": explanation
        }

        results.append(result)

    # Highest score first
    results.sort(key=lambda x: x["score"], reverse=True)

    return results