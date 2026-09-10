import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { Button, Card, LoadingState, ProgressBar, StatusPill } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { financeService } from '../services';
import { usableSubsidyPercent, parseInterestRate } from '../engine/financeEngine';
import { compactINR, formatINR } from '../utils/format';
import type { FinanceResult } from '../types';

export function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { profile, matches, matching, completeness, hasRequirement } = useUserData();
  const [finance, setFinance] = useState<FinanceResult | null>(null);

  const best = useMemo(
    () => matches.find((m) => m.status === 'eligible') ?? matches[0] ?? null,
    [matches]
  );

  useEffect(() => {
    if (!best || profile.project_cost === undefined) {
      setFinance(null);
      return;
    }
    let cancelled = false;
    const fr = best.financial_rule;
    financeService.
    calculate({
      project_cost: profile.project_cost,
      own_contribution: profile.own_contribution ?? 0,
      subsidy_percent: fr ? usableSubsidyPercent(fr.subsidy_percent) : 0,
      interest_rate: (fr ? parseInterestRate(fr.interest_rate) : null) ?? 11,
      tenure_years: profile.preferred_tenure_years ?? 5,
      max_loan_amount: fr?.max_loan_amount ?? null,
      margin_percent: fr?.margin_percent ?? 0,
      monthly_income: profile.monthly_income ?? 0
    }).
    then((r) => {
      if (!cancelled) setFinance(r);
    }).
    catch(() => {
      if (!cancelled) setFinance(null);
    });
    return () => {
      cancelled = true;
    };
  }, [best, profile]);

  const eligibleCount = matches.filter((m) => m.status === 'eligible').length;
  const nextStep = !hasRequirement ?
  { label: t('nav.profile'), to: '/profile', body: t('dash.noProfile') } :
  completeness < 100 ?
  {
    label: t('nav.profile'),
    to: '/profile',
    body: 'A few answers are still missing, which is why some schemes say “information needed”.'
  } :
  eligibleCount > 0 ?
  {
    label: t('nav.financing'),
    to: '/financing',
    body: 'You have eligible schemes. See the EMI and whether the repayment fits your income.'
  } :
  {
    label: t('nav.results'),
    to: '/results',
    body: 'No scheme clears every criterion yet. Open your results to see exactly what is blocking each one.'
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">
          {t('dash.greeting', { name: user?.full_name.split(' ')[0] ?? '' })}
        </h1>
        {profile.trade ?
        <p className="mt-1 text-slate-600">
            {profile.trade}
            {profile.district ? ` · ${profile.district}` : ''}
            {profile.project_cost !== undefined ? ` · ${formatINR(profile.project_cost)}` : ''}
          </p> :
        null}
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-600">{t('dash.profileComplete')}</p>
          <p className="tabular mt-2 text-3xl font-extrabold text-navy-900">{completeness}%</p>
          <ProgressBar percent={completeness} label={t('dash.profileComplete')} />
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-600">{t('dash.eligible')}</p>
          <p className="tabular mt-2 text-3xl font-extrabold text-teal-700">{eligibleCount}</p>
          <p className="mt-2 text-sm text-slate-500">
            {t('results.analysed', { count: matches.length })}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-600">{t('dash.emi')}</p>
          <p className="tabular mt-2 text-3xl font-extrabold text-navy-900">
            {finance ? formatINR(finance.estimated_emi) : '—'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {finance && best ? best.scheme.short_name : t('dash.noProfile')}
          </p>
        </Card>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-navy-200 bg-navy-50 p-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-navy-700">
            {t('dash.nextStep')}
          </p>
          <p className="mt-1 max-w-2xl text-navy-900">{nextStep.body}</p>
        </div>
        <Link to={nextStep.to}>
          <Button>
            {nextStep.label}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </Card>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-navy-900">{t('dash.topSchemes')}</h2>
          {matches.length > 0 ?
          <Link
            to="/results"
            className="text-sm font-semibold text-navy-800 underline underline-offset-2">
            
              {t('nav.results')}
            </Link> :
          null}
        </div>

        {matching ?
        <LoadingState label={t('load.matching')} /> :
        matches.length === 0 ?
        <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <SparklesIcon className="h-6 w-6 shrink-0 text-navy-700" aria-hidden />
            <p className="flex-1 text-slate-700">{t('dash.noProfile')}</p>
            <div className="flex gap-2">
              <Link to="/assistant">
                <Button variant="secondary">{t('nav.assistant')}</Button>
              </Link>
              <Link to="/profile">
                <Button>{t('nav.profile')}</Button>
              </Link>
            </div>
          </Card> :

        <ul className="grid gap-4 lg:grid-cols-3">
            {matches.slice(0, 3).map((m) =>
          <Card as="li" key={m.scheme_id} className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-navy-900">{m.scheme.short_name}</h3>
                  <StatusPill status={m.status} size="sm" />
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{m.scheme.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Max finance</dt>
                    <dd className="tabular font-bold text-navy-900">
                      {compactINR(m.financial_rule?.max_loan_amount ?? null)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Match</dt>
                    <dd className="tabular font-bold text-navy-900">{m.match_score}%</dd>
                  </div>
                </dl>
                <Link to={`/scheme/${m.scheme_id}`} className="mt-auto pt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    {t('action.view')}
                  </Button>
                </Link>
              </Card>
          )}
          </ul>
        }
      </section>
    </div>);

}