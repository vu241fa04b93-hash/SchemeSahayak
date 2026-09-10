import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { Button, Card, Field, Input, ProgressBar, Select } from '../components/ui';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import type { ApplicantProfile } from '../types';
import { formatINR, parseAmountInput } from '../utils/format';

const STATES = [
'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra',
'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal',
'Odisha', 'Punjab', 'Haryana', 'Delhi'];


const EDUCATION = [
{ value: 'below8th', label: 'Below class 8' },
{ value: '8th', label: 'Class 8' },
{ value: '10th', label: 'Class 10' },
{ value: '12th', label: 'Class 12' },
{ value: 'diploma', label: 'Diploma / ITI' },
{ value: 'graduate', label: 'Graduate or above' }];


const BUSINESS_TYPES = ['manufacturing', 'service', 'trading', 'agriculture', 'education/training'];

type Errors = Record<string, string>;

export function ProfileForm() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { profile, saveProfile } = useUserData();

  const [draft, setDraft] = useState<ApplicantProfile>(profile);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ApplicantProfile,>(key: K, value: ApplicantProfile[K]) =>
  setDraft((d) => ({ ...d, [key]: value }));

  const steps = useMemo(
    () => [
    { title: 'About you' },
    { title: 'Where you are' },
    { title: 'Your business' },
    { title: 'Your money' }],

    []
  );

  function validateStep(index: number): Errors {
    const e: Errors = {};
    if (index === 0) {
      if (!draft.full_name?.trim()) e.full_name = t('valid.required');
      if (draft.age === undefined) e.age = t('valid.required');else
      if (draft.age < 15 || draft.age > 90) e.age = t('valid.age');
      if (!draft.gender) e.gender = t('valid.required');
      if (!draft.category) e.category = t('valid.required');
      if (!draft.education) e.education = t('valid.required');
    }
    if (index === 1) {
      if (!draft.state) e.state = t('valid.required');
      if (!draft.district?.trim()) e.district = t('valid.required');
    }
    if (index === 2) {
      if (!draft.business_type) e.business_type = t('valid.required');
      if (!draft.trade?.trim()) e.trade = t('valid.required');
      if (!draft.enterprise_status) e.enterprise_status = t('valid.required');
      if (!draft.enterprise_size) e.enterprise_size = t('valid.required');
    }
    if (index === 3) {
      if (draft.project_cost === undefined || draft.project_cost <= 0)
      e.project_cost = t('valid.positive');
      if (draft.own_contribution === undefined) e.own_contribution = t('valid.required');else
      if (draft.project_cost !== undefined && draft.own_contribution > draft.project_cost)
      e.own_contribution = t('valid.contribution');
      if (draft.monthly_income === undefined || draft.monthly_income <= 0)
      e.monthly_income = t('valid.positive');
    }
    return e;
  }

  async function handleNext() {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    await saveProfile(draft);
    setSaving(false);

    if (step < steps.length - 1) setStep(step + 1);else
    navigate('/results');
  }

  const percent = Math.round((step + 1) / steps.length * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-navy-900">{t('nav.profile')}</h1>
      <p className="mt-1 text-slate-600">
        Every answer feeds the eligibility check and the EMI, so change one number and the whole
        result changes.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-navy-900">
            {step + 1}. {steps[step].title}
          </span>
          <span className="tabular text-slate-500">
            {step + 1} / {steps.length}
          </span>
        </div>
        <ProgressBar percent={percent} label="Form progress" />
      </div>

      <Card className="mt-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {step === 0 ?
          <>
              <div className="sm:col-span-2">
                <Field label={t('form.fullName')} htmlFor="full_name" error={errors.full_name}>
                  <Input
                  id="full_name"
                  value={draft.full_name ?? ''}
                  invalid={Boolean(errors.full_name)}
                  onChange={(e) => set('full_name', e.target.value)} />
                
                </Field>
              </div>
              <Field label={t('form.age')} htmlFor="age" error={errors.age}>
                <Input
                id="age"
                inputMode="numeric"
                value={draft.age ?? ''}
                invalid={Boolean(errors.age)}
                onChange={(e) => set('age', parseAmountInput(e.target.value))} />
              
              </Field>
              <Field label={t('form.gender')} htmlFor="gender" error={errors.gender}>
                <Select
                id="gender"
                value={draft.gender ?? ''}
                invalid={Boolean(errors.gender)}
                onChange={(e) => set('gender', (e.target.value || undefined) as never)}>
                
                  <option value="">—</option>
                  <option value="female">Woman</option>
                  <option value="male">Man</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label={t('form.category')} htmlFor="category" error={errors.category}>
                <Select
                id="category"
                value={draft.category ?? ''}
                invalid={Boolean(errors.category)}
                onChange={(e) => set('category', (e.target.value || undefined) as never)}>
                
                  <option value="">—</option>
                  {['General', 'OBC', 'SC', 'ST', 'Minority'].map((c) =>
                <option key={c} value={c}>
                      {c}
                    </option>
                )}
                </Select>
              </Field>
              <Field label={t('form.education')} htmlFor="education" error={errors.education}>
                <Select
                id="education"
                value={draft.education ?? ''}
                invalid={Boolean(errors.education)}
                onChange={(e) => set('education', e.target.value || undefined)}>
                
                  <option value="">—</option>
                  {EDUCATION.map((o) =>
                <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                )}
                </Select>
              </Field>
            </> :
          null}

          {step === 1 ?
          <>
              <Field label={t('form.state')} htmlFor="state" error={errors.state}>
                <Select
                id="state"
                value={draft.state ?? ''}
                invalid={Boolean(errors.state)}
                onChange={(e) => set('state', e.target.value || undefined)}>
                
                  <option value="">—</option>
                  {STATES.map((s) =>
                <option key={s} value={s}>
                      {s}
                    </option>
                )}
                </Select>
              </Field>
              <Field
              label={t('form.district')}
              htmlFor="district"
              error={errors.district}
              hint="State schemes and your nearest office depend on this.">
              
                <Input
                id="district"
                value={draft.district ?? ''}
                invalid={Boolean(errors.district)}
                onChange={(e) => set('district', e.target.value)} />
              
              </Field>
            </> :
          null}

          {step === 2 ?
          <>
              <Field
              label={t('form.businessType')}
              htmlFor="business_type"
              error={errors.business_type}>
              
                <Select
                id="business_type"
                value={draft.business_type ?? ''}
                invalid={Boolean(errors.business_type)}
                onChange={(e) => set('business_type', e.target.value || undefined)}>
                
                  <option value="">—</option>
                  {BUSINESS_TYPES.map((b) =>
                <option key={b} value={b}>
                      {b}
                    </option>
                )}
                </Select>
              </Field>
              <Field label={t('form.trade')} htmlFor="trade" error={errors.trade}>
                <Input
                id="trade"
                placeholder="Tailoring unit"
                value={draft.trade ?? ''}
                invalid={Boolean(errors.trade)}
                onChange={(e) => set('trade', e.target.value)} />
              
              </Field>
              <Field
              label={t('form.enterpriseStatus')}
              htmlFor="enterprise_status"
              error={errors.enterprise_status}>
              
                <Select
                id="enterprise_status"
                value={draft.enterprise_status ?? ''}
                invalid={Boolean(errors.enterprise_status)}
                onChange={(e) => set('enterprise_status', (e.target.value || undefined) as never)}>
                
                  <option value="">—</option>
                  <option value="new">New unit</option>
                  <option value="existing">Existing unit</option>
                </Select>
              </Field>
              <Field label="Enterprise size" htmlFor="enterprise_size" error={errors.enterprise_size}>
                <Select
                id="enterprise_size"
                value={draft.enterprise_size ?? ''}
                invalid={Boolean(errors.enterprise_size)}
                onChange={(e) => set('enterprise_size', (e.target.value || undefined) as never)}>
                
                  <option value="">—</option>
                  <option value="micro">Micro</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                </Select>
              </Field>
              <Field label="Can you offer collateral?" htmlFor="has_collateral">
                <Select
                id="has_collateral"
                value={draft.has_collateral === undefined ? '' : String(draft.has_collateral)}
                onChange={(e) =>
                set('has_collateral', e.target.value === '' ? undefined : e.target.value === 'true')
                }>
                
                  <option value="">—</option>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </Field>
              <Field label="Have you taken a government subsidy before?" htmlFor="previous_subsidy">
                <Select
                id="previous_subsidy"
                value={draft.previous_subsidy === undefined ? '' : String(draft.previous_subsidy)}
                onChange={(e) =>
                set(
                  'previous_subsidy',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
                }>
                
                  <option value="">—</option>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </Field>
            </> :
          null}

          {step === 3 ?
          <>
              <Field
              label={t('form.projectCost')}
              htmlFor="project_cost"
              error={errors.project_cost}
              hint={draft.project_cost ? formatINR(draft.project_cost) : undefined}>
              
                <Input
                id="project_cost"
                inputMode="numeric"
                value={draft.project_cost ?? ''}
                invalid={Boolean(errors.project_cost)}
                onChange={(e) => set('project_cost', parseAmountInput(e.target.value))} />
              
              </Field>
              <Field
              label={t('form.ownContribution')}
              htmlFor="own_contribution"
              error={errors.own_contribution}
              hint={draft.own_contribution ? formatINR(draft.own_contribution) : undefined}>
              
                <Input
                id="own_contribution"
                inputMode="numeric"
                value={draft.own_contribution ?? ''}
                invalid={Boolean(errors.own_contribution)}
                onChange={(e) => set('own_contribution', parseAmountInput(e.target.value))} />
              
              </Field>
              <Field
              label={t('form.monthlyIncome')}
              htmlFor="monthly_income"
              error={errors.monthly_income}
              hint={draft.monthly_income ? formatINR(draft.monthly_income) : undefined}>
              
                <Input
                id="monthly_income"
                inputMode="numeric"
                value={draft.monthly_income ?? ''}
                invalid={Boolean(errors.monthly_income)}
                onChange={(e) => set('monthly_income', parseAmountInput(e.target.value))} />
              
              </Field>
              <Field label={t('form.tenure')} htmlFor="tenure">
                <Select
                id="tenure"
                value={draft.preferred_tenure_years ?? 5}
                onChange={(e) => set('preferred_tenure_years', Number(e.target.value))}>
                
                  {[1, 2, 3, 5, 7].map((y) =>
                <option key={y} value={y}>
                      {y} {y === 1 ? 'year' : 'years'}
                    </option>
                )}
                </Select>
              </Field>
            </> :
          null}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}>
            
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            {t('action.back')}
          </Button>
          <Button onClick={handleNext} disabled={saving}>
            {step === 3 ?
            <>
                <CheckIcon className="h-4 w-4" aria-hidden />
                {t('nav.results')}
              </> :

            <>
                {t('action.continue')}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </>
            }
          </Button>
        </div>
      </Card>
    </div>);

}