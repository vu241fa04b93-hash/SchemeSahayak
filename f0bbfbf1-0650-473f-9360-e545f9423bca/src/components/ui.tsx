import React from 'react';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  InfoIcon,
  Loader2Icon,
  ShieldCheckIcon,
  XCircleIcon } from
'lucide-react';
import type { CriterionStatus, EligibilityStatus } from '../types';
import { cx } from '../utils/format';
import { useI18n } from '../contexts/I18nContext';

// --- Button -----------------------------------------------------------------

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const BUTTON_VARIANTS: Record<string, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 disabled:bg-navy-300',
  secondary:
  'bg-white text-navy-900 border border-slate-300 hover:border-navy-400 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-navy-700 hover:bg-navy-50 disabled:text-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

const BUTTON_SIZES: Record<string, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base'
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )} />);


}

// --- Surfaces ---------------------------------------------------------------

export function Card({
  children,
  className,
  as: Tag = 'div'




}: {children: React.ReactNode;className?: string;as?: 'div' | 'section' | 'article' | 'li';}) {
  return (
    <Tag className={cx('rounded-xl border border-slate-200 bg-white', className)}>{children}</Tag>);

}

export function SectionHeading({
  title,
  description,
  action




}: {title: string;description?: string;action?: React.ReactNode;}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-navy-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>);

}

// --- Status -----------------------------------------------------------------

const STATUS_STYLE: Record<EligibilityStatus, {cls: string;Icon: typeof CheckCircle2Icon;}> = {
  eligible: { cls: 'bg-teal-50 text-teal-800 border-teal-200', Icon: CheckCircle2Icon },
  partial: { cls: 'bg-amber-50 text-amber-800 border-amber-200', Icon: AlertTriangleIcon },
  not_eligible: { cls: 'bg-red-50 text-red-800 border-red-200', Icon: XCircleIcon }
};

export function StatusPill({
  status,
  size = 'md'



}: {status: EligibilityStatus;size?: 'sm' | 'md';}) {
  const { t } = useI18n();
  const { cls, Icon } = STATUS_STYLE[status];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        cls,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}>
      
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      {t(`status.${status}`)}
    </span>);

}

const CRITERION_STYLE: Record<CriterionStatus, {cls: string;Icon: typeof CheckCircle2Icon;}> = {
  passed: { cls: 'text-teal-700', Icon: CheckCircle2Icon },
  failed: { cls: 'text-red-700', Icon: XCircleIcon },
  unknown: { cls: 'text-amber-700', Icon: HelpCircleIcon }
};

export function CriterionBadge({ status }: {status: CriterionStatus;}) {
  const { t } = useI18n();
  const { cls, Icon } = CRITERION_STYLE[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-sm font-semibold', cls)}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {t(`status.${status}`)}
    </span>);

}

// --- Form fields ------------------------------------------------------------

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children






}: {label: string;htmlFor: string;error?: string;hint?: string;children: React.ReactNode;}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {error ?
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-700" role="alert">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p> :
      hint ?
      <p className="mt-1.5 text-sm text-slate-500">{hint}</p> :
      null}
    </div>);

}

const CONTROL =
'w-full rounded-lg border bg-white px-3 py-2.5 text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out';

export function Input({
  invalid,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {invalid?: boolean;}) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cx(CONTROL, invalid ? 'border-red-400' : 'border-slate-300', className)} />);


}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {invalid?: boolean;}) {
  return (
    <select
      {...rest}
      aria-invalid={invalid || undefined}
      className={cx(CONTROL, invalid ? 'border-red-400' : 'border-slate-300', className)}>
      
      {children}
    </select>);

}

// --- Feedback states --------------------------------------------------------

export function LoadingState({ label }: {label: string;}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-6 text-slate-700">
      <Loader2Icon className="h-5 w-5 animate-spin text-navy-700" aria-hidden />
      <span className="font-medium">{label}</span>
    </div>);

}

export function ErrorState({ message, onRetry }: {message: string;onRetry?: () => void;}) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-6" role="alert">
      <p className="flex items-center gap-2 font-semibold text-red-800">
        <AlertTriangleIcon className="h-5 w-5 shrink-0" aria-hidden />
        {message}
      </p>
      {onRetry ?
      <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          {t('action.retry')}
        </Button> :
      null}
    </div>);

}

export function EmptyState({
  title,
  body,
  action




}: {title: string;body: string;action?: React.ReactNode;}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <InfoIcon className="mx-auto h-7 w-7 text-slate-400" aria-hidden />
      <h3 className="mt-3 text-base font-bold text-navy-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>);

}

export function ProgressBar({ percent, label }: {percent: number;label?: string;}) {
  return (
    <div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}>
        
        <div
          className="h-full rounded-full bg-teal-600 transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
        
      </div>
    </div>);

}

// --- Trust ------------------------------------------------------------------

export function TrustNotice({ className }: {className?: string;}) {
  const { t } = useI18n();
  return (
    <aside
      className={cx('rounded-xl border border-slate-200 bg-slate-50 p-5', className)}
      aria-label={t('trust.title')}>
      
      <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <ShieldCheckIcon className="h-4 w-4 text-navy-700" aria-hidden />
        {t('trust.title')}
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {['trust.1', 'trust.2', 'trust.3', 'trust.4'].map((key) =>
        <li key={key} className="flex gap-2">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            {t(key)}
          </li>
        )}
      </ul>
    </aside>);

}

export function VerifiedSource({
  source,
  url,
  lastVerified




}: {source: string;url: string;lastVerified: string;}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
        <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden />
        {t('detail.verified')}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="font-medium text-navy-800 underline underline-offset-2 hover:text-navy-950">
        
        {source}
      </a>
      <span className="text-slate-500">· {t('detail.lastVerified', { date: lastVerified })}</span>
    </div>);

}

export function Amount({
  value,
  className



}: {value: string;className?: string;}) {
  return <span className={cx('tabular font-bold text-navy-900', className)}>{value}</span>;
}