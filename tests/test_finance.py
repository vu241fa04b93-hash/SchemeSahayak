from Finance.emi import calculate_emi, calculate_loan_details
from Finance.calculator import (
    calculate_finance,
    calculate_financial_feasibility,
    compare_financial_options,
)


def test_emi_calculation():
    emi = calculate_emi(
        principal=270000,
        annual_interest_rate=6,
        tenure_months=60
    )

    assert emi == 5219.86


def test_loan_details():
    result = calculate_loan_details(
        principal=195000,
        annual_interest_rate=6,
        tenure_months=60
    )

    assert result["monthly_emi"] == 3769.90
    assert result["total_repayment"] == 226194.00
    assert result["total_interest"] == 31194.00


def test_finance_calculation():
    result = calculate_finance(
        project_cost=300000,
        own_contribution=30000,
        interest_rate=6,
        tenure_months=60,
        max_loan_amount=500000,
        subsidy_percent=25,
        margin_percent=10
    )

    assert result["final_loan_amount"] == 195000.00
    assert result["subsidy_amount"] == 75000.00
    assert result["loan_within_limit"] is True
    assert result["margin_requirement_met"] is True


def test_margin_requirement_failure():
    result = calculate_finance(
        project_cost=300000,
        own_contribution=20000,
        interest_rate=6,
        tenure_months=60,
        margin_percent=10
    )

    assert result["margin_requirement_met"] is False


def test_loan_limit_failure():
    result = calculate_finance(
        project_cost=1000000,
        own_contribution=100000,
        interest_rate=6,
        tenure_months=60,
        max_loan_amount=500000
    )

    assert result["loan_within_limit"] is False


def test_financial_feasibility():
    result = calculate_financial_feasibility(
        monthly_income=20000,
        emi=4000
    )

    assert result["emi_ratio"] == 20
    assert result["feasibility"] == "Comfortable"


def test_financial_feasibility_high_burden():
    result = calculate_financial_feasibility(
        monthly_income=10000,
        emi=5000
    )

    assert result["emi_ratio"] == 50
    assert result["feasibility"] == "High Burden"


def test_compare_financial_options():
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

    results = compare_financial_options(options)

    assert len(results) == 2
    assert results[0]["scheme_name"] == "Scheme A"
    assert results[1]["scheme_name"] == "Scheme B"