import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2Icon, TrendingUpIcon, TriangleAlertIcon } from 'lucide-react';
import { Button, Card, EmptyState, Field, Input, LoadingState, Select } from '../components/ui';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { financeService } from '../services';
import { calculateFinance, parseInterestRate, usableSubsidyPercent } from '../engine/financeEngine';
import { formatINR, formatPercent, parseAmountInput } from '../utils/format';
import type { FinanceResult } from '../types';

const TENURES = [1, 2, 3, 5, 7];

export function Financing() {
  const { t } = useI18n();
  const { profile, matches, saveProfile } = useUserData();
  const [params] = useSearchParams();

  const candidates = useMemo(
    () => matches.filter((m) => m.status !== 'not_eligible').concat(matches),
    [matches]
  );
  const uniqueCandidates = useMemo(() => {
    const seen = new Set<string>();
    return candidates.filter((m) => seen.has(m.scheme_id) ? false : seen.add(m.scheme_id));
  }, [candidates]);

  const [schemeId, setSchemeId] = useState(
    params.get('scheme') ?? uniqueCandidates[0]?.scheme_id ?? ''
  );
  const [cost, setCost] = useState<number | undefined>(profile.project_cost);
  const [own, setOwn] = useState<number | undefined>(profile.own_contribution);
  const [income, setIncome] = useState<number | undefined>(profile.monthly_income);
  const [years, setYears] = useState<number>(profile.preferred_tenure_years ?? 5);
  const [result, setResult] = useState<FinanceResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!schemeId && uniqueCandidates[0]) setSchemeId(uniqueCandidates[0].scheme_id);
  }, [schemeId, uniqueCandidates]);

  const selected = uniqueCandidates.find((m) => m.scheme_id === schemeId) ?? null;
  const fr = selected?.financial_rule ?? null;

  const input = useMemo(
    () => ({
      project_cost: cost ?? 0,
      own_contribution: own ?? 0,
      subsidy_percent: usableSubsidyPercent(fr?.subsidy_percent ?? null),
      interest_rate: (fr ? parseInterestRate(fr.interest_rate) : null) ?? 11,
      tenure_years: years,
      max_loan_amount: fr?.max_loan_amount ?? null,
      margin_percent: fr?.margin_percent ?? 0,
      monthly_income: income ?? 0
    }),
    [cost, own, income, years, fr]
  );

  // Recalculated on every change — the numbers always come from the service.
  useEffect(() => {
    if (!cost) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setCalculating(true);
    financeService.
    calculate(input).
    then((r) => {
      if (!cancelled) setResult(r);
    }).
    catch(() => {
      if (!cancelled) setResult(null);
    }).
    finally(() => {
      if (!cancelled) setCalculating(false);
    });
    return () => {
      cancelled = true;
    };
  }, [input, cost]);

  const scenarios = useMemo(() => {
    if (!cost) return [];
    return TENURES.map((y) => ({
      years: y,
      result: calculateFinance({ ...input, tenure_years: y })
    }));
  }, [input, cost]);

  if (matches.length === 0) {
    return (
      <EmptyState
        title={t('fin.title')}
        body={t('dash.noProfile')}
        action={
        <Link to="/profile">
            <Button>{t('nav.profile')}</Button>
          </Link>
        } />);


  }

  const feasibility = result?.financial_feasibility;
  const feasibilityTone =
  feasibility?.feasibility === 'Comfortable' ?
  'border-teal-200 bg-teal-50 text-teal-800' :
  feasibility?.feasibility === 'Moderate' ?
  'border-amber-200 bg-amber-50 text-amber-800' :
  feasibility?.feasibility === 'High Burden' ?
  'border-red-200 bg-red-50 text-red-800' :
  'border-slate-200 bg-slate-50 text-slate-700';

  const maxEmi = Math.max(...scenarios.map((s) => s.result.estimated_emi), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t('fin.title')}</h1>
        <p className="mt-1 text-slate-600">
          Every figure is computed from your numbers by the finance engine — change one and the
          whole picture updates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <Card className="space-y-4 p-5">
          <Field label="Scheme" htmlFor="scheme">
            <Select id="scheme" value={schemeId} onChange={(e) => setSchemeId(e.target.value)}>
              {uniqueCandidates.map((m) =>
              <option key={m.scheme_id} value={m.scheme_id}>
                  {m.scheme.short_name}
                </option>
              )}
            </Select>
          </Field>
          <Field label={t('form.projectCost')} htmlFor="cost" hint={formatINR(cost)}>
            <Input
              id="cost"
              inputMode="numeric"
              value={cost ?? ''}
              onChange={(e) => setCost(parseAmountInput(e.target.value))} />
            
          </Field>
          <Field label={t('form.ownContribution')} htmlFor="own" hint={formatINR(own)}>
            <Input
              id="own"
              inputMode="numeric"
              value={own ?? ''}
              onChange={(e) => setOwn(parseAmountInput(e.target.value))} />
            
          </Field>
          <Field label={t('form.monthlyIncome')} htmlFor="income" hint={formatINR(income)}>
            <Input
              id="income"
              inputMode="numeric"
              value={income ?? ''}
              onChange={(e) => setIncome(parseAmountInput(e.target.value))} />
            
          </Field>
          <Field label={t('form.tenure')} htmlFor="years">
            <Select id="years" value={years} onChange={(e) => setYears(Number(e.target.value))}>
              {TENURES.map((y) =>
              <option key={y} value={y}>
                  {y} {y === 1 ? 'year' : 'years'}
                </option>
              )}
            </Select>
          </Field>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
            saveProfile({
              project_cost: cost,
              own_contribution: own,
              monthly_income: income,
              preferred_tenure_years: years
            })
            }>
            
            {t('action.save')}
          </Button>
        </Card>

        <div className="space-y-6">
          {calculating && !result ?
          <LoadingState label={t('load.calculating')} /> :
          !result ?
          <EmptyState title={t('fin.title')} body="Enter a project cost to see your financing." /> :

          <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
              [t('fin.required'), formatINR(result.finance_required)],
              [t('fin.subsidy'), formatINR(result.subsidy_amount)],
              [t('fin.loan'), formatINR(result.final_loan_amount)],
              [t('fin.emi'), formatINR(result.estimated_emi)]].
              map(([label, value], i) =>
              <Card key={label} className={i === 3 ? 'border-navy-300 bg-navy-50 p-5' : 'p-5'}>
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className="tabular mt-1 text-2xl font-extrabold text-navy-900">{value}</p>
                  </Card>
              )}
              </div>

              <div className={`rounded-xl border p-5 ${feasibilityTone}`}>
                <p className="flex items-center gap-2 font-bold">
                  {feasibility?.feasibility === 'Comfortable' ?
                <CheckCircle2Icon className="h-5 w-5" aria-hidden /> :

                <TriangleAlertIcon className="h-5 w-5" aria-hidden />
                }
                  {t('fin.feasibility')}: {t(`fin.${feasibility?.feasibility ?? 'Unknown'}`)}
                </p>
                {feasibility?.emi_ratio !== null && feasibility?.emi_ratio !== undefined ?
              <p className="mt-1 text-sm">
                    {t('fin.ratio', { ratio: formatPercent(feasibility.emi_ratio) })}
                  </p> :

              <p className="mt-1 text-sm">Add your monthly income to see affordability.</p>
              }
              </div>

              <Card className="p-5">
                <h2 className="text-base font-bold text-navy-900">Repayment breakdown</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                [t('fin.repayment'), formatINR(result.total_repayment)],
                [t('fin.interest'), formatINR(result.total_interest)],
                ['Interest rate used', `${result.interest_rate}%`]].
                map(([k, v]) =>
                <div key={k}>
                      <dt className="text-sm text-slate-500">{k}</dt>
                      <dd className="tabular mt-0.5 text-lg font-bold text-navy-900">{v}</dd>
                    </div>
                )}
                </dl>
                {!result.loan_within_limit ?
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    The loan needed is above this scheme's ceiling of{' '}
                    {formatINR(result.max_loan_amount)}. Increase your own contribution or choose a
                    scheme with a higher limit.
                  </p> :
              null}
                {!result.margin_requirement_met ?
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    This scheme expects at least {formatINR(result.minimum_own_contribution)} of your
                    own money ({result.margin_percent}% margin).
                  </p> :
              null}
              </Card>

              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-navy-900">
                  <TrendingUpIcon className="h-4 w-4 text-navy-700" aria-hidden />
                  {t('fin.scenarios')}
                </h2>
                <ul className="mt-4 space-y-3">
                  {scenarios.map((s) =>
                <li key={s.years} className="flex items-center gap-4">
                      <span className="tabular w-16 shrink-0 text-sm font-semibold text-navy-900">
                        {s.years} yr
                      </span>
                      <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                        <div
                      className={`h-full rounded transition-[width] duration-300 ease-out ${
                      s.years === years ? 'bg-navy-900' : 'bg-navy-300'}`
                      }
                      style={{ width: `${s.result.estimated_emi / maxEmi * 100}%` }} />
                    
                      </div>
                      <span className="tabular w-28 shrink-0 text-right text-sm font-bold text-navy-900">
                        {formatINR(s.result.estimated_emi)}
                      </span>
                      <span className="tabular hidden w-32 shrink-0 text-right text-sm text-slate-500 sm:block">
                        {formatINR(s.result.total_interest)} interest
                      </span>
                    </li>
                )}
                </ul>
                <p className="mt-4 text-sm text-slate-500">
                  A longer tenure lowers the monthly EMI but raises the total interest you pay.
                </p>
              </Card>
            </>
          }
        </div>
      </div>
    </div>);

}