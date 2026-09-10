import type {
  ApplicantProfile,
  Criterion,
  EligibilityRule,
  EligibilityStatus,
  FinancialRule,
  Scheme,
  SchemeMatch } from
'../types';
import { eligibilityRules, financialRules, schemes } from '../data/schemes';
import { formatINR } from '../utils/format';
import { usableSubsidyPercent, parseInterestRate } from './financeEngine';

/**
 * Demo-Mode reference implementation of POST /api/schemes/match.
 * Reads each rule literally — field, operator, value — and layers the
 * financial_rules ceilings on top. This doubles as the executable
 * specification for the FastAPI evaluator.
 */

export const FIELD_LABELS: Record<string, string> = {
  age: 'Age',
  annual_income: 'Annual income',
  monthly_income: 'Monthly income',
  business_type: 'Business type',
  education: 'Education',
  is_new_unit: 'New unit',
  is_greenfield: 'Greenfield enterprise',
  capital_expenditure: 'Capital expenditure',
  previous_subsidy: 'Previous government subsidy',
  category: 'Social category',
  ownership_percent: 'Ownership share',
  loan_amount: 'Loan requirement',
  enterprise_status: 'Enterprise status',
  enterprise_size: 'Enterprise size',
  has_collateral: 'Collateral offered',
  has_third_party_guarantee: 'Third-party guarantee',
  state: 'State',
  district: 'District',
  project_cost: 'Project cost',
  own_contribution: 'Own contribution'
};

const EDUCATION_ORDER = ['below8th', '8th', '10th', '12th', 'diploma', 'graduate'];

const MONEY_FIELDS = new Set([
'loan_amount',
'project_cost',
'own_contribution',
'annual_income',
'monthly_income',
'capital_expenditure']
);

export function loanRequirement(p: ApplicantProfile): number | undefined {
  if (p.project_cost === undefined) return undefined;
  return Math.max(p.project_cost - (p.own_contribution ?? 0), 0);
}

/** Category widens to include "Women" when the applicant is a woman. */
function categoryTokens(p: ApplicantProfile): string[] {
  const out: string[] = [];
  if (p.category) out.push(p.category);
  if (p.gender === 'female') out.push('Women');
  return out;
}

function resolveValue(field: string, p: ApplicantProfile): unknown {
  switch (field) {
    case 'loan_amount':
      return loanRequirement(p);
    case 'annual_income':
      return p.monthly_income !== undefined ? p.monthly_income * 12 : undefined;
    case 'capital_expenditure':
      return p.project_cost;
    case 'is_new_unit':
    case 'is_greenfield':
      return p.enterprise_status ? p.enterprise_status === 'new' : undefined;
    case 'ownership_percent':
      return p.ownership_percent ?? 100;
    case 'category':
      return categoryTokens(p);
    default:
      return (p as unknown as Record<string, unknown>)[field];
  }
}

function display(field: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not provided';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (MONEY_FIELDS.has(field)) return formatINR(value);
    if (field === 'ownership_percent') return `${value}%`;
    return String(value);
  }
  return String(value);
}

function requirementText(rule: EligibilityRule): string {
  const label = FIELD_LABELS[rule.field] ?? rule.field;
  const n = Number(rule.value);
  const v = MONEY_FIELDS.has(rule.field) && Number.isFinite(n) ? formatINR(n) : rule.value;
  switch (rule.operator) {
    case 'none':
      return 'No restriction';
    case 'in':
      return `One of ${rule.value.split(',').join(', ')}`;
    case '==':
      return `${label} must be ${rule.value === 'true' ? 'Yes' : rule.value === 'false' ? 'No' : rule.value}`;
    case '>=':
      return `${label} at least ${v}`;
    case '<=':
      return `${label} at most ${v}`;
    case '>':
      return `${label} more than ${v}`;
    case '<':
      return `${label} less than ${v}`;
    default:
      return rule.value;
  }
}

function compare(a: number, op: string, b: number): boolean {
  if (op === '>=') return a >= b;
  if (op === '<=') return a <= b;
  if (op === '>') return a > b;
  if (op === '<') return a < b;
  return false;
}

function evaluateRule(rule: EligibilityRule, p: ApplicantProfile): Criterion {
  const label = FIELD_LABELS[rule.field] ?? rule.field;
  const base = {
    rule_id: rule.rule_id,
    field: rule.field,
    label,
    scheme_requirement: requirementText(rule),
    description: rule.description
  };

  if (rule.operator === 'none') {
    return { ...base, applicant_value: 'Not applicable', status: 'passed' };
  }

  const raw = resolveValue(rule.field, p);
  const missing =
  raw === undefined || raw === null || raw === '' || Array.isArray(raw) && raw.length === 0;

  // A missing answer is "information needed", never a false rejection.
  if (missing) return { ...base, applicant_value: 'Not provided', status: 'unknown' };

  let ok = false;
  if (rule.operator === 'in') {
    const allowed = rule.value.split(',').map((v) => v.trim().toLowerCase());
    const provided = (Array.isArray(raw) ? raw : [raw]).map((v) => String(v).trim().toLowerCase());
    ok = provided.some((v) => allowed.includes(v));
  } else if (rule.operator === '==') {
    ok = String(raw).trim().toLowerCase() === rule.value.trim().toLowerCase();
  } else if (rule.field === 'education') {
    const a = EDUCATION_ORDER.indexOf(String(raw));
    const b = EDUCATION_ORDER.indexOf(rule.value);
    ok = a >= 0 && b >= 0 ? compare(a, rule.operator, b) : false;
  } else {
    const a = Number(raw);
    const b = Number(rule.value);
    ok = Number.isFinite(a) && Number.isFinite(b) ? compare(a, rule.operator, b) : false;
  }

  return {
    ...base,
    applicant_value: display(rule.field, raw),
    status: ok ? 'passed' : 'failed'
  };
}

function financialCriteria(fr: FinancialRule, p: ApplicantProfile): Criterion[] {
  const out: Criterion[] = [];
  const cost = p.project_cost;
  const loan = loanRequirement(p);

  const push = (
  id: string,
  field: string,
  value: unknown,
  requirement: string,
  ok: boolean | undefined,
  description: string) =>

  out.push({
    rule_id: id,
    field,
    label: FIELD_LABELS[field] ?? field,
    applicant_value: display(field, value),
    scheme_requirement: requirement,
    status: ok === undefined ? 'unknown' : ok ? 'passed' : 'failed',
    description
  });

  if (fr.max_project_cost !== null)
  push(
    `${fr.financial_rule_id}-cost`,
    'project_cost',
    cost,
    `Project cost at most ${formatINR(fr.max_project_cost)}`,
    cost === undefined ? undefined : cost <= fr.max_project_cost,
    'Maximum project outlay supported by this scheme'
  );

  if (fr.max_loan_amount !== null)
  push(
    `${fr.financial_rule_id}-loan`,
    'loan_amount',
    loan,
    `Loan at most ${formatINR(fr.max_loan_amount)}`,
    loan === undefined ? undefined : loan <= fr.max_loan_amount,
    'Maximum credit that can be sanctioned under this scheme'
  );

  if (fr.margin_percent) {
    const min = cost !== undefined ? cost * fr.margin_percent / 100 : undefined;
    push(
      `${fr.financial_rule_id}-margin`,
      'own_contribution',
      p.own_contribution,
      `At least ${fr.margin_percent}% of project cost${min !== undefined ? ` (${formatINR(min)})` : ''}`,
      p.own_contribution === undefined || min === undefined ?
      undefined :
      p.own_contribution >= min,
      'Beneficiary margin the applicant must bring in'
    );
  }

  return out;
}

function buildRemedies(criteria: Criterion[], scheme: Scheme): string[] {
  const out: string[] = [];
  for (const c of criteria.filter((x) => x.status === 'failed')) {
    switch (c.field) {
      case 'loan_amount':
        out.push(
          `Your loan requirement does not sit inside this scheme's band — ${c.scheme_requirement}. Adjust your own contribution or project cost, or see schemes with a lower floor.`
        );
        break;
      case 'project_cost':
        out.push(`Project cost is outside the supported range — ${c.scheme_requirement}. Re-scope the project or apply under a scheme sized for this outlay.`);
        break;
      case 'own_contribution':
        out.push(`Bring in more margin money — ${c.scheme_requirement}. A larger contribution also lowers your EMI.`);
        break;
      case 'category':
        out.push(`${scheme.short_name} is reserved for ${c.scheme_requirement.replace('One of ', '')}. Schemes without a category restriction are shown in your results.`);
        break;
      case 'business_type':
        out.push(`This scheme covers ${c.scheme_requirement.replace('One of ', '')} only.`);
        break;
      case 'state':
        out.push(`This is a state scheme for ${c.scheme_requirement.replace('One of ', '')}. The central schemes in your results remain open to you.`);
        break;
      case 'previous_subsidy':
        out.push('Having already taken a government subsidy blocks this scheme. Schemes without that restriction remain open.');
        break;
      case 'has_collateral':
      case 'has_third_party_guarantee':
        out.push('This cover applies only where the lender takes no collateral or third-party guarantee. Ask your branch to appraise the facility on a collateral-free basis.');
        break;
      default:
        out.push(`${c.label}: ${c.scheme_requirement}. Your answer is "${c.applicant_value}".`);
    }
  }
  return Array.from(new Set(out));
}

function buildReasons(criteria: Criterion[], fr: FinancialRule | null, scheme: Scheme): string[] {
  const out = criteria.
  filter((c) => c.status === 'passed' && c.applicant_value !== 'Not applicable').
  slice(0, 4).
  map((c) => `${c.label} — ${c.applicant_value} meets ${c.scheme_requirement.toLowerCase()}.`);

  if (fr) {
    const subsidy = usableSubsidyPercent(fr.subsidy_percent);
    if (subsidy > 0)
    out.push(`${scheme.short_name} carries a capital subsidy, which reduces the amount you borrow.`);
    const rate = parseInterestRate(fr.interest_rate);
    if (rate !== null && rate <= 7)
    out.push(`Concessional interest rate of ${rate}% keeps the monthly EMI low.`);
  }
  return out;
}

function scoreMatch(criteria: Criterion[], fr: FinancialRule | null, p: ApplicantProfile): number {
  const total = criteria.length || 1;
  const passed = criteria.filter((c) => c.status === 'passed').length;
  const unknown = criteria.filter((c) => c.status === 'unknown').length;
  let score = (passed + unknown * 0.5) / total;

  if (fr) {
    const loan = loanRequirement(p);
    if (loan !== undefined && fr.max_loan_amount) {
      const ratio = loan / fr.max_loan_amount;
      if (ratio > 0 && ratio <= 1) score += 0.08 * (0.4 + 0.6 * Math.min(ratio * 2, 1));else
      if (ratio > 1) score -= 0.06;
    }
    const subsidy = usableSubsidyPercent(fr.subsidy_percent);
    if (subsidy > 0) score += 0.06 * Math.min(subsidy / 35, 1);
    const rate = parseInterestRate(fr.interest_rate);
    if (rate !== null) score += 0.04 * Math.max(0, 1 - rate / 15);
  }

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

export function evaluateScheme(
scheme: Scheme,
rules: EligibilityRule[],
fr: FinancialRule | null,
profile: ApplicantProfile)
: SchemeMatch {
  const criteria = [
  ...rules.map((r) => evaluateRule(r, profile)),
  ...(fr ? financialCriteria(fr, profile) : [])];


  const failed = criteria.filter((c) => c.status === 'failed').length;
  const unknown = criteria.filter((c) => c.status === 'unknown').length;
  const status: EligibilityStatus =
  failed > 0 ? 'not_eligible' : unknown > 0 ? 'partial' : 'eligible';

  return {
    scheme_id: scheme.scheme_id,
    scheme,
    financial_rule: fr,
    status,
    match_score: scoreMatch(criteria, fr, profile),
    criteria,
    reasons: buildReasons(criteria, fr, scheme),
    remedies: buildRemedies(criteria, scheme)
  };
}

const RANK: Record<EligibilityStatus, number> = { eligible: 0, partial: 1, not_eligible: 2 };

export function matchSchemes(profile: ApplicantProfile): SchemeMatch[] {
  return schemes.
  map((s) =>
  evaluateScheme(
    s,
    eligibilityRules.filter((r) => r.scheme_id === s.scheme_id),
    financialRules.find((f) => f.scheme_id === s.scheme_id) ?? null,
    profile
  )
  ).
  sort((a, b) => RANK[a.status] - RANK[b.status] || b.match_score - a.match_score);
}