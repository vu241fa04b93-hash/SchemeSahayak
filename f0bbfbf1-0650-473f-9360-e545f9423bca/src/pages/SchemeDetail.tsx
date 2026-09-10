import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BuildingIcon, ClockIcon, PhoneIcon } from 'lucide-react';
import {
  Button,
  Card,
  CriterionBadge,
  EmptyState,
  StatusPill,
  TrustNotice,
  VerifiedSource } from
'../components/ui';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { getDocuments, getFinancialRule, getPartners, getRules, getScheme } from '../data/schemes';
import { evaluateScheme } from '../engine/ruleEngine';
import { subsidyLabel } from '../engine/financeEngine';
import { compactINR, formatDate } from '../utils/format';

export function SchemeDetail() {
  const { t } = useI18n();
  const { schemeId = '' } = useParams();
  const { profile, matches } = useUserData();

  const scheme = getScheme(schemeId);

  const match = useMemo(() => {
    if (!scheme) return null;
    const existing = matches.find((m) => m.scheme_id === schemeId);
    if (existing) return existing;
    return evaluateScheme(scheme, getRules(schemeId), getFinancialRule(schemeId), profile);
  }, [scheme, schemeId, matches, profile]);

  if (!scheme || !match) {
    return (
      <EmptyState
        title="Scheme not found"
        body="This scheme is no longer in the catalogue."
        action={
        <Link to="/results">
            <Button>{t('nav.results')}</Button>
          </Link>
        } />);


  }

  const fr = match.financial_rule;
  const documents = getDocuments(schemeId);
  const partner = getPartners(schemeId, profile.state, profile.district)[0];

  return (
    <div className="space-y-6">
      <Link
        to="/results"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800">
        
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        {t('nav.results')}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">{scheme.scheme_name}</h1>
          <p className="mt-2 text-slate-600">{scheme.description}</p>
          <div className="mt-3">
            <VerifiedSource
              source={scheme.official_source}
              url={scheme.source_url}
              lastVerified={formatDate(scheme.last_verified)} />
            
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={match.status} />
          <span className="tabular text-sm font-semibold text-slate-600">
            {t('results.match', { score: match.match_score })}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-base font-bold text-navy-900">
              {match.status === 'not_eligible' ? t('detail.gaps') : t('detail.why')}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(match.status === 'not_eligible' ? match.remedies : match.reasons).map((line) =>
              <li key={line} className="flex gap-2">
                  <span
                  aria-hidden
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  match.status === 'not_eligible' ? 'bg-red-500' : 'bg-teal-600'}`
                  } />
                
                  {line}
                </li>
              )}
              {match.criteria.some((c) => c.status === 'unknown') ?
              <li className="flex gap-2 text-amber-800">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Some criteria still say “information needed”. Complete your requirement to turn
                  this into a firm verdict.
                </li> :
              null}
            </ul>
          </Card>

          <Card className="overflow-hidden">
            <h2 className="border-b border-slate-200 px-5 py-4 text-base font-bold text-navy-900">
              {t('detail.criteria')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Criterion
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      {t('detail.requirement')}
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      {t('detail.applicant')}
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {match.criteria.map((c) =>
                  <tr key={c.rule_id}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-navy-900">{c.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{c.description}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{c.scheme_requirement}</td>
                      <td className="tabular px-5 py-3 text-slate-700">{c.applicant_value}</td>
                      <td className="px-5 py-3">
                        <CriterionBadge status={c.status} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-navy-900">{t('detail.documents')}</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {documents.map((d) =>
              <li key={d.document_id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold text-navy-900">{d.document_name}</p>
                    <p className="text-sm text-slate-600">{d.description}</p>
                  </div>
                  <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  d.mandatory === 'yes' ?
                  'bg-navy-100 text-navy-800' :
                  'bg-amber-100 text-amber-800'}`
                  }>
                  
                    {d.mandatory === 'yes' ? 'Required' : 'If applicable'}
                  </span>
                </li>
              )}
            </ul>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-bold text-navy-900">Scheme terms</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {[
              ['Max finance', compactINR(fr?.max_loan_amount ?? null)],
              ['Subsidy', subsidyLabel(fr?.subsidy_percent ?? null)],
              ['Interest', fr?.interest_rate ?? '—'],
              [
              'Max tenure',
              fr?.maximum_tenure_months ? `${fr.maximum_tenure_months} months` : '—'],

              ['Beneficiaries', scheme.target_beneficiaries]].
              map(([k, v]) =>
              <div key={k} className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-semibold text-navy-900">{v}</dd>
                </div>
              )}
            </dl>
            <Link to={`/financing?scheme=${schemeId}`} className="mt-5 block">
              <Button className="w-full">{t('action.calculate')}</Button>
            </Link>
          </Card>

          {partner ?
          <Card className="p-5">
              <h2 className="text-base font-bold text-navy-900">{t('detail.partner')}</h2>
              <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-navy-900">
                <BuildingIcon className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" aria-hidden />
                {partner.name}
              </p>
              <p className="mt-1 pl-6 text-sm text-slate-600">{partner.address}</p>
              <p className="mt-2 flex items-center gap-2 pl-0 text-sm text-slate-600">
                <PhoneIcon className="h-4 w-4 shrink-0 text-navy-600" aria-hidden />
                {partner.phone}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <ClockIcon className="h-4 w-4 shrink-0 text-navy-600" aria-hidden />
                {partner.hours}
              </p>
            </Card> :
          null}

          <TrustNotice />
        </aside>
      </div>
    </div>);

}