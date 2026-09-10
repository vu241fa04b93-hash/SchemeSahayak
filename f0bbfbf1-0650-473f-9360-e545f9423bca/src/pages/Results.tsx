import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheckIcon, BookmarkIcon, ChevronDownIcon, SlidersHorizontalIcon } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusPill } from
'../components/ui';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { subsidyLabel, usableSubsidyPercent } from '../engine/financeEngine';
import { compactINR } from '../utils/format';
import type { EligibilityStatus, SchemeMatch } from '../types';

type SortKey = 'match' | 'finance' | 'subsidy';

export function Results() {
  const { t } = useI18n();
  const {
    matches,
    matching,
    matchError,
    refreshMatches,
    hasRequirement,
    savedSchemes,
    toggleSaved
  } = useUserData();

  const [statuses, setStatuses] = useState<EligibilityStatus[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [subsidyOnly, setSubsidyOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('match');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      eligible: matches.filter((m) => m.status === 'eligible').length,
      partial: matches.filter((m) => m.status === 'partial').length,
      not_eligible: matches.filter((m) => m.status === 'not_eligible').length
    }),
    [matches]
  );

  const businessTypes = useMemo(
    () => Array.from(new Set(matches.flatMap((m) => m.scheme.business_types))).sort(),
    [matches]
  );

  const visible = useMemo(() => {
    const filtered = matches.filter((m) => {
      if (statuses.length && !statuses.includes(m.status)) return false;
      if (types.length && !m.scheme.business_types.some((b) => types.includes(b))) return false;
      if (subsidyOnly && usableSubsidyPercent(m.financial_rule?.subsidy_percent ?? null) <= 0)
      return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'finance')
      return (b.financial_rule?.max_loan_amount ?? 0) - (a.financial_rule?.max_loan_amount ?? 0);
      if (sort === 'subsidy')
      return (
        usableSubsidyPercent(b.financial_rule?.subsidy_percent ?? null) -
        usableSubsidyPercent(a.financial_rule?.subsidy_percent ?? null));

      return b.match_score - a.match_score;
    });
  }, [matches, statuses, types, subsidyOnly, sort]);

  function toggle<T>(list: T[], value: T, setter: (next: T[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  if (!hasRequirement) {
    return (
      <EmptyState
        title={t('results.none')}
        body={t('dash.noProfile')}
        action={
        <div className="flex flex-wrap justify-center gap-2">
            <Link to="/profile">
              <Button>{t('nav.profile')}</Button>
            </Link>
            <Link to="/assistant">
              <Button variant="secondary">{t('nav.assistant')}</Button>
            </Link>
          </div>
        } />);


  }

  if (matchError) return <ErrorState message={t('err.connect')} onRetry={refreshMatches} />;
  if (matching) return <LoadingState label={t('load.matching')} />;

  const filterRail =
  <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-navy-900">Status</legend>
        <div className="space-y-1.5">
          {(['eligible', 'partial', 'not_eligible'] as EligibilityStatus[]).map((s) =>
        <label key={s} className="flex items-center gap-2 text-sm text-slate-700">
              <input
            type="checkbox"
            checked={statuses.includes(s)}
            onChange={() => toggle(statuses, s, setStatuses)}
            className="h-4 w-4 rounded border-slate-300" />
          
              {t(`status.${s}`)}
              <span className="tabular ml-auto text-slate-500">{counts[s]}</span>
            </label>
        )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-navy-900">{t('form.businessType')}</legend>
        <div className="space-y-1.5">
          {businessTypes.map((b) =>
        <label key={b} className="flex items-center gap-2 text-sm text-slate-700">
              <input
            type="checkbox"
            checked={types.includes(b)}
            onChange={() => toggle(types, b, setTypes)}
            className="h-4 w-4 rounded border-slate-300" />
          
              {b}
            </label>
        )}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
        type="checkbox"
        checked={subsidyOnly}
        onChange={(e) => setSubsidyOnly(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300" />
      
        Only schemes with a subsidy
      </label>
    </div>;


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t('results.title')}</h1>
          <p className="mt-1 text-slate-600">{t('results.analysed', { count: matches.length })}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-600">{t('results.sort')}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900">
            
            <option value="match">Best match</option>
            <option value="finance">Largest finance</option>
            <option value="subsidy">Highest subsidy</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {(
        [
        ['eligible', counts.eligible, 'border-teal-200 bg-teal-50 text-teal-800'],
        ['partial', counts.partial, 'border-amber-200 bg-amber-50 text-amber-800'],
        ['not_eligible', counts.not_eligible, 'border-red-200 bg-red-50 text-red-800']] as
        const).
        map(([key, count, cls]) =>
        <div key={key} className={`rounded-xl border px-4 py-3 ${cls}`}>
            <p className="tabular text-2xl font-extrabold">{count}</p>
            <p className="text-sm font-medium">{t(`status.${key}`)}</p>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
          <p className="tabular text-2xl font-extrabold text-navy-900">{matches.length}</p>
          <p className="text-sm font-medium">{t('results.analysed', { count: '' }).trim()}</p>
        </div>
      </div>

      <div className="lg:hidden">
        <Button variant="secondary" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontalIcon className="h-4 w-4" aria-hidden />
          {t('results.filters')}
        </Button>
        {showFilters ? <Card className="mt-3 p-4">{filterRail}</Card> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <Card className="hidden p-5 lg:block">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            {t('results.filters')}
          </h2>
          {filterRail}
        </Card>

        {visible.length === 0 ?
        <EmptyState
          title={t('results.none')}
          body={t('results.noneBody')}
          action={
          <Button
            variant="secondary"
            onClick={() => {
              setStatuses([]);
              setTypes([]);
              setSubsidyOnly(false);
            }}>
            
                {t('action.exploreAlternatives')}
              </Button>
          } /> :


        <ul className="space-y-4">
            {visible.map((m) =>
          <SchemeCard
            key={m.scheme_id}
            match={m}
            saved={savedSchemes.includes(m.scheme_id)}
            onToggleSave={() => toggleSaved(m.scheme_id)}
            expanded={expanded === m.scheme_id}
            onToggleExpand={() =>
            setExpanded((prev) => prev === m.scheme_id ? null : m.scheme_id)
            } />

          )}
          </ul>
        }
      </div>
    </div>);

}

function SchemeCard({
  match,
  saved,
  onToggleSave,
  expanded,
  onToggleExpand






}: {match: SchemeMatch;saved: boolean;onToggleSave: () => void;expanded: boolean;onToggleExpand: () => void;}) {
  const { t } = useI18n();
  const fr = match.financial_rule;
  const explanation = match.status === 'not_eligible' ? match.remedies : match.reasons;

  return (
    <Card as="li" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-navy-900">{match.scheme.scheme_name}</h3>
          <p className="mt-1 text-sm text-slate-600">{match.scheme.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusPill status={match.status} />
          <span className="tabular text-sm font-semibold text-slate-600">
            {t('results.match', { score: match.match_score })}
          </span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Max finance</dt>
          <dd className="tabular mt-0.5 font-bold text-navy-900">
            {compactINR(fr?.max_loan_amount ?? null)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Subsidy</dt>
          <dd className="tabular mt-0.5 font-bold text-navy-900">
            {subsidyLabel(fr?.subsidy_percent ?? null)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Interest</dt>
          <dd className="mt-0.5 line-clamp-2 text-sm font-semibold text-navy-900">
            {fr?.interest_rate ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Tenure</dt>
          <dd className="tabular mt-0.5 font-bold text-navy-900">
            {fr?.maximum_tenure_months ? `${fr.maximum_tenure_months} months` : '—'}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 underline underline-offset-2">
        
        {match.status === 'not_eligible' ? t('detail.gaps') : t('results.why')}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-150 ease-out ${expanded ? 'rotate-180' : ''}`}
          aria-hidden />
        
      </button>

      {expanded ?
      <ul className="mt-3 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          {explanation.length === 0 ?
        <li>Answer the remaining questions to see a full explanation.</li> :

        explanation.map((line) =>
        <li key={line} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {line}
              </li>
        )
        }
        </ul> :
      null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/scheme/${match.scheme_id}`}>
          <Button size="sm">{t('action.view')}</Button>
        </Link>
        <Link to={`/financing?scheme=${match.scheme_id}`}>
          <Button size="sm" variant="secondary">
            {t('action.calculate')}
          </Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={onToggleSave}>
          {saved ?
          <BookmarkCheckIcon className="h-4 w-4" aria-hidden /> :

          <BookmarkIcon className="h-4 w-4" aria-hidden />
          }
          {saved ? t('action.saved') : t('action.saveScheme')}
        </Button>
      </div>
    </Card>);

}