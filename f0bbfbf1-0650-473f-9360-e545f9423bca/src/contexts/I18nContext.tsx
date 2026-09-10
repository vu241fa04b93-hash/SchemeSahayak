import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '../types';
import { LANGUAGES, translations } from '../i18n/translations';
import { globalKey, readJSON, writeJSON } from '../utils/storage';

interface I18nValue {
  language: Language;
  setLanguage: (l: Language) => void;
  /** Translate a key; unknown keys fall back to English, then to the key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nValue | null>(null);
const LANG_KEY = globalKey('language');

export function I18nProvider({ children }: {children: React.ReactNode;}) {
  const [language, setLanguageState] = useState<Language>(() =>
  readJSON<Language>(LANG_KEY, 'en')
  );

  useEffect(() => {
    writeJSON(LANG_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((l: Language) => setLanguageState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = translations[language]?.[key] ?? translations.en[key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    },
    [language]
  );

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t,
      locale: LANGUAGES.find((l) => l.code === language)?.locale ?? 'en-IN',
      languages: LANGUAGES
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}