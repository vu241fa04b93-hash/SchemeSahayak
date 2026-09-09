def calculate_emi(principal, annual_interest_rate, tenure_months):
    """
    Calculate monthly EMI.

    principal: Loan amount
    annual_interest_rate: Annual interest rate in percentage
    tenure_months: Loan tenure in months
    """

    if principal <= 0:
        return 0

    if tenure_months <= 0:
        return 0

    if annual_interest_rate == 0:
        return round(principal / tenure_months, 2)

    monthly_rate = annual_interest_rate / (12 * 100)

    emi = (
        principal
        * monthly_rate
        * (1 + monthly_rate) ** tenure_months
    ) / (
        (1 + monthly_rate) ** tenure_months - 1
    )

    return round(emi, 2)


def calculate_loan_details(
    principal,
    annual_interest_rate,
    tenure_months
):
    """
    Calculate EMI, total repayment and total interest.
    """

    emi = calculate_emi(
        principal,
        annual_interest_rate,
        tenure_months
    )

    if emi == 0:
        return {
            "principal": principal,
            "interest_rate": annual_interest_rate,
            "tenure_months": tenure_months,
            "monthly_emi": 0,
            "total_repayment": 0,
            "total_interest": 0
        }

    total_repayment = emi * tenure_months
    total_interest = total_repayment - principal

    return {
        "principal": principal,
        "interest_rate": annual_interest_rate,
        "tenure_months": tenure_months,
        "monthly_emi": round(emi, 2),
        "total_repayment": round(total_repayment, 2),
        "total_interest": round(total_interest, 2)
    }


if __name__ == "__main__":

    details = calculate_loan_details(
        principal=270000,
        annual_interest_rate=6,
        tenure_months=60
    )

    print(details)