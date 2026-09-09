# def check_eligibility(user_profile, scheme):
#     """
#     Check whether a user satisfies the eligibility rules of a scheme.

#     Returns:
#         dict: Eligibility result containing status,
#               matched rules and failed rules.
#     """

#     matched_rules = []
#     failed_rules = []

#     # 1. Age eligibility
#     if "min_age" in scheme:
#         if user_profile.get("age") is not None:
#             if user_profile["age"] >= scheme["min_age"]:
#                 matched_rules.append(
#                     f"Age >= {scheme['min_age']}"
#                 )
#             else:
#                 failed_rules.append(
#                     f"Age must be at least {scheme['min_age']}"
#                 )

#     if "max_age" in scheme:
#         if user_profile.get("age") is not None:
#             if user_profile["age"] <= scheme["max_age"]:
#                 matched_rules.append(
#                     f"Age <= {scheme['max_age']}"
#                 )
#             else:
#                 failed_rules.append(
#                     f"Age must not exceed {scheme['max_age']}"
#                 )

#     # 2. Income eligibility
#     if "max_income" in scheme:
#         if user_profile.get("income") is not None:
#             if user_profile["income"] <= scheme["max_income"]:
#                 matched_rules.append(
#                     f"Income <= ₹{scheme['max_income']}"
#                 )
#             else:
#                 failed_rules.append(
#                     f"Income must be <= ₹{scheme['max_income']}"
#                 )

#     if "min_income" in scheme:
#         if user_profile.get("income") is not None:
#             if user_profile["income"] >= scheme["min_income"]:
#                 matched_rules.append(
#                     f"Income >= ₹{scheme['min_income']}"
#                 )
#             else:
#                 failed_rules.append(
#                     f"Income must be >= ₹{scheme['min_income']}"
#                 )

#     # 3. State eligibility
#     if "states" in scheme:
#         user_state = user_profile.get("state")

#         if user_state:
#             if user_state.lower() in [
#                 state.lower() for state in scheme["states"]
#             ]:
#                 matched_rules.append(
#                     f"State: {user_state}"
#                 )
#             else:
#                 failed_rules.append(
#                     "User state is not covered by this scheme"
#                 )

#     # 4. Category eligibility
#     if "categories" in scheme:
#         user_category = user_profile.get("category")

#         if user_category:
#             if user_category.lower() in [
#                 category.lower()
#                 for category in scheme["categories"]
#             ]:
#                 matched_rules.append(
#                     f"Category: {user_category}"
#                 )
#             else:
#                 failed_rules.append(
#                     "User category is not eligible"
#                 )

#     # 5. Business type eligibility
#     if "business_types" in scheme:
#         business_type = user_profile.get("business_type")

#         if business_type:
#             if business_type.lower() in [
#                 business.lower()
#                 for business in scheme["business_types"]
#             ]:
#                 matched_rules.append(
#                     f"Business type: {business_type}"
#                 )
#             else:
#                 failed_rules.append(
#                     "Business type is not covered by this scheme"
#                 )

#     # Final decision
#     if failed_rules:
#         status = "Not Eligible"
#     else:
#         status = "Eligible"

#     return {
#         "status": status,
#         "matched_rules": matched_rules,
#         "failed_rules": failed_rules
#     }

def check_eligibility(profile, scheme):
    matched_rules = []
    failed_rules = []

    # Income check
    income = profile.get("income")
    max_income = scheme.get("max_income")

    if income is not None and max_income is not None:
        if income <= max_income:
            matched_rules.append("Income is within the permitted limit.")
        else:
            failed_rules.append("Income exceeds the permitted limit.")

    # State check
    user_state = profile.get("state")
    allowed_states = scheme.get("states", [])

    if user_state and allowed_states:
        if user_state in allowed_states:
            matched_rules.append("User state is covered by the scheme.")
        else:
            failed_rules.append("User state is not covered by the scheme.")

    # Business type check
    business_type = profile.get("business_type")
    allowed_business_types = scheme.get("business_types", [])

    if business_type and allowed_business_types:
        if business_type in allowed_business_types:
            matched_rules.append("Business type is supported.")
        else:
            failed_rules.append("Business type is not supported.")

    # Project cost check
    project_cost = profile.get("project_cost")
    min_cost = scheme.get("min_project_cost")
    max_cost = scheme.get("max_project_cost")

    if project_cost is not None:

        if min_cost is not None and project_cost < min_cost:
            failed_rules.append(
                "Project cost is below the minimum permitted amount."
            )

        elif max_cost is not None and project_cost > max_cost:
            failed_rules.append(
                "Project cost exceeds the maximum permitted amount."
            )

        else:
            matched_rules.append(
                "Project cost is within the permitted range."
            )

    eligible = len(failed_rules) == 0

    return {
        "eligible": eligible,
        "matched_rules": matched_rules,
        "failed_rules": failed_rules
    }