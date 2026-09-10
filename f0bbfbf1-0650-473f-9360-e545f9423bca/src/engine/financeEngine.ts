import type { FinanceInput, FinanceResult, FinancialFeasibility } from '../types';

/**
 * Demo-Mode reference implementation — an exact arithmetic mirror of
 * Finance/emi.py and Finance/calculator.py. Switching to
 * POST /api/finance/calculate must not change a single number.
 */

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** calculate_emi(principal, annual_interest_rate, tenure_months) */
export function calculateEmi(
principal: number,
annualInterestRate: number,
tenureMonths: number)
: number {
  if (principal <= 0) return 0;
  if (tenureMonths <= 0) return 0;
  if (annualInterestRate === 0) return round2(principal / tenureMonths);
  const monthlyRate = annualInterestRate / (12 * 100);
  const growth = Math.pow(1 + monthlyRate, tenureMonths);
  return round2(principal * monthlyRate * growth / (growth - 1));
}

export interface LoanDetails {
  principal: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  total_repayment: number;
  total_interest: number;
}

/** calculate_loan_details(principal, annual_interest_rate, tenure_months) */
export function calculateLoanDetails(
principal: number,
annualInterestRate: number,
tenureMonths: number)
: LoanDetails {
  const emi = calculateEmi(principal, annualInterestRate, tenureMonths);
  if (emi === 0) {
    return {
      principal,
      interest_rate: annualInterestRate,
      tenure_months: tenureMonths,
      monthly_emi: 0,
      total_repayment: 0,
      total_interest: 0
    };
  }
  const totalRepayment = emi * tenureMonths;
  return {
    principal,
    interest_rate: annualInterestRate,
    tenure_months: tenureMonths,
    monthly_emi: round2(emi),
    total_repayment: round2(totalRepayment),
    total_interest: round2(totalRepayment - principal)
  };
}

/** calculate_financial_feasibility(monthly_income, emi) */
export function calculateFinancialFeasibility(
monthlyIncome: number,
emi: number)
: FinancialFeasibility {
  if (monthlyIncome <= 0) return { emi_ratio: null, feasibility: 'Unknown' };
  const ratio = emi / monthlyIncome * 100;
  const feasibility: FinancialFeasibility['feasibility'] =
  ratio <= 20 ? 'Comfortable' : ratio <= 40 ? 'Moderate' : 'High Burden';
  return { emi_ratio: round2(ratio), feasibility };
}

/** calculate_finance(...) plus the feasibility block. */
export function calculateFinance(input: FinanceInput): FinanceResult {
  const {
    project_cost,
    own_contribution,
    subsidy_percent,
    interest_rate,
    tenure_years,
    max_loan_amount,
    margin_percent,
    monthly_income
  } = input;

  if (project_cost < 0) throw new Error('project_cost cannot be negative');
  if (own_contribution < 0) throw new Error('own_contribution cannot be negative');
  if (subsidy_percent < 0) throw new Error('subsidy_percent cannot be negative');
  if (margin_percent < 0) throw new Error('margin_percent cannot be negative');
  if (max_loan_amount !== null && max_loan_amount < 0)
  throw new Error('max_loan_amount cannot be negative');

  const tenure_months = Math.max(1, Math.round(tenure_years * 12));

  const minimumOwnContribution = project_cost * margin_percent / 100;
  const marginRequirementMet = own_contribution >= minimumOwnContribution;

  let financeRequired = project_cost - own_contribution;
  if (financeRequired < 0) financeRequired = 0;

  const subsidyAmount = project_cost * subsidy_percent / 100;

  let amountAfterSubsidy = project_cost - subsidyAmount - own_contribution;
  if (amountAfterSubsidy < 0) amountAfterSubsidy = 0;

  const loanWithinLimit = max_loan_amount === null ? true : amountAfterSubsidy <= max_loan_amount;
  const finalLoanAmount = amountAfterSubsidy;
  const loan = calculateLoanDetails(finalLoanAmount, interest_rate, tenure_months);

  return {
    project_cost,
    own_contribution,
    minimum_own_contribution: round2(minimumOwnContribution),
    margin_percent,
    margin_requirement_met: marginRequirementMet,
    finance_required: financeRequired,
    subsidy_percent,
    subsidy_amount: round2(subsidyAmount),
    amount_after_subsidy: round2(amountAfterSubsidy),
    final_loan_amount: round2(finalLoanAmount),
    max_loan_amount,
    loan_within_limit: loanWithinLimit,
    interest_rate,
    tenure_months,
    estimated_emi: loan.monthly_emi,
    total_repayment: loan.total_repayment,
    total_interest: loan.total_interest,
    financial_feasibility: calculateFinancialFeasibility(monthly_income, loan.monthly_emi)
  };
}

/** Finance/rules.py::parse_subsidy_percent */
export function parseSubsidyPercent(value: string | null): number | [number, number] | null {
  if (value === null || value.trim() === '') return null;
  const range = value.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%?/);
  if (range) return [Number(range[1]), Number(range[2])];
  const single = value.match(/(\d+(?:\.\d+)?)\s*%?/);
  if (single) return Number(single[1]);
  return null;
}

/** Finance/rules.py::parse_numeric_interest_rate — descriptive text becomes null. */
export function parseInterestRate(value: string | null): number | null {
  if (value === null) return null;
  const m = value.trim().match(/^(\d+(?:\.\d+)?)\s*%?$/);
  return m ? Number(m[1]) : null;
}

/** A single usable rate for the calculator; ranges resolve to their floor. */
export function usableSubsidyPercent(value: string | null): number {
  const parsed = parseSubsidyPercent(value);
  if (parsed === null) return 0;
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

export function subsidyLabel(value: string | null): string {
  const parsed = parseSubsidyPercent(value);
  if (parsed === null) return 'Not specified';
  if (Array.isArray(parsed)) return `${parsed[0]}%–${parsed[1]}%`;
  return `${parsed}%`;
}