import type {
  ChannelPartner,
  EligibilityRule,
  FinancialRule,
  Scheme,
  SchemeDocument } from
'../types';

/**
 * Seed catalogue in the exact schema of the SchemeSahayak repo.
 * S001–S003 and rules R001–R019 are the repo's rows verbatim; the rest are
 * real Indian schemes seeded in the same shape so every verdict bucket is
 * genuinely exercised. Replaced wholesale by GET /api/schemes when live.
 */

export const schemes: Scheme[] = [
{
  scheme_id: 'S001',
  scheme_name: "Prime Minister's Employment Generation Programme (PMEGP)",
  short_name: 'PMEGP',
  description:
  'Credit-linked subsidy for setting up new micro enterprises in manufacturing and service sectors.',
  target_beneficiaries: 'New entrepreneurs',
  business_types: ['manufacturing', 'service'],
  states: ['All India'],
  official_source: 'Ministry of MSME / KVIC',
  source_url: 'https://www.kviconline.gov.in/pmegp/',
  last_verified: '2026-07-18'
},
{
  scheme_id: 'S002',
  scheme_name: 'Stand-Up India',
  short_name: 'Stand-Up India',
  description:
  'Bank loans of ₹10 lakh to ₹1 crore for greenfield enterprises led by SC/ST and women entrepreneurs.',
  target_beneficiaries: 'SC/ST entrepreneurs and women entrepreneurs',
  business_types: ['manufacturing', 'service', 'trading'],
  states: ['All India'],
  official_source: 'Stand-Up India, Dept. of Financial Services',
  source_url: 'https://www.standupmitra.in/',
  last_verified: '2026-07-18'
},
{
  scheme_id: 'S003',
  scheme_name: 'Credit Guarantee Fund Scheme for Micro and Small Enterprises (CGS-I)',
  short_name: 'CGTMSE',
  description:
  'Guarantee cover for collateral-free credit extended to micro and small enterprises.',
  target_beneficiaries: 'New and existing micro and small enterprises',
  business_types: ['manufacturing', 'service', 'trading', 'education/training'],
  states: ['All India'],
  official_source: 'CGTMSE',
  source_url: 'https://www.cgtmse.in/',
  last_verified: '2026-07-18'
},
{
  scheme_id: 'S004',
  scheme_name: 'Pradhan Mantri MUDRA Yojana — Shishu',
  short_name: 'MUDRA Shishu',
  description: 'Collateral-free loans up to ₹50,000 for the smallest income-generating activities.',
  target_beneficiaries: 'Micro entrepreneurs and first-time borrowers',
  business_types: ['manufacturing', 'service', 'trading', 'agriculture'],
  states: ['All India'],
  official_source: 'MUDRA, Government of India',
  source_url: 'https://www.mudra.org.in/',
  last_verified: '2026-06-30'
},
{
  scheme_id: 'S005',
  scheme_name: 'Pradhan Mantri MUDRA Yojana — Kishore',
  short_name: 'MUDRA Kishore',
  description: 'Collateral-free loans above ₹50,000 and up to ₹5 lakh for growing micro units.',
  target_beneficiaries: 'Micro and small enterprises',
  business_types: ['manufacturing', 'service', 'trading', 'agriculture'],
  states: ['All India'],
  official_source: 'MUDRA, Government of India',
  source_url: 'https://www.mudra.org.in/',
  last_verified: '2026-06-30'
},
{
  scheme_id: 'S006',
  scheme_name: 'PM Street Vendor AtmaNirbhar Nidhi (PM SVANidhi)',
  short_name: 'PM SVANidhi',
  description:
  'Working capital loans for street vendors with a 7% interest subsidy on timely repayment.',
  target_beneficiaries: 'Urban street vendors with a certificate of vending',
  business_types: ['trading', 'service'],
  states: ['All India'],
  official_source: 'Ministry of Housing and Urban Affairs',
  source_url: 'https://pmsvanidhi.mohua.gov.in/',
  last_verified: '2026-05-22'
},
{
  scheme_id: 'S007',
  scheme_name: 'PM Vishwakarma',
  short_name: 'PM Vishwakarma',
  description:
  'Skill training, toolkit incentive and collateral-free credit up to ₹3 lakh at 5% for traditional artisans.',
  target_beneficiaries: 'Artisans and craftspeople in 18 recognised trades',
  business_types: ['manufacturing', 'service'],
  states: ['All India'],
  official_source: 'Ministry of MSME',
  source_url: 'https://pmvishwakarma.gov.in/',
  last_verified: '2026-06-12'
},
{
  scheme_id: 'S008',
  scheme_name: 'NABARD Dairy Entrepreneurship Development Scheme',
  short_name: 'NABARD DEDS',
  description: 'Capital subsidy for dairy units, milk processing and cold chain in rural areas.',
  target_beneficiaries: 'Farmers, dairy entrepreneurs and self-help groups',
  business_types: ['agriculture'],
  states: ['All India'],
  official_source: 'NABARD',
  source_url: 'https://www.nabard.org/',
  last_verified: '2026-04-09'
},
{
  scheme_id: 'S009',
  scheme_name: 'Andhra Pradesh MSME Investment Subsidy',
  short_name: 'AP MSME Subsidy',
  description:
  'State capital investment subsidy, power cost reimbursement and interest subvention for new MSME units in Andhra Pradesh.',
  target_beneficiaries: 'New MSME units located in Andhra Pradesh',
  business_types: ['manufacturing', 'service'],
  states: ['Andhra Pradesh'],
  official_source: 'AP Department of Industries and Commerce',
  source_url: 'https://apindustries.gov.in/',
  last_verified: '2026-03-27'
},
{
  scheme_id: 'S010',
  scheme_name: 'Special Credit Linked Capital Subsidy Scheme for SC/ST MSMEs',
  short_name: 'SCLCSS',
  description: '25% capital subsidy on plant and machinery for SC/ST-owned MSMEs.',
  target_beneficiaries: 'SC/ST-owned micro, small and medium enterprises',
  business_types: ['manufacturing'],
  states: ['All India'],
  official_source: 'Ministry of MSME',
  source_url: 'https://msme.gov.in/',
  last_verified: '2026-05-02'
}];


export const eligibilityRules: EligibilityRule[] = [
{ rule_id: 'R001', scheme_id: 'S001', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Minimum age' },
{ rule_id: 'R002', scheme_id: 'S001', rule_type: 'income', field: 'annual_income', operator: 'none', value: '', description: 'No income ceiling' },
{ rule_id: 'R003', scheme_id: 'S001', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service', description: 'Eligible sectors' },
{ rule_id: 'R004', scheme_id: 'S001', rule_type: 'education', field: 'education', operator: '>=', value: '8th', description: 'Required for higher project cost' },
{ rule_id: 'R005', scheme_id: 'S001', rule_type: 'new_unit', field: 'is_new_unit', operator: '==', value: 'true', description: 'Only new units are eligible' },
{ rule_id: 'R006', scheme_id: 'S001', rule_type: 'capital_expenditure', field: 'capital_expenditure', operator: '>', value: '0', description: 'Projects must include capital expenditure' },
{ rule_id: 'R007', scheme_id: 'S001', rule_type: 'government_subsidy', field: 'previous_subsidy', operator: '==', value: 'false', description: 'No previous government subsidy' },

{ rule_id: 'R008', scheme_id: 'S002', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Applicant must be at least 18 years old' },
{ rule_id: 'R009', scheme_id: 'S002', rule_type: 'category', field: 'category', operator: 'in', value: 'SC,ST,Women', description: 'Applicant must be SC/ST or a woman entrepreneur' },
{ rule_id: 'R010', scheme_id: 'S002', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service,trading', description: 'Eligible business sectors' },
{ rule_id: 'R011', scheme_id: 'S002', rule_type: 'enterprise_type', field: 'is_greenfield', operator: '==', value: 'true', description: 'Only greenfield enterprises are eligible' },
{ rule_id: 'R012', scheme_id: 'S002', rule_type: 'ownership', field: 'ownership_percent', operator: '>=', value: '51', description: 'Applicant must hold at least 51% ownership and controlling stake' },
{ rule_id: 'R013', scheme_id: 'S002', rule_type: 'loan_amount', field: 'loan_amount', operator: '>=', value: '1000000', description: 'Minimum composite loan amount is ₹10 lakh' },
{ rule_id: 'R014', scheme_id: 'S002', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '10000000', description: 'Maximum composite loan amount is ₹1 crore' },

{ rule_id: 'R015', scheme_id: 'S003', rule_type: 'enterprise_status', field: 'enterprise_status', operator: 'in', value: 'new,existing', description: 'New or existing micro and small enterprises are eligible' },
{ rule_id: 'R016', scheme_id: 'S003', rule_type: 'enterprise_size', field: 'enterprise_size', operator: 'in', value: 'micro,small', description: 'Scheme covers micro and small enterprises' },
{ rule_id: 'R017', scheme_id: 'S003', rule_type: 'collateral', field: 'has_collateral', operator: '==', value: 'false', description: 'Credit facility is covered without collateral security' },
{ rule_id: 'R018', scheme_id: 'S003', rule_type: 'third_party_guarantee', field: 'has_third_party_guarantee', operator: '==', value: 'false', description: 'Credit facility is covered without third party guarantee' },
{ rule_id: 'R019', scheme_id: 'S003', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service,trading,education/training', description: 'Eligible activities include manufacturing, services, trading and training institutions' },

{ rule_id: 'R020', scheme_id: 'S004', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Applicant must be at least 18 years old' },
{ rule_id: 'R021', scheme_id: 'S004', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service,trading,agriculture', description: 'Any income-generating activity including allied agriculture' },
{ rule_id: 'R022', scheme_id: 'S004', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '50000', description: 'Shishu loans are capped at ₹50,000' },

{ rule_id: 'R023', scheme_id: 'S005', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Applicant must be at least 18 years old' },
{ rule_id: 'R024', scheme_id: 'S005', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service,trading,agriculture', description: 'Any income-generating activity including allied agriculture' },
{ rule_id: 'R025', scheme_id: 'S005', rule_type: 'loan_amount', field: 'loan_amount', operator: '>', value: '50000', description: 'Kishore applies above ₹50,000' },
{ rule_id: 'R026', scheme_id: 'S005', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '500000', description: 'Kishore loans are capped at ₹5 lakh' },

{ rule_id: 'R027', scheme_id: 'S006', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Applicant must be at least 18 years old' },
{ rule_id: 'R028', scheme_id: 'S006', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'trading,service', description: 'Street vending in trading and services' },
{ rule_id: 'R029', scheme_id: 'S006', rule_type: 'enterprise_status', field: 'enterprise_status', operator: 'in', value: 'existing', description: 'Applicant must be an existing vendor holding a certificate of vending' },
{ rule_id: 'R030', scheme_id: 'S006', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '50000', description: 'Working capital loan is capped at ₹50,000 in the third cycle' },

{ rule_id: 'R031', scheme_id: 'S007', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Applicant must be at least 18 years old' },
{ rule_id: 'R032', scheme_id: 'S007', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service', description: 'Applicant must practise one of the 18 recognised artisan trades' },
{ rule_id: 'R033', scheme_id: 'S007', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '300000', description: 'Enterprise development loan is capped at ₹3 lakh' },
{ rule_id: 'R034', scheme_id: 'S007', rule_type: 'government_subsidy', field: 'previous_subsidy', operator: '==', value: 'false', description: 'No similar credit benefit under PMEGP, MUDRA or SVANidhi in the last five years' },

{ rule_id: 'R035', scheme_id: 'S008', rule_type: 'age', field: 'age', operator: '>=', value: '18', description: 'Applicant must be at least 18 years old' },
{ rule_id: 'R036', scheme_id: 'S008', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'agriculture', description: 'Only dairy and allied agriculture activities are covered' },
{ rule_id: 'R037', scheme_id: 'S008', rule_type: 'new_unit', field: 'is_new_unit', operator: '==', value: 'true', description: 'Assistance is for setting up a new dairy unit' },
{ rule_id: 'R038', scheme_id: 'S008', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '3000000', description: 'Project outlay eligible for subsidy is capped at ₹30 lakh' },

{ rule_id: 'R039', scheme_id: 'S009', rule_type: 'state', field: 'state', operator: 'in', value: 'Andhra Pradesh', description: 'The unit must be located in Andhra Pradesh' },
{ rule_id: 'R040', scheme_id: 'S009', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing,service', description: 'Manufacturing and eligible service enterprises are covered' },
{ rule_id: 'R041', scheme_id: 'S009', rule_type: 'enterprise_size', field: 'enterprise_size', operator: 'in', value: 'micro,small,medium', description: 'Micro, small and medium enterprises are covered' },
{ rule_id: 'R042', scheme_id: 'S009', rule_type: 'new_unit', field: 'is_new_unit', operator: '==', value: 'true', description: 'Only new units commencing commercial production qualify' },

{ rule_id: 'R043', scheme_id: 'S010', rule_type: 'category', field: 'category', operator: 'in', value: 'SC,ST', description: 'The enterprise must be owned by an SC or ST entrepreneur' },
{ rule_id: 'R044', scheme_id: 'S010', rule_type: 'ownership', field: 'ownership_percent', operator: '>=', value: '51', description: 'At least 51% shareholding must be held by SC/ST promoters' },
{ rule_id: 'R045', scheme_id: 'S010', rule_type: 'business_type', field: 'business_type', operator: 'in', value: 'manufacturing', description: 'Subsidy is on plant and machinery for manufacturing units' },
{ rule_id: 'R046', scheme_id: 'S010', rule_type: 'loan_amount', field: 'loan_amount', operator: '<=', value: '10000000', description: 'Institutional finance considered for subsidy is capped at ₹1 crore' }];


export const financialRules: FinancialRule[] = [
{ financial_rule_id: 'F001', scheme_id: 'S001', min_project_cost: null, max_project_cost: 5000000, max_loan_amount: 5000000, subsidy_percent: '15-35', interest_rate: 'Normal Bank Rate', maximum_tenure_months: 84, margin_percent: 10 },
{ financial_rule_id: 'F002', scheme_id: 'S002', min_project_cost: null, max_project_cost: 10000000, max_loan_amount: 10000000, subsidy_percent: '0', interest_rate: 'Lowest applicable bank rate, not exceeding MCLR + 3% + tenor premium', maximum_tenure_months: 84, margin_percent: 10 },
{ financial_rule_id: 'F003', scheme_id: 'S003', min_project_cost: null, max_project_cost: 100000000, max_loan_amount: 100000000, subsidy_percent: '0', interest_rate: 'As per RBI guidelines / lending institution', maximum_tenure_months: null, margin_percent: 0 },
{ financial_rule_id: 'F004', scheme_id: 'S004', min_project_cost: null, max_project_cost: 50000, max_loan_amount: 50000, subsidy_percent: '0', interest_rate: '10.5', maximum_tenure_months: 60, margin_percent: 0 },
{ financial_rule_id: 'F005', scheme_id: 'S005', min_project_cost: null, max_project_cost: 500000, max_loan_amount: 500000, subsidy_percent: '0', interest_rate: '11', maximum_tenure_months: 60, margin_percent: 10 },
{ financial_rule_id: 'F006', scheme_id: 'S006', min_project_cost: null, max_project_cost: 50000, max_loan_amount: 50000, subsidy_percent: '0', interest_rate: '12', maximum_tenure_months: 12, margin_percent: 0 },
{ financial_rule_id: 'F007', scheme_id: 'S007', min_project_cost: null, max_project_cost: 300000, max_loan_amount: 300000, subsidy_percent: '0', interest_rate: '5', maximum_tenure_months: 36, margin_percent: 0 },
{ financial_rule_id: 'F008', scheme_id: 'S008', min_project_cost: null, max_project_cost: 3000000, max_loan_amount: 3000000, subsidy_percent: '25', interest_rate: 'As per participating bank', maximum_tenure_months: 84, margin_percent: 10 },
{ financial_rule_id: 'F009', scheme_id: 'S009', min_project_cost: null, max_project_cost: 50000000, max_loan_amount: 50000000, subsidy_percent: '15-45', interest_rate: 'Bank rate with state interest subvention', maximum_tenure_months: 84, margin_percent: 10 },
{ financial_rule_id: 'F010', scheme_id: 'S010', min_project_cost: null, max_project_cost: 10000000, max_loan_amount: 10000000, subsidy_percent: '25', interest_rate: 'As per nodal bank', maximum_tenure_months: 84, margin_percent: 10 }];


function baseDocs(schemeId: string, start: number): SchemeDocument[] {
  const id = (n: number) => `D${String(n).padStart(3, '0')}`;
  return [
  { document_id: id(start), scheme_id: schemeId, document_name: 'Aadhaar Card', mandatory: 'yes', description: 'Identity proof' },
  { document_id: id(start + 1), scheme_id: schemeId, document_name: 'PAN Card', mandatory: 'yes', description: 'Identity verification' },
  { document_id: id(start + 2), scheme_id: schemeId, document_name: 'Bank Account Details', mandatory: 'yes', description: 'Passbook first page or cancelled cheque' },
  { document_id: id(start + 3), scheme_id: schemeId, document_name: 'Passport Size Photograph', mandatory: 'yes', description: 'Recent colour photograph' }];

}

export const schemeDocuments: SchemeDocument[] = [
{ document_id: 'D001', scheme_id: 'S001', document_name: 'Aadhaar Card', mandatory: 'yes', description: 'Identity proof' },
{ document_id: 'D002', scheme_id: 'S001', document_name: 'PAN Card', mandatory: 'yes', description: 'Identity verification' },
{ document_id: 'D003', scheme_id: 'S001', document_name: 'Project Report', mandatory: 'yes', description: 'Business project report' },
{ document_id: 'D004', scheme_id: 'S001', document_name: 'Bank Account Details', mandatory: 'yes', description: 'Bank account information' },
{ document_id: 'D005', scheme_id: 'S001', document_name: 'Passport Size Photograph', mandatory: 'yes', description: 'Applicant photograph' },
{ document_id: 'D006', scheme_id: 'S001', document_name: 'Educational Qualification Certificate', mandatory: 'conditional', description: 'Required above the project cost threshold' },
{ document_id: 'D007', scheme_id: 'S001', document_name: 'Caste Certificate', mandatory: 'conditional', description: 'Applicable for reserved category applicants' },
{ document_id: 'D008', scheme_id: 'S001', document_name: 'Residence Proof', mandatory: 'yes', description: 'Address verification' },

{ document_id: 'D009', scheme_id: 'S002', document_name: 'Aadhaar Card', mandatory: 'yes', description: 'Identity proof' },
{ document_id: 'D010', scheme_id: 'S002', document_name: 'PAN Card', mandatory: 'yes', description: 'Permanent Account Number' },
{ document_id: 'D011', scheme_id: 'S002', document_name: 'Caste Certificate', mandatory: 'conditional', description: 'Required for SC/ST applicants' },
{ document_id: 'D012', scheme_id: 'S002', document_name: 'Business Plan', mandatory: 'yes', description: 'Detailed project report' },
{ document_id: 'D013', scheme_id: 'S002', document_name: 'Bank Account Details', mandatory: 'yes', description: 'Bank account information' },
{ document_id: 'D014', scheme_id: 'S002', document_name: 'Address Proof', mandatory: 'yes', description: 'Proof of residence' },
{ document_id: 'D015', scheme_id: 'S002', document_name: 'Passport Size Photograph', mandatory: 'yes', description: 'Applicant photograph' },

...baseDocs('S003', 16),
{ document_id: 'D020', scheme_id: 'S003', document_name: 'Udyam Registration Certificate', mandatory: 'yes', description: 'MSME registration proof' },
{ document_id: 'D021', scheme_id: 'S003', document_name: 'Sanction Letter', mandatory: 'yes', description: 'Facility sanctioned without collateral or third party guarantee' },

...baseDocs('S004', 22),
{ document_id: 'D026', scheme_id: 'S004', document_name: 'Business Activity Proof', mandatory: 'conditional', description: 'Purchase bills or any evidence of the activity' },

...baseDocs('S005', 27),
{ document_id: 'D031', scheme_id: 'S005', document_name: 'Udyam Registration Certificate', mandatory: 'yes', description: 'MSME registration proof' },
{ document_id: 'D032', scheme_id: 'S005', document_name: 'Project Report', mandatory: 'yes', description: 'Cost of project and repayment projections' },

...baseDocs('S006', 33),
{ document_id: 'D037', scheme_id: 'S006', document_name: 'Certificate of Vending', mandatory: 'yes', description: 'Issued by the Urban Local Body' },

...baseDocs('S007', 38),
{ document_id: 'D042', scheme_id: 'S007', document_name: 'Trade Self-Declaration', mandatory: 'yes', description: 'Declaration of practising a recognised trade' },
{ document_id: 'D043', scheme_id: 'S007', document_name: 'Skill Training Certificate', mandatory: 'conditional', description: 'Required before the second credit tranche' },

...baseDocs('S008', 44),
{ document_id: 'D048', scheme_id: 'S008', document_name: 'Land Records', mandatory: 'yes', description: 'Ownership or lease record for the dairy unit' },
{ document_id: 'D049', scheme_id: 'S008', document_name: 'Dairy Project Report', mandatory: 'yes', description: 'Herd size, shed layout and cash flow projections' },

...baseDocs('S009', 50),
{ document_id: 'D054', scheme_id: 'S009', document_name: 'Udyam Registration Certificate', mandatory: 'yes', description: 'MSME registration proof' },
{ document_id: 'D055', scheme_id: 'S009', document_name: 'Commercial Production Certificate', mandatory: 'yes', description: 'Issued by the District Industries Centre' },

...baseDocs('S010', 56),
{ document_id: 'D060', scheme_id: 'S010', document_name: 'Caste Certificate', mandatory: 'yes', description: 'SC or ST certificate of the majority promoter' },
{ document_id: 'D061', scheme_id: 'S010', document_name: 'Plant and Machinery Invoices', mandatory: 'yes', description: 'Invoices for machinery on which subsidy is claimed' }];


export const channelPartners: ChannelPartner[] = [
{
  partner_id: 'CP001',
  scheme_ids: ['S001', 'S007', 'S009', 'S010'],
  name: 'District Industries Centre, Guntur',
  partner_type: 'Government office',
  address: 'Collectorate Complex, Nagarampalem, Guntur',
  district: 'Guntur',
  state: 'Andhra Pradesh',
  phone: '0863-2234512',
  hours: 'Mon–Fri, 10:30 am – 5:00 pm'
},
{
  partner_id: 'CP002',
  scheme_ids: ['S002', 'S003', 'S004', 'S005', 'S008'],
  name: 'State Bank of India, Guntur Main Branch',
  partner_type: 'Lending institution',
  address: 'Brodipet 4th Line, Guntur',
  district: 'Guntur',
  state: 'Andhra Pradesh',
  phone: '0863-2222180',
  hours: 'Mon–Sat, 10:00 am – 4:00 pm'
},
{
  partner_id: 'CP003',
  scheme_ids: ['S006'],
  name: 'Guntur Municipal Corporation — SVANidhi Desk',
  partner_type: 'Urban local body',
  address: 'Municipal Corporation Office, Kothapet, Guntur',
  district: 'Guntur',
  state: 'Andhra Pradesh',
  phone: '0863-2233456',
  hours: 'Mon–Fri, 10:00 am – 5:00 pm'
},
{
  partner_id: 'CP004',
  scheme_ids: ['S001'],
  name: 'KVIC State Office, Vijayawada',
  partner_type: 'Implementing agency',
  address: 'Khadi Bhavan, Governorpet, Vijayawada',
  district: 'Krishna',
  state: 'Andhra Pradesh',
  phone: '0866-2571234',
  hours: 'Mon–Fri, 10:30 am – 5:00 pm'
},
{
  partner_id: 'CP005',
  scheme_ids: ['S001', 'S002', 'S003', 'S004', 'S005', 'S006', 'S007', 'S008', 'S009', 'S010'],
  name: 'Canara Bank — MSME Loan Centre',
  partner_type: 'Lending institution',
  address: 'Main Road, near the bus station',
  district: 'Any',
  state: 'All India',
  phone: '1800-425-0018',
  hours: 'Mon–Sat, 10:00 am – 4:00 pm'
}];


export const getScheme = (id: string) => schemes.find((s) => s.scheme_id === id);
export const getRules = (id: string) => eligibilityRules.filter((r) => r.scheme_id === id);
export const getFinancialRule = (id: string) =>
financialRules.find((f) => f.scheme_id === id) ?? null;
export const getDocuments = (id: string) => schemeDocuments.filter((d) => d.scheme_id === id);

export function getPartners(schemeId: string, state?: string, district?: string): ChannelPartner[] {
  return channelPartners.
  filter((p) => p.scheme_ids.includes(schemeId)).
  sort((a, b) => rank(b) - rank(a));

  function rank(p: ChannelPartner): number {
    let s = 0;
    if (district && p.district === district) s += 3;
    if (state && p.state === state) s += 2;
    if (p.state === 'All India') s += 1;
    return s;
  }
}