def _to_number(value):
    """Convert a rule value to int/float when possible."""
    try:
        number = float(value)
        return int(number) if number.is_integer() else number
    except (TypeError, ValueError):
        return None


def _normalize(value):
    """Normalize text for comparison."""
    return str(value).strip().lower()


def _compare(user_value, operator, rule_value):
    """Compare a profile value against a database rule value."""

    operator = _normalize(operator)

    # Numeric comparison
    user_number = _to_number(user_value)
    rule_number = _to_number(rule_value)

    if user_number is not None and rule_number is not None:
        if operator in ("=", "==", "eq"):
            return user_number == rule_number

        if operator in ("!=", "ne"):
            return user_number != rule_number

        if operator in (">", "gt"):
            return user_number > rule_number

        if operator in (">=", "gte"):
            return user_number >= rule_number

        if operator in ("<", "lt"):
            return user_number < rule_number

        if operator in ("<=", "lte"):
            return user_number <= rule_number

    # Text comparison
    user_text = _normalize(user_value)
    rule_text = _normalize(rule_value)

    if operator in ("=", "==", "eq"):
        return user_text == rule_text

    if operator in ("!=", "ne"):
        return user_text != rule_text

    if operator == "contains":
        return rule_text in user_text

    # IN operator
    # Example:
    # rule_value = "manufacturing,service"
    # user_value = "manufacturing"
    if operator == "in":
        allowed_values = [
            item.strip().lower()
            for item in str(rule_value).split(",")
        ]

        return user_text in allowed_values

    return False


def check_eligibility(profile, scheme, rules):
    """
    Check user eligibility using normalized eligibility rules
    retrieved from the database.

    Args:
        profile (dict): User profile.
        scheme (dict): Scheme information.
        rules (list): Eligibility rules from Supabase.

    Returns:
        dict: Eligibility result containing eligibility status,
              matched rules and failed rules.
    """

    matched_rules = []
    failed_rules = []

    for rule in rules:

        field = rule.get("field")
        operator = rule.get("operator")
        rule_value = rule.get("value")
        description = rule.get("description")

        if not field or not operator:
            continue

        user_value = profile.get(field)

        # Missing information is treated as a failed rule
        if user_value is None:
            failed_rules.append(
                description or f"Missing required information: {field}"
            )
            continue

        is_match = _compare(
            user_value,
            operator,
            rule_value
        )

        if is_match:
            matched_rules.append(
                description or f"{field} {operator} {rule_value}"
            )
        else:
            failed_rules.append(
                description or f"{field} does not satisfy the rule"
            )

    eligible = len(failed_rules) == 0

    return {
        "eligible": eligible,
        "matched_rules": matched_rules,
        "failed_rules": failed_rules
    }