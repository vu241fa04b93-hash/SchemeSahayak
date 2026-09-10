def profile_to_dict(profile):
    """
    Convert Gemini UserProfile into a dictionary
    compatible with the matching rule engine.
    """

    if hasattr(profile, "model_dump"):
        data = profile.model_dump()
    elif isinstance(profile, dict):
        data = profile.copy()
    else:
        data = vars(profile).copy()

    # -------------------------------------------------
    # Business status normalization
    # -------------------------------------------------
    if "has_existing_business" in data:
        existing = data.get("has_existing_business")

        if existing is not None:
            data["is_new_unit"] = not existing

    # -------------------------------------------------
    # Common field aliases
    # -------------------------------------------------
    if data.get("business_experience_years") is not None:
        data["experience_years"] = data["business_experience_years"]

    if data.get("investment_amount") is not None:
        data["investment"] = data["investment_amount"]

    if data.get("required_funding") is not None:
        data["funding_required"] = data["required_funding"]

    return data