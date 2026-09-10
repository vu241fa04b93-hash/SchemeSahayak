import type { ApplicantProfile } from '../types';
import { REQUIRED_PROFILE_FIELDS } from '../types';

/**
 * Demo-Mode reference implementation of the understanding half of
 * POST /api/ai/chat. It parses the sentence the applicant actually typed and
 * never returns an eligibility verdict — that is the rule engine's job.
 */

export type Intent = 'greeting' | 'ask_documents' | 'ask_emi' | 'ask_eligibility' | 'provide_info';

const TRADES: Array<{keys: string[];type: string;trade: string;}> = [
{ keys: ['tailor', 'boutique', 'garment', 'stitch', 'embroider'], type: 'manufacturing', trade: 'Tailoring unit' },
{ keys: ['bakery', 'baking', 'confection'], type: 'manufacturing', trade: 'Bakery' },
{ keys: ['dairy', 'milk', 'buffalo', 'cattle'], type: 'agriculture', trade: 'Dairy unit' },
{ keys: ['poultry', 'chicken'], type: 'agriculture', trade: 'Poultry unit' },
{ keys: ['carpent', 'furniture', 'woodwork'], type: 'manufacturing', trade: 'Carpentry workshop' },
{ keys: ['pottery', 'potter', 'terracotta'], type: 'manufacturing', trade: 'Pottery unit' },
{ keys: ['blacksmith', 'goldsmith', 'jewell'], type: 'manufacturing', trade: 'Smithy' },
{ keys: ['handloom', 'weav', 'loom'], type: 'manufacturing', trade: 'Handloom unit' },
{ keys: ['pickle', 'masala', 'flour mill', 'oil mill', 'rice mill', 'food processing'], type: 'manufacturing', trade: 'Food processing unit' },
{ keys: ['printing', 'press', 'xerox'], type: 'manufacturing', trade: 'Printing press' },
{ keys: ['salon', 'parlour', 'parlor', 'beauty', 'barber'], type: 'service', trade: 'Beauty salon' },
{ keys: ['tiffin', 'canteen', 'restaurant', 'catering', 'cafe', 'mess'], type: 'service', trade: 'Food service' },
{ keys: ['repair', 'mechanic', 'garage', 'servicing'], type: 'service', trade: 'Repair and servicing' },
{ keys: ['tuition', 'coaching', 'training cent', 'computer cent'], type: 'service', trade: 'Training centre' },
{ keys: ['taxi', 'auto', 'tempo', 'transport'], type: 'service', trade: 'Transport service' },
{ keys: ['laundry', 'dry clean', 'ironing'], type: 'service', trade: 'Laundry service' },
{ keys: ['photograph', 'studio', 'videograph'], type: 'service', trade: 'Photography studio' },
{ keys: ['kirana', 'grocery', 'general store', 'provision', 'retail shop'], type: 'trading', trade: 'Retail shop' },
{ keys: ['vending', 'street vendor', 'push cart', 'stall'], type: 'trading', trade: 'Street vending' },
{ keys: ['nursery', 'horticulture', 'farming'], type: 'agriculture', trade: 'Agriculture activity' }];


const PLACES: Array<{district: string;state: string;aliases: string[];}> = [
{ district: 'Guntur', state: 'Andhra Pradesh', aliases: ['guntur'] },
{ district: 'Krishna', state: 'Andhra Pradesh', aliases: ['krishna', 'vijayawada'] },
{ district: 'Visakhapatnam', state: 'Andhra Pradesh', aliases: ['visakhapatnam', 'vizag'] },
{ district: 'Chittoor', state: 'Andhra Pradesh', aliases: ['chittoor', 'tirupati'] },
{ district: 'Kurnool', state: 'Andhra Pradesh', aliases: ['kurnool'] },
{ district: 'Nellore', state: 'Andhra Pradesh', aliases: ['nellore'] },
{ district: 'East Godavari', state: 'Andhra Pradesh', aliases: ['kakinada', 'rajahmundry', 'east godavari'] },
{ district: 'Hyderabad', state: 'Telangana', aliases: ['hyderabad'] },
{ district: 'Warangal', state: 'Telangana', aliases: ['warangal'] },
{ district: 'Bengaluru Urban', state: 'Karnataka', aliases: ['bengaluru', 'bangalore'] },
{ district: 'Mysuru', state: 'Karnataka', aliases: ['mysuru', 'mysore'] },
{ district: 'Chennai', state: 'Tamil Nadu', aliases: ['chennai'] },
{ district: 'Coimbatore', state: 'Tamil Nadu', aliases: ['coimbatore'] },
{ district: 'Madurai', state: 'Tamil Nadu', aliases: ['madurai'] },
{ district: 'Pune', state: 'Maharashtra', aliases: ['pune'] },
{ district: 'Mumbai', state: 'Maharashtra', aliases: ['mumbai'] },
{ district: 'Ernakulam', state: 'Kerala', aliases: ['kochi', 'ernakulam'] },
{ district: 'Lucknow', state: 'Uttar Pradesh', aliases: ['lucknow'] },
{ district: 'Patna', state: 'Bihar', aliases: ['patna'] },
{ district: 'Ahmedabad', state: 'Gujarat', aliases: ['ahmedabad'] }];


const STATES = [
'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra',
'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal',
'Odisha', 'Punjab', 'Haryana', 'Delhi'];


interface AmountHit {
  value: number;
  index: number;
  raw: string;
}

/** Parses "3 lakh", "₹5,00,000", "5L", "50k", "1.2 crore". */
export function parseAmounts(text: string): AmountHit[] {
  const hits: AmountHit[] = [];
  const re = /(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(crores?|cr|lakhs?|lacs?|l|thousand|k)?\b/gi;
  const lower = text.toLowerCase();
  let m: RegExpExecArray | null;
  while ((m = re.exec(lower)) !== null) {
    const digits = Number(m[1].replace(/,/g, ''));
    if (!Number.isFinite(digits)) continue;
    const unit = (m[2] || '').trim();
    let value = digits;
    if (/^(crores?|cr)$/.test(unit)) value = digits * 10000000;else
    if (/^(lakhs?|lacs?|l)$/.test(unit)) value = digits * 100000;else
    if (/^(thousand|k)$/.test(unit)) value = digits * 1000;
    hits.push({ value, index: m.index, raw: m[0].trim() });
  }
  return hits;
}

function around(text: string, index: number, raw: string): string {
  return text.slice(Math.max(0, index - 45), Math.min(text.length, index + raw.length + 28)).toLowerCase();
}

const INCOME_CTX = /(income|earn|salary|revenue|turnover|profit|per month|monthly|a month)/;
const CONTRIB_CTX = /(own|contribut|margin|saving|invest myself|my share|put in|can arrange|self)/;
const COST_CTX = /(project|cost|need|require|want|loan|set ?up|start|budget|capital|machine|total|finance)/;

export function extract(text: string, current: ApplicantProfile): Partial<ApplicantProfile> {
  const lower = text.toLowerCase();
  const out: Partial<ApplicantProfile> = {};

  const age =
  lower.match(/\b(?:i am|i'm|im|aged|age is|age)\s*(\d{1,2})\b/) ||
  lower.match(/\b(\d{1,2})\s*(?:years? old|yrs? old)\b/);
  if (age) {
    const n = Number(age[1]);
    if (n >= 15 && n <= 90) out.age = n;
  }

  if (/\b(woman|women|female|lady|housewife|mahila|she)\b/.test(lower)) out.gender = 'female';else
  if (/\b(man|male|gentleman)\b/.test(lower)) out.gender = 'male';

  if (/\bsc\b|scheduled caste|dalit/.test(lower)) out.category = 'SC';else
  if (/\bst\b|scheduled tribe|tribal|adivasi/.test(lower)) out.category = 'ST';else
  if (/\bobc\b|backward class/.test(lower)) out.category = 'OBC';else
  if (/minority|muslim|christian|sikh/.test(lower)) out.category = 'Minority';else
  if (/general category|\boc\b/.test(lower)) out.category = 'General';

  if (/graduate|degree|b\.?tech|bachelor/.test(lower)) out.education = 'graduate';else
  if (/diploma|\biti\b|polytechnic/.test(lower)) out.education = 'diploma';else
  if (/12th|intermediate|higher secondary/.test(lower)) out.education = '12th';else
  if (/10th|\bssc\b|matric/.test(lower)) out.education = '10th';else
  if (/8th|eighth/.test(lower)) out.education = '8th';else
  if (/no schooling|illiterate|never went to school/.test(lower)) out.education = 'below8th';

  for (const p of PLACES) {
    if (p.aliases.some((a) => lower.includes(a))) {
      out.district = p.district;
      out.state = p.state;
      break;
    }
  }
  if (!out.state) {
    const st = STATES.find((s) => lower.includes(s.toLowerCase()));
    if (st) out.state = st;
  }

  for (const t of TRADES) {
    if (t.keys.some((k) => lower.includes(k))) {
      out.business_type = t.type;
      out.trade = t.trade;
      break;
    }
  }
  if (!out.business_type) {
    if (/manufactur|factory|production unit/.test(lower)) out.business_type = 'manufacturing';else
    if (/service business|services/.test(lower)) out.business_type = 'service';else
    if (/trading|resell|buy and sell/.test(lower)) out.business_type = 'trading';
  }

  if (/already running|existing business|running since|expand my|my current (shop|business|unit)/.test(lower))
  out.enterprise_status = 'existing';else
  if (/start|starting|new (unit|business|shop|venture)|set ?up|first time|open a/.test(lower))
  out.enterprise_status = 'new';

  if (/no collateral|without collateral|collateral[- ]free|nothing to pledge/.test(lower))
  out.has_collateral = false;else
  if (/have collateral|can pledge|property to mortgage/.test(lower)) out.has_collateral = true;

  if (/already (got|taken|received) (a )?subsid|availed subsidy/.test(lower)) out.previous_subsidy = true;else
  if (/no subsidy|never (got|taken) (any )?subsid/.test(lower)) out.previous_subsidy = false;

  for (const hit of parseAmounts(text)) {
    const ctx = around(text, hit.index, hit.raw);
    if (hit.value < 500 && !/₹|rs|inr|lakh|crore|thousand|k\b/i.test(hit.raw)) continue;
    if (/\b(years? old|age)\b/.test(ctx) && hit.value < 100) continue;

    if (INCOME_CTX.test(ctx) && out.monthly_income === undefined) {
      out.monthly_income = /year|annual|per annum/.test(ctx) ? Math.round(hit.value / 12) : hit.value;
    } else if (CONTRIB_CTX.test(ctx) && out.own_contribution === undefined) {
      out.own_contribution = hit.value;
    } else if (out.project_cost === undefined && (COST_CTX.test(ctx) || hit.value >= 10000)) {
      out.project_cost = hit.value;
    } else if (out.own_contribution === undefined && out.project_cost !== undefined) {
      out.own_contribution = hit.value;
    }
  }

  const cost = out.project_cost ?? current.project_cost;
  if (cost !== undefined && current.enterprise_size === undefined) {
    out.enterprise_size = cost <= 10000000 ? 'micro' : cost <= 100000000 ? 'small' : 'medium';
  }

  return out;
}

export function missingFields(p: ApplicantProfile): string[] {
  return REQUIRED_PROFILE_FIELDS.filter((f) => {
    const v = p[f];
    return v === undefined || v === null || v === '';
  }) as string[];
}

export function detectIntent(text: string): Intent {
  const lower = text.toLowerCase().trim();
  if (/^(hi|hello|hey|namaste|good (morning|evening|afternoon))\b/.test(lower)) return 'greeting';
  if (/document|paper|certificate|what.*submit|proof/.test(lower)) return 'ask_documents';
  if (/emi|instal|repay|monthly payment|interest rate|per month.*pay/.test(lower)) return 'ask_emi';
  if (/eligib|qualify|can i apply|which scheme|am i allowed/.test(lower)) return 'ask_eligibility';
  return 'provide_info';
}