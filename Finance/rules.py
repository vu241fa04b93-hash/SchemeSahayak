import re


def parse_subsidy_percent(value):
    """
    Parse subsidy percentage from database value.

    Examples:
        "25%" -> 25
        "15-35%" -> (15, 35)
        25 -> 25
        None -> None
    """

    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    value = str(value).strip()

    # Range such as "15-35%"
    range_match = re.fullmatch(
        r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%",
        value
    )

    if range_match:
        return (
            float(range_match.group(1)),
            float(range_match.group(2))
        )

    # Single percentage such as "25%"
    single_match = re.fullmatch(
        r"(\d+(?:\.\d+)?)\s*%",
        value
    )

    if single_match:
        return float(single_match.group(1))

    return None


def parse_numeric_interest_rate(value):
    """
    Return numeric interest rate when explicitly available.

    Descriptive values such as:
        "Normal Bank Rate"

    are returned as None because we should not
    invent an interest rate.
    """

    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    value = str(value).strip()

    match = re.fullmatch(
        r"(\d+(?:\.\d+)?)\s*%?",
        value
    )

    if match:
        return float(match.group(1))

    return None


def parse_financial_rule(rule):
    """
    Convert one Supabase financial_rules row
    into values usable by the finance calculator.
    """

    return {
        "min_project_cost": rule.get("min_project_cost"),
        "max_project_cost": rule.get("max_project_cost"),
        "max_loan_amount": rule.get("max_loan_amount"),
        "subsidy_percent": parse_subsidy_percent(
            rule.get("subsidy_percent")
        ),
        "interest_rate": parse_numeric_interest_rate(
            rule.get("interest_rate")
        ),
        "maximum_tenure_months": rule.get(
            "maximum_tenure_months"
        ),
        "margin_percent": rule.get("margin_percent"),
        "source_document": rule.get("source_document"),
        "source_page": rule.get("source_page"),
        "last_verified": rule.get("last_verified")
    }