from Finance.emi import calculate_emi, calculate_loan_details
from Finance.rules import parse_financial_rule
from database.database import get_financial_rules


def get_scheme_financial_rules(scheme_id):
    """
    Fetch and parse financial rules for a scheme
    from Supabase.
    """

    rules = get_financial_rules(scheme_id)

    if not rules:
        raise ValueError(
            f"No financial rules found for scheme {scheme_id}"
        )

    return parse_financial_rule(rules[0])


def calculate_finance(
    project_cost,
    own_contribution,
    interest_rate=0,
    tenure_months=60,
    max_loan_amount=None,
    subsidy_percent=0,
    margin_percent=0
):
    """
    Calculate financing requirement, subsidy, margin,
    loan limit, EMI and basic financial details.
    """

    if project_cost < 0:
        raise ValueError("Project cost cannot be negative.")

    if own_contribution < 0:
        raise ValueError("Own contribution cannot be negative.")

    if subsidy_percent < 0:
        raise ValueError("Subsidy percentage cannot be negative.")

    if margin_percent < 0:
        raise ValueError("Margin percentage cannot be negative.")

    if max_loan_amount is not None and max_loan_amount < 0:
        raise ValueError("Maximum loan amount cannot be negative.")

    # Minimum own contribution required by the scheme
    minimum_own_contribution = (
        project_cost * margin_percent / 100
    )

    margin_requirement_met = (
        own_contribution >= minimum_own_contribution
    )

    # Calculate finance required before subsidy
    finance_required = project_cost - own_contribution

    if finance_required < 0:
        finance_required = 0

    # Calculate subsidy
    subsidy_amount = (
        project_cost * subsidy_percent / 100
    )

    # Amount remaining after subsidy and own contribution
    amount_after_subsidy = (
        project_cost
        - subsidy_amount
        - own_contribution
    )

    if amount_after_subsidy < 0:
        amount_after_subsidy = 0

    # Check maximum loan limit
    loan_within_limit = True

    if max_loan_amount is not None:
        loan_within_limit = (
            amount_after_subsidy <= max_loan_amount
        )

    # Final loan requirement
    final_loan_amount = amount_after_subsidy

    # Calculate loan details
    loan_details = calculate_loan_details(
        final_loan_amount,
        interest_rate,
        tenure_months
    )

    estimated_emi = loan_details["monthly_emi"]

    return {
        "project_cost": project_cost,
        "own_contribution": own_contribution,
        "minimum_own_contribution": round(
            minimum_own_contribution, 2
        ),
        "margin_percent": margin_percent,
        "margin_requirement_met": margin_requirement_met,
        "finance_required": finance_required,
        "subsidy_percent": subsidy_percent,
        "subsidy_amount": round(
            subsidy_amount, 2
        ),
        "amount_after_subsidy": round(
            amount_after_subsidy, 2
        ),
        "final_loan_amount": round(
            final_loan_amount, 2
        ),
        "max_loan_amount": max_loan_amount,
        "loan_within_limit": loan_within_limit,
        "interest_rate": interest_rate,
        "tenure_months": tenure_months,
        "estimated_emi": estimated_emi,
        "total_repayment": loan_details["total_repayment"],
        "total_interest": loan_details["total_interest"]
    }


def calculate_finance_for_scheme(
    scheme_id,
    project_cost,
    own_contribution,
    subsidy_percent=None,
    interest_rate=None,
    tenure_months=None
):
    """
    Calculate finance using financial rules retrieved
    from Supabase for a specific scheme.

    Note:
    Some schemes contain ranges or descriptive values
    instead of exact numeric subsidy/interest rates.
    In those cases, the caller must provide the exact
    numeric value when required.
    """

    rules = get_scheme_financial_rules(scheme_id)

    # Use database value when it is a single numeric subsidy.
    # If the database contains a range such as (15, 35),
    # an exact value must be supplied by the caller.
    if subsidy_percent is None:
        db_subsidy = rules["subsidy_percent"]

        if isinstance(db_subsidy, (int, float)):
            subsidy_percent = db_subsidy
        else:
            subsidy_percent = 0

    # Use database interest rate only when it is numeric.
    # Descriptive values such as "Normal Bank Rate" become None.
    if interest_rate is None:
        interest_rate = rules["interest_rate"]

    # EMI cannot be calculated from an unspecified interest rate.
    # Use 0 so the existing calculator remains safe.
    if interest_rate is None:
        interest_rate_for_calculation = 0
    else:
        interest_rate_for_calculation = interest_rate

    # Use database maximum tenure when available.
    if tenure_months is None:
        tenure_months = rules["maximum_tenure_months"]

    if tenure_months is None:
        tenure_months = 60

    result = calculate_finance(
        project_cost=project_cost,
        own_contribution=own_contribution,
        interest_rate=interest_rate_for_calculation,
        tenure_months=tenure_months,
        max_loan_amount=rules["max_loan_amount"],
        subsidy_percent=subsidy_percent,
        margin_percent=rules["margin_percent"] or 0
    )

    # Add scheme/database information
    result["scheme_id"] = scheme_id
    result["database_subsidy_percent"] = rules["subsidy_percent"]
    result["database_interest_rate"] = rules["interest_rate"]
    result["source_document"] = rules["source_document"]
    result["source_page"] = rules["source_page"]
    result["last_verified"] = rules["last_verified"]

    # Tell the caller whether exact values were available.
    result["interest_rate_available"] = (
        rules["interest_rate"] is not None
    )

    result["subsidy_rate_exact"] = isinstance(
        rules["subsidy_percent"],
        (int, float)
    )

    return result


def calculate_financial_feasibility(monthly_income, emi):
    """
    Estimate repayment burden based on monthly income.
    """

    if monthly_income <= 0:
        return {
            "emi_ratio": None,
            "feasibility": "Unknown"
        }

    emi_ratio = (emi / monthly_income) * 100

    if emi_ratio <= 20:
        feasibility = "Comfortable"
    elif emi_ratio <= 40:
        feasibility = "Moderate"
    else:
        feasibility = "High Burden"

    return {
        "emi_ratio": round(emi_ratio, 2),
        "feasibility": feasibility
    }


def compare_financial_options(options):
    """
    Compare financial results for multiple schemes.

    Each option should contain:
        scheme_name
        project_cost
        own_contribution
        interest_rate
        tenure_months

    Optional:
        max_loan_amount
        subsidy_percent
        margin_percent
    """

    results = []

    for option in options:

        result = calculate_finance(
            project_cost=option["project_cost"],
            own_contribution=option["own_contribution"],
            interest_rate=option.get("interest_rate", 0),
            tenure_months=option.get("tenure_months", 60),
            max_loan_amount=option.get("max_loan_amount"),
            subsidy_percent=option.get("subsidy_percent", 0),
            margin_percent=option.get("margin_percent", 0)
        )

        result["scheme_name"] = option["scheme_name"]

        results.append(result)

    return results


if __name__ == "__main__":

    options = [
        {
            "scheme_name": "Scheme A",
            "project_cost": 300000,
            "own_contribution": 30000,
            "interest_rate": 6,
            "tenure_months": 60,
            "max_loan_amount": 500000,
            "subsidy_percent": 25,
            "margin_percent": 10
        },
        {
            "scheme_name": "Scheme B",
            "project_cost": 300000,
            "own_contribution": 30000,
            "interest_rate": 8,
            "tenure_months": 60,
            "max_loan_amount": 500000,
            "subsidy_percent": 10,
            "margin_percent": 10
        }
    ]

    comparison = compare_financial_options(options)

    for result in comparison:
        print(result)