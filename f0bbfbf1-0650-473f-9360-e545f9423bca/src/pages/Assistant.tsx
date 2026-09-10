import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, MicIcon, SendIcon, SquareIcon, XIcon } from 'lucide-react';
import { Button, Card, Input, LoadingState } from '../components/ui';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { aiService } from '../services';
import type { ApplicantProfile, ChatMessage } from '../types';
import { formatINR, parseAmountInput } from '../utils/format';
import { uid } from '../utils/storage';

const FIELD_KEY: Record<string, string> = {
  age: 'form.age',
  gender: 'form.gender',
  category: 'form.category',
  education: 'form.education',
  state: 'form.state',
  district: 'form.district',
  business_type: 'form.businessType',
  trade: 'form.trade',
  enterprise_status: 'form.enterpriseStatus',
  enterprise_size: 'form.businessType',
  project_cost: 'form.projectCost',
  own_contribution: 'form.ownContribution',
  monthly_income: 'form.monthlyIncome'
};

const MONEY_FIELDS = new Set(['project_cost', 'own_contribution', 'monthly_income']);

const SUGGESTIONS = [
'I want to start a tailoring unit in Guntur with ₹3 lakh, I can put in ₹30,000',
'I am a 32 year old woman, SC category, 10th pass',
'My family earns ₹18,000 a month',
'What documents will I need?'];


export function Assistant() {
  const { t, language, locale } = useI18n();
  const navigate = useNavigate();
  const { profile, saveProfile, chat, appendChat, clearChat } = useUserData();

  const [input, setInput] = useState('');
  const [captured, setCaptured] = useState<Partial<ApplicantProfile>>({});
  const [thinking, setThinking] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const speech = useSpeechRecognition(locale, (transcript) =>
  setInput((prev) => prev ? `${prev} ${transcript}` : transcript)
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat.length, thinking]);

  const fieldLabel = useMemo(
    () => (field: string) => t(FIELD_KEY[field] ?? field),
    [t]
  );

  const describe = useMemo(
    () => (partial: Partial<ApplicantProfile>) =>
    Object.entries(partial).
    filter(([, v]) => v !== undefined).
    map(([k, v]) => `${fieldLabel(k)} ${formatValue(k, v)}`),
    [fieldLabel]
  );

  function formatValue(field: string, value: unknown): string {
    if (typeof value === 'boolean') return value ? 'yes' : 'no';
    if (typeof value === 'number' && MONEY_FIELDS.has(field)) return formatINR(value);
    return String(value);
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || thinking) return;
    setInput('');

    const userMessage: ChatMessage = {
      id: uid('m'),
      role: 'user',
      text: message,
      created_at: new Date().toISOString()
    };
    appendChat([userMessage]);
    setThinking(true);

    try {
      const response = await aiService.chat({
        message,
        language,
        profile: { ...profile, ...captured },
        history: chat,
        fieldLabel,
        describe
      });
      setCaptured((prev) => ({ ...prev, ...response.extracted }));
      appendChat([
      {
        id: uid('m'),
        role: 'assistant',
        text: response.reply,
        created_at: new Date().toISOString()
      }]
      );
    } catch {
      appendChat([
      {
        id: uid('m'),
        role: 'assistant',
        text: t('err.connect'),
        created_at: new Date().toISOString()
      }]
      );
    } finally {
      setThinking(false);
    }
  }

  const capturedEntries = Object.entries(captured).filter(([, v]) => v !== undefined);

  async function useForMatching() {
    await saveProfile(captured);
    navigate('/results');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <Card className="flex h-[70vh] min-h-[520px] flex-col">
        <div className="border-b border-slate-200 px-5 py-4">
          <h1 className="text-lg font-bold text-navy-900">{t('ai.title')}</h1>
          <p className="mt-1 text-sm text-slate-600">
            The assistant understands and explains. Eligibility is always decided by the rule
            engine, never by the assistant.
          </p>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {chat.length === 0 ?
          <div className="space-y-3">
              <p className="text-sm text-slate-600">Try one of these to start:</p>
              <ul className="space-y-2">
                {SUGGESTIONS.map((s) =>
              <li key={s}>
                    <button
                  type="button"
                  onClick={() => send(s)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm text-navy-900 transition-colors duration-150 ease-out hover:border-navy-300 hover:bg-slate-50">
                  
                      {s}
                    </button>
                  </li>
              )}
              </ul>
            </div> :

          chat.map((m) =>
          <div
            key={m.id}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            
                <p
              className={
              m.role === 'user' ?
              'max-w-[85%] rounded-2xl rounded-br-sm bg-navy-900 px-4 py-2.5 text-sm text-white' :
              'max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-navy-900'
              }>
              
                  {m.text}
                </p>
              </div>
          )
          }
          {thinking ? <LoadingState label={t('ai.thinking')} /> : null}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          {speech.blocked ?
          <p className="mb-2 text-sm font-medium text-amber-800">{t('ai.micBlocked')}</p> :
          null}
          {speech.listening ?
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" aria-hidden />
              {t('ai.listening')}
            </p> :
          null}
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.placeholder')}
              aria-label={t('ai.title')} />
            
            {speech.supported ?
            <Button
              type="button"
              variant="secondary"
              aria-label={speech.listening ? 'Stop' : 'Speak'}
              onClick={speech.listening ? speech.stop : speech.start}
              className={speech.listening ? 'border-blue-400 text-blue-700' : undefined}>
              
                {speech.listening ?
              <SquareIcon className="h-4 w-4" aria-hidden /> :

              <MicIcon className="h-4 w-4" aria-hidden />
              }
              </Button> :
            null}
            <Button type="submit" disabled={!input.trim() || thinking} aria-label={t('action.send')}>
              <SendIcon className="h-4 w-4" aria-hidden />
            </Button>
          </form>
          {chat.length > 0 ?
          <button
            type="button"
            onClick={clearChat}
            className="mt-3 text-xs font-semibold text-slate-500 underline underline-offset-2">
            
              {t('action.startOver')}
            </button> :
          null}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-bold text-navy-900">{t('ai.captured')}</h2>
        {capturedEntries.length === 0 ?
        <p className="mt-2 text-sm text-slate-600">
            Nothing yet. Say what you want to start, where, and roughly what it will cost.
          </p> :

        <>
            <ul className="mt-3 flex flex-wrap gap-2">
              {capturedEntries.map(([field, value]) =>
            <li key={field}>
                  {editing === field ?
              <input
                autoFocus
                defaultValue={String(value)}
                onBlur={(e) => {
                  const raw = e.target.value;
                  setCaptured((prev) => ({
                    ...prev,
                    [field]: MONEY_FIELDS.has(field) || field === 'age' ?
                    parseAmountInput(raw) :
                    raw
                  }));
                  setEditing(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditing(null);
                }}
                className="w-36 rounded-full border border-navy-400 px-3 py-1 text-sm"
                aria-label={fieldLabel(field)} /> :


              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1.5 text-sm">
                      <button
                  type="button"
                  onClick={() => setEditing(field)}
                  className="font-medium text-navy-900">
                  
                        <span className="text-slate-500">{fieldLabel(field)}: </span>
                        {formatValue(field, value)}
                      </button>
                      <button
                  type="button"
                  aria-label={`Remove ${fieldLabel(field)}`}
                  onClick={() =>
                  setCaptured((prev) => {
                    const next = { ...prev };
                    delete next[field as keyof ApplicantProfile];
                    return next;
                  })
                  }
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                  
                        <XIcon className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </span>
              }
                </li>
            )}
            </ul>
            <Button className="mt-5 w-full" onClick={useForMatching}>
              {t('action.useForMatching')}
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
      </Card>
    </div>);

}