def calculate_match_score(result):
    """
    Calculate a simple matching score based on
    the number of satisfied eligibility conditions.
    """

    matched = len(result.get("matched_rules", []))
    failed = len(result.get("failed_rules", []))

    total = matched + failed

    if total == 0:
        return 0

    score = (matched / total) * 100

    return round(score, 2)