/** Field names mirror the SchemeSahayak CSV / Supabase columns exactly. */

export type Language = 'en' | 'te' | 'hi' | 'ta' | 'kn';
export type RuleOperator = '>=' | '<=' | '>' | '<' | '==' | 'in' | 'none';
export type EligibilityStatus = 'eligible' | 'partial' | 'not_eligible';
export type CriterionStatus = 'passed' | 'failed' | 'unknown';
export type ConnectionMode = 'connected' | 'demo';

export interface Scheme {
  scheme_id: string;
  scheme_name: string;
  short_name: string;
  description: string;
  target_beneficiaries: string;
  business_types: string[];
  states: string[];
  official_source: string;
  source_url: string;
  last_verified: string;
}

export interface EligibilityRule {
  rule_id: string;
  scheme_id: string;
  rule_type: string;
  field: string;
  operator: RuleOperator;
  value: string;
  description: string;
}

export interface FinancialRule {
  financial_rule_id: string;
  scheme_id: string;
  min_project_cost: number | null;
  max_project_cost: number | null;
  max_loan_amount: number | null;
  /** raw column text, e.g. "15-35", "25", "0" */
  subsidy_percent: string | null;
  /** raw column text, e.g. "8.5" or "Normal Bank Rate" */
  interest_rate: string | null;
  maximum_tenure_months: number | null;
  margin_percent: number | null;
}

export interface SchemeDocument {
  document_id: string;
  scheme_id: string;
  document_name: string;
  mandatory: 'yes' | 'conditional';
  description: string;
}

export interface ChannelPartner {
  partner_id: string;
  scheme_ids: string[];
  name: string;
  partner_type: string;
  address: string;
  district: string;
  state: string;
  phone: string;
  hours: string;
}

export interface ApplicantProfile {
  full_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'Minority';
  education?: string;
  state?: string;
  district?: string;
  business_type?: string;
  trade?: string;
  enterprise_status?: 'new' | 'existing';
  enterprise_size?: 'micro' | 'small' | 'medium';
  ownership_percent?: number;
  previous_subsidy?: boolean;
  has_collateral?: boolean;
  has_third_party_guarantee?: boolean;
  project_cost?: number;
  own_contribution?: number;
  monthly_income?: number;
  preferred_tenure_years?: number;
  updated_at?: string;
}

export const REQUIRED_PROFILE_FIELDS: (keyof ApplicantProfile)[] = [
'age',
'gender',
'category',
'state',
'district',
'business_type',
'enterprise_status',
'project_cost',
'own_contribution',
'monthly_income'];


export interface Criterion {
  rule_id: string;
  field: string;
  label: string;
  applicant_value: string;
  scheme_requirement: string;
  status: CriterionStatus;
  description: string;
}

/** Mirrors Finance/calculator.py::calculate_finance. */
export interface FinanceResult {
  project_cost: number;
  own_contribution: number;
  minimum_own_contribution: number;
  margin_percent: number;
  margin_requirement_met: boolean;
  finance_required: number;
  subsidy_percent: number;
  subsidy_amount: number;
  amount_after_subsidy: number;
  final_loan_amount: number;
  max_loan_amount: number | null;
  loan_within_limit: boolean;
  interest_rate: number;
  tenure_months: number;
  estimated_emi: number;
  total_repayment: number;
  total_interest: number;
  financial_feasibility: FinancialFeasibility;
}

export interface FinancialFeasibility {
  emi_ratio: number | null;
  feasibility: 'Comfortable' | 'Moderate' | 'High Burden' | 'Unknown';
}

export interface FinanceInput {
  project_cost: number;
  own_contribution: number;
  subsidy_percent: number;
  interest_rate: number;
  tenure_years: number;
  max_loan_amount: number | null;
  margin_percent: number;
  monthly_income: number;
}

export interface SchemeMatch {
  scheme_id: string;
  scheme: Scheme;
  financial_rule: FinancialRule | null;
  status: EligibilityStatus;
  match_score: number;
  criteria: Criterion[];
  reasons: string[];
  remedies: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  created_at: string;
}

export interface AiChatResponse {
  reply: string;
  extracted: Partial<ApplicantProfile>;
  missing: string[];
}