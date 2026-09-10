import type {
  AiChatResponse,
  ApplicantProfile,
  AuthUser,
  ChatMessage,
  FinanceInput,
  FinanceResult,
  Language,
  Scheme,
  SchemeMatch } from
'../types';
import { ServiceError, get, isApiConfigured, post, put, setAuthToken, setMode } from './apiClient';
import { calculateFinance } from '../engine/financeEngine';
import { matchSchemes } from '../engine/ruleEngine';
import { detectIntent, extract, missingFields } from '../engine/extractor';
import { schemes as seedSchemes, getDocuments } from '../data/schemes';
import { formatINR } from '../utils/format';
import { globalKey, readJSON, removeKey, uid, userKey, writeJSON } from '../utils/storage';

// ---------------------------------------------------------------------------
// Auth — Supabase/API first, browser-local accounts as the Demo Mode fallback.
// Local accounts are still real: registration, login, session and per-user
// isolation all behave the same way, they are simply not server-side.
// ---------------------------------------------------------------------------

interface StoredAccount extends AuthUser {
  password_digest: string;
}

const ACCOUNTS_KEY = globalKey('accounts');
const SESSION_KEY = globalKey('session');

/** Deliberately simple; Demo Mode only, never a security boundary. */
function digest(password: string): string {
  let h = 5381;
  for (let i = 0; i < password.length; i += 1) h = (h << 5) + h + password.charCodeAt(i) | 0;
  return `d${h.toString(36)}`;
}

const readAccounts = () => readJSON<StoredAccount[]>(ACCOUNTS_KEY, []);

export const authService = {
  async register(input: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthUser> {
    if (isApiConfigured()) {
      try {
        const user = await post<AuthUser & {token?: string;}>('/api/auth/register', input);
        if (user.token) setAuthToken(user.token);
        writeJSON(SESSION_KEY, user);
        return user;
      } catch (e) {
        if (e instanceof ServiceError && e.code !== 'network') throw e;
        setMode('demo');
      }
    }
    const email = input.email.trim().toLowerCase();
    const accounts = readAccounts();
    if (accounts.some((a) => a.email === email)) throw new ServiceError('conflict', 'exists');
    const account: StoredAccount = {
      id: uid('user'),
      email,
      full_name: input.full_name.trim(),
      phone: input.phone?.trim() || undefined,
      created_at: new Date().toISOString(),
      password_digest: digest(input.password)
    };
    writeJSON(ACCOUNTS_KEY, [...accounts, account]);
    const { password_digest: _pw, ...user } = account;
    writeJSON(SESSION_KEY, user);
    return user;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    if (isApiConfigured()) {
      try {
        const user = await post<AuthUser & {token?: string;}>('/api/auth/login', {
          email,
          password
        });
        if (user.token) setAuthToken(user.token);
        writeJSON(SESSION_KEY, user);
        return user;
      } catch (e) {
        if (e instanceof ServiceError && e.code !== 'network') throw e;
        setMode('demo');
      }
    }
    const normalised = email.trim().toLowerCase();
    const account = readAccounts().find((a) => a.email === normalised);
    if (!account) throw new ServiceError('not_found', 'not_found');
    if (account.password_digest !== digest(password))
    throw new ServiceError('unauthorized', 'wrong_password');
    const { password_digest: _pw, ...user } = account;
    writeJSON(SESSION_KEY, user);
    return user;
  },

  logout(): void {
    setAuthToken(null);
    removeKey(SESSION_KEY);
  },

  getCurrentUser(): AuthUser | null {
    return readJSON<AuthUser | null>(SESSION_KEY, null);
  }
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileService = {
  async load(userId: string): Promise<ApplicantProfile> {
    if (isApiConfigured()) {
      try {
        return await get<ApplicantProfile>('/api/profile');
      } catch {
        setMode('demo');
      }
    }
    return readJSON<ApplicantProfile>(userKey(userId, 'profile'), {});
  },

  async save(userId: string, profile: ApplicantProfile): Promise<ApplicantProfile> {
    const next = { ...profile, updated_at: new Date().toISOString() };
    if (isApiConfigured()) {
      try {
        return await put<ApplicantProfile>('/api/profile', next);
      } catch {
        setMode('demo');
      }
    }
    writeJSON(userKey(userId, 'profile'), next);
    return next;
  }
};

// ---------------------------------------------------------------------------
// Schemes and matching
// ---------------------------------------------------------------------------

export const schemeService = {
  async list(): Promise<Scheme[]> {
    if (isApiConfigured()) {
      try {
        return await get<Scheme[]>('/api/schemes');
      } catch {
        setMode('demo');
      }
    }
    return seedSchemes;
  },

  async match(profile: ApplicantProfile): Promise<SchemeMatch[]> {
    if (isApiConfigured()) {
      try {
        return await post<SchemeMatch[]>('/api/schemes/match', profile);
      } catch {
        setMode('demo');
      }
    }
    return matchSchemes(profile);
  },

  documents: getDocuments
};

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export const financeService = {
  async calculate(input: FinanceInput): Promise<FinanceResult> {
    if (isApiConfigured()) {
      try {
        return await post<FinanceResult>('/api/finance/calculate', input);
      } catch {
        setMode('demo');
      }
    }
    return calculateFinance(input);
  }
};

// ---------------------------------------------------------------------------
// AI assistant
// ---------------------------------------------------------------------------

/** Scaffolding for Demo Mode replies; Gemini phrases these itself when live. */
const PHRASES: Record<Language, Record<string, string>> = {
  en: {
    greet: 'Namaste. Tell me what you want to set up, where, and roughly how much it will cost.',
    got: "Here's what I understood:",
    need: 'To match schemes accurately I still need:',
    ready: 'That is everything I need. Open your scheme results to see the verdict for each scheme.',
    docs: 'Document requirements differ by scheme. Most schemes ask for Aadhaar, PAN, bank account details and a photograph; credit-linked schemes also want a project report. Open a scheme to see its exact checklist.',
    emiNeedCost: 'Tell me the project cost and how much you can put in yourself, and I will work out the EMI.',
    emi: 'On a loan of {loan} at {rate}% over {years} years, the EMI works out to about {emi} a month.',
    elig: 'Based on what you have told me: {eligible} eligible, {partial} partially eligible and {blocked} not eligible. Open your results for the criterion-by-criterion reason.',
    eligNeed: 'I cannot judge eligibility yet — I still need a few details first.'
  },
  te: {
    greet: 'నమస్తే. మీరు ఏమి ప్రారంభించాలనుకుంటున్నారు, ఎక్కడ, ఎంత ఖర్చు అవుతుందో చెప్పండి.',
    got: 'నేను అర్థం చేసుకున్నది:',
    need: 'పథకాలను ఖచ్చితంగా సరిపోల్చడానికి ఇంకా కావాల్సినవి:',
    ready: 'కావాల్సినవన్నీ వచ్చాయి. ప్రతి పథకం ఫలితం చూడటానికి మీ ఫలితాలను తెరవండి.',
    docs: 'పత్రాలు పథకాన్ని బట్టి మారతాయి. చాలా పథకాలు ఆధార్, పాన్, బ్యాంక్ వివరాలు, ఫోటో అడుగుతాయి. ఖచ్చితమైన జాబితా కోసం పథకాన్ని తెరవండి.',
    emiNeedCost: 'ప్రాజెక్టు వ్యయం మరియు మీరు పెట్టగల మొత్తం చెప్పండి, EMI లెక్కిస్తాను.',
    emi: '{loan} రుణంపై {rate}% వడ్డీతో {years} సంవత్సరాలకు EMI సుమారు నెలకు {emi}.',
    elig: 'మీరు చెప్పిన దాని ప్రకారం: {eligible} అర్హత, {partial} పాక్షిక అర్హత, {blocked} అర్హత లేదు. కారణాల కోసం ఫలితాలను తెరవండి.',
    eligNeed: 'ఇంకా అర్హతను నిర్ణయించలేను — ముందు కొన్ని వివరాలు కావాలి.'
  },
  hi: {
    greet: 'नमस्ते। बताइए आप क्या शुरू करना चाहते हैं, कहाँ, और लगभग कितनी लागत होगी।',
    got: 'मैंने यह समझा:',
    need: 'योजनाओं का सही मिलान करने के लिए मुझे अभी चाहिए:',
    ready: 'सब कुछ मिल गया। हर योजना का निर्णय देखने के लिए अपने परिणाम खोलें।',
    docs: 'दस्तावेज़ योजना के अनुसार बदलते हैं। अधिकांश योजनाएँ आधार, पैन, बैंक विवरण और फोटो माँगती हैं। सटीक सूची के लिए योजना खोलें।',
    emiNeedCost: 'परियोजना लागत और आप कितना लगा सकते हैं बताइए, मैं EMI निकाल दूँगा।',
    emi: '{loan} के ऋण पर {rate}% ब्याज से {years} वर्ष में EMI लगभग {emi} प्रति माह होगी।',
    elig: 'आपने जो बताया उसके आधार पर: {eligible} पात्र, {partial} आंशिक रूप से पात्र, {blocked} पात्र नहीं। कारण देखने के लिए परिणाम खोलें।',
    eligNeed: 'अभी पात्रता तय नहीं कर सकता — पहले कुछ विवरण चाहिए।'
  },
  ta: {
    greet: 'வணக்கம். நீங்கள் என்ன தொடங்க விரும்புகிறீர்கள், எங்கே, தோராயமாக எவ்வளவு செலவாகும் என்று சொல்லுங்கள்.',
    got: 'நான் புரிந்துகொண்டது:',
    need: 'திட்டங்களை சரியாக பொருத்த இன்னும் தேவை:',
    ready: 'தேவையான அனைத்தும் கிடைத்துவிட்டன. ஒவ்வொரு திட்டத்தின் முடிவைக் காண உங்கள் முடிவுகளைத் திறங்கள்.',
    docs: 'ஆவணங்கள் திட்டத்திற்கு ஏற்ப மாறும். பெரும்பாலான திட்டங்கள் ஆதார், பான், வங்கி விவரங்கள், புகைப்படம் கேட்கின்றன. சரியான பட்டியலுக்கு திட்டத்தைத் திறங்கள்.',
    emiNeedCost: 'திட்டச் செலவு மற்றும் நீங்கள் போடக்கூடிய தொகையைச் சொல்லுங்கள், EMI கணக்கிடுகிறேன்.',
    emi: '{loan} கடனுக்கு {rate}% வட்டியில் {years} ஆண்டுகளில் EMI மாதம் சுமார் {emi}.',
    elig: 'நீங்கள் சொன்னதன் அடிப்படையில்: {eligible} தகுதி, {partial} பகுதி தகுதி, {blocked} தகுதி இல்லை. காரணங்களுக்கு முடிவுகளைத் திறங்கள்.',
    eligNeed: 'இன்னும் தகுதியை முடிவு செய்ய முடியாது — முதலில் சில விவரங்கள் தேவை.'
  },
  kn: {
    greet: 'ನಮಸ್ಕಾರ. ನೀವು ಏನು ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೀರಿ, ಎಲ್ಲಿ, ಸುಮಾರು ಎಷ್ಟು ವೆಚ್ಚ ಎಂದು ತಿಳಿಸಿ.',
    got: 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡದ್ದು:',
    need: 'ಯೋಜನೆಗಳನ್ನು ನಿಖರವಾಗಿ ಹೊಂದಿಸಲು ಇನ್ನೂ ಬೇಕು:',
    ready: 'ಬೇಕಾದ ಎಲ್ಲವೂ ಸಿಕ್ಕಿದೆ. ಪ್ರತಿ ಯೋಜನೆಯ ತೀರ್ಪು ನೋಡಲು ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳನ್ನು ತೆರೆಯಿರಿ.',
    docs: 'ದಾಖಲೆಗಳು ಯೋಜನೆಗೆ ಅನುಗುಣವಾಗಿ ಬದಲಾಗುತ್ತವೆ. ಹೆಚ್ಚಿನ ಯೋಜನೆಗಳು ಆಧಾರ್, ಪ್ಯಾನ್, ಬ್ಯಾಂಕ್ ವಿವರ ಮತ್ತು ಫೋಟೋ ಕೇಳುತ್ತವೆ. ನಿಖರ ಪಟ್ಟಿಗೆ ಯೋಜನೆ ತೆರೆಯಿರಿ.',
    emiNeedCost: 'ಯೋಜನಾ ವೆಚ್ಚ ಮತ್ತು ನೀವು ಹಾಕಬಹುದಾದ ಮೊತ್ತ ತಿಳಿಸಿ, EMI ಲೆಕ್ಕ ಹಾಕುತ್ತೇನೆ.',
    emi: '{loan} ಸಾಲಕ್ಕೆ {rate}% ಬಡ್ಡಿಯಲ್ಲಿ {years} ವರ್ಷಗಳಿಗೆ EMI ತಿಂಗಳಿಗೆ ಸುಮಾರು {emi}.',
    elig: 'ನೀವು ಹೇಳಿದ ಪ್ರಕಾರ: {eligible} ಅರ್ಹ, {partial} ಭಾಗಶಃ ಅರ್ಹ, {blocked} ಅರ್ಹರಲ್ಲ. ಕಾರಣಗಳಿಗೆ ಫಲಿತಾಂಶ ತೆರೆಯಿರಿ.',
    eligNeed: 'ಇನ್ನೂ ಅರ್ಹತೆ ನಿರ್ಧರಿಸಲಾಗದು — ಮೊದಲು ಕೆಲವು ವಿವರ ಬೇಕು.'
  }
};

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

export interface ChatRequest {
  message: string;
  language: Language;
  profile: ApplicantProfile;
  history: ChatMessage[];
  /** translator used to name the fields still missing, in the user's language */
  fieldLabel: (field: string) => string;
  describe: (profile: Partial<ApplicantProfile>) => string[];
}

export const aiService = {
  async chat(req: ChatRequest): Promise<AiChatResponse> {
    if (isApiConfigured()) {
      try {
        return await post<AiChatResponse>('/api/ai/chat', {
          message: req.message,
          language: req.language,
          profile: req.profile,
          history: req.history.map((m) => ({ role: m.role, content: m.text }))
        });
      } catch {
        setMode('demo');
      }
    }

    const p = PHRASES[req.language] ?? PHRASES.en;
    const extracted = extract(req.message, req.profile);
    const merged: ApplicantProfile = { ...req.profile, ...extracted };
    const missing = missingFields(merged);
    const intent = detectIntent(req.message);

    let reply: string;

    if (intent === 'greeting' && Object.keys(extracted).length === 0) {
      reply = p.greet;
    } else if (intent === 'ask_documents') {
      reply = p.docs;
    } else if (intent === 'ask_emi') {
      if (merged.project_cost === undefined) {
        reply = p.emiNeedCost;
      } else {
        const years = merged.preferred_tenure_years ?? 5;
        const result = calculateFinance({
          project_cost: merged.project_cost,
          own_contribution: merged.own_contribution ?? 0,
          subsidy_percent: 0,
          interest_rate: 11,
          tenure_years: years,
          max_loan_amount: null,
          margin_percent: 0,
          monthly_income: merged.monthly_income ?? 0
        });
        reply = fill(p.emi, {
          loan: formatINR(result.final_loan_amount),
          rate: 11,
          years,
          emi: formatINR(result.estimated_emi)
        });
      }
    } else if (intent === 'ask_eligibility') {
      if (missing.length > 3) {
        reply = `${p.eligNeed} ${p.need} ${missing.slice(0, 3).map(req.fieldLabel).join(', ')}.`;
      } else {
        const matches = matchSchemes(merged);
        reply = fill(p.elig, {
          eligible: matches.filter((m) => m.status === 'eligible').length,
          partial: matches.filter((m) => m.status === 'partial').length,
          blocked: matches.filter((m) => m.status === 'not_eligible').length
        });
      }
    } else {
      const captured = req.describe(extracted);
      const parts: string[] = [];
      if (captured.length) parts.push(`${p.got} ${captured.join(', ')}.`);
      if (missing.length) {
        parts.push(`${p.need} ${missing.slice(0, 3).map(req.fieldLabel).join(', ')}.`);
      } else {
        parts.push(p.ready);
      }
      if (!captured.length && !missing.length) parts.unshift(p.greet);
      reply = parts.join(' ');
    }

    return { reply, extracted, missing };
  }
};