def generate_explanation(result):
    """
    Generate a transparent explanation of the matching result.
    """

    if result["eligible"]:
        status = "Eligible"
    else:
        status = "Not Eligible"

    return {
        "status": status,
        "matched_reasons": result.get("matched_rules", []),
        "failed_reasons": result.get("failed_rules", [])
    }