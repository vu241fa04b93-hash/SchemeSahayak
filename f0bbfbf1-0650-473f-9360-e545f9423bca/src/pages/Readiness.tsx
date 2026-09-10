import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuildingIcon, ClockIcon, PhoneIcon } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Select,
  StatusPill,
  TrustNotice } from
'../components/ui';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { getDocuments, getPartners } from '../data/schemes';

export function Readiness() {
  const { t } = useI18n();
  const { profile, matches, checkedDocuments, toggleDocument, completeness } = useUserData();

  const candidates = useMemo(
    () => [...matches].sort((a, b) => b.match_score - a.match_score),
    [matches]
  );
  const [schemeId, setSchemeId] = useState(candidates[0]?.scheme_id ?? '');
  const selected = candidates.find((m) => m.scheme_id === schemeId) ?? candidates[0] ?? null;

  if (!selected) {
    return (
      <EmptyState
        title={t('ready.title')}
        body={t('dash.noProfile')}
        action={
        <Link to="/profile">
            <Button>{t('nav.profile')}</Button>
          </Link>
        } />);


  }

  const documents = getDocuments(selected.scheme_id);
  const required = documents.filter((d) => d.mandatory === 'yes');
  const readyRequired = required.filter((d) => checkedDocuments.includes(d.document_id)).length;
  const documentPercent = required.length ?
  Math.round(readyRequired / required.length * 100) :
  0;
  const readiness = Math.round(documentPercent * 0.6 + completeness * 0.4);
  const partner = getPartners(selected.scheme_id, profile.state, profile.district)[0];

  const nextSteps = [
  completeness < 100 ?
  { label: 'Complete your requirement so no criterion says “information needed”.', to: '/profile' } :
  null,
  selected.status === 'not_eligible' ?
  { label: 'This scheme is blocked — review the gap analysis before applying.', to: `/scheme/${selected.scheme_id}` } :
  null,
  readyRequired < required.length ?
  { label: `Collect the remaining ${required.length - readyRequired} required documents.`, to: null } :
  null,
  partner ?
  { label: `Submit at ${partner.name}, ${partner.hours}.`, to: null } :
  null].
  filter(Boolean) as {label: string;to: string | null;}[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t('ready.title')}</h1>
          <p className="mt-1 text-slate-600">
            What you still need before you walk into the office.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-600">Scheme</span>
          <Select value={selected.scheme_id} onChange={(e) => setSchemeId(e.target.value)}>
            {candidates.map((m) =>
            <option key={m.scheme_id} value={m.scheme_id}>
                {m.scheme.short_name}
              </option>
            )}
          </Select>
        </label>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">{selected.scheme.scheme_name}</p>
            <p className="tabular mt-1 text-4xl font-extrabold text-navy-900">
              {t('ready.percent', { percent: readiness })}
            </p>
          </div>
          <StatusPill status={selected.status} />
        </div>
        <div className="mt-4">
          <ProgressBar percent={readiness} label={t('ready.title')} />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {readyRequired} of {required.length} required documents ticked · requirement{' '}
          {completeness}% complete
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card className="p-5">
          <h2 className="text-base font-bold text-navy-900">{t('ready.checklist')}</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {documents.map((d) => {
              const checked = checkedDocuments.includes(d.document_id);
              return (
                <li key={d.document_id}>
                  <label className="flex cursor-pointer items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDocument(d.document_id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300" />
                    
                    <span className="flex-1">
                      <span className="block font-semibold text-navy-900">{d.document_name}</span>
                      <span className="block text-sm text-slate-600">{d.description}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      d.mandatory === 'yes' ?
                      'bg-navy-100 text-navy-800' :
                      'bg-amber-100 text-amber-800'}`
                      }>
                      
                      {d.mandatory === 'yes' ? 'Required' : 'If applicable'}
                    </span>
                  </label>
                </li>);

            })}
          </ul>
        </Card>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-bold text-navy-900">{t('ready.next')}</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {nextSteps.map((step, i) =>
              <li key={step.label} className="flex gap-3">
                  <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step.to ?
                <Link to={step.to} className="text-navy-900 underline underline-offset-2">
                      {step.label}
                    </Link> :

                <span className="text-slate-700">{step.label}</span>
                }
                </li>
              )}
            </ol>
          </Card>

          {partner ?
          <Card className="p-5">
              <h2 className="text-base font-bold text-navy-900">{t('detail.partner')}</h2>
              <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-navy-900">
                <BuildingIcon className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" aria-hidden />
                {partner.name}
              </p>
              <p className="mt-1 pl-6 text-sm text-slate-600">{partner.address}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
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