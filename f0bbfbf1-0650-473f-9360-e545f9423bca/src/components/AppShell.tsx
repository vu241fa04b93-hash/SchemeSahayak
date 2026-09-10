import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  CircleDotIcon,
  LandmarkIcon,
  LogOutIcon,
  MenuIcon,
  XIcon } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useUserData } from '../contexts/UserDataContext';
import { cx } from '../utils/format';

const NAV = [
{ to: '/dashboard', key: 'nav.dashboard' },
{ to: '/profile', key: 'nav.profile' },
{ to: '/assistant', key: 'nav.assistant' },
{ to: '/results', key: 'nav.results' },
{ to: '/financing', key: 'nav.financing' },
{ to: '/readiness', key: 'nav.documents' }];


const JOURNEY = [
{ to: '/profile', key: 'journey.profile' },
{ to: '/results', key: 'journey.matching' },
{ to: '/financing', key: 'journey.financing' },
{ to: '/readiness', key: 'journey.documents' }];


export function LanguageSelect({ compact = false }: {compact?: boolean;}) {
  const { language, setLanguage, languages, t } = useI18n();
  return (
    <label className="inline-flex items-center gap-2">
      <span className={compact ? 'sr-only' : 'text-sm font-medium text-white/80'}>
        {t('nav.language')}
      </span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="rounded-lg border border-white/25 bg-navy-800 px-2.5 py-1.5 text-sm font-medium text-white">
        
        {languages.map((l) =>
        <option key={l.code} value={l.code} className="text-navy-900">
            {l.native}
          </option>
        )}
      </select>
    </label>);

}

export function DemoModeBanner() {
  const { mode } = useAuth();
  const { t } = useI18n();
  if (mode !== 'demo') return null;
  return (
    <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      <span className="mr-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
        {t('demo.badge')}
      </span>
      {t('demo.explain')}
    </div>);

}

function JourneyBar() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { hasRequirement, completeness, matches } = useUserData();

  const currentIndex = Math.max(
    0,
    JOURNEY.findIndex((s) => pathname.startsWith(s.to))
  );
  const done = [
  completeness >= 80,
  hasRequirement && matches.length > 0,
  hasRequirement && matches.some((m) => m.status !== 'not_eligible'),
  false];


  return (
    <nav aria-label="Your journey" className="border-b border-slate-200 bg-white">
      <ol className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
        {JOURNEY.map((step, i) => {
          const isCurrent = i === currentIndex && pathname.startsWith(step.to);
          const isDone = done[i] && !isCurrent;
          return (
            <li key={step.to} className="flex shrink-0 items-center">
              <NavLink
                to={step.to}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors duration-150 ease-out',
                  isCurrent ?
                  'bg-navy-900 font-semibold text-white' :
                  isDone ?
                  'font-medium text-teal-700 hover:bg-teal-50' :
                  'text-slate-500 hover:bg-slate-100'
                )}
                aria-current={isCurrent ? 'step' : undefined}>
                
                {isDone ?
                <CheckIcon className="h-3.5 w-3.5" aria-hidden /> :
                isCurrent ?
                <CircleDotIcon className="h-3.5 w-3.5" aria-hidden /> :

                <span
                  aria-hidden
                  className="h-3.5 w-3.5 rounded-full border border-current opacity-50" />

                }
                {t(step.key)}
              </NavLink>
              {i < JOURNEY.length - 1 ?
              <span aria-hidden className="mx-1 h-px w-4 bg-slate-300 sm:w-8" /> :
              null}
            </li>);

        })}
      </ol>
    </nav>);

}

export function AppShell({ children }: {children: React.ReactNode;}) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight">
            <LandmarkIcon className="h-5 w-5" aria-hidden />
            {t('app.name')}
          </Link>

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
              cx(
                'rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out',
                isActive ? 'bg-white/15 font-semibold' : 'text-white/80 hover:bg-white/10'
              )
              }>
              
                {t(item.key)}
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSelect compact />
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ease-out hover:bg-white/10 sm:inline-flex">
              
              <LogOutIcon className="h-4 w-4" aria-hidden />
              {t('nav.signOut')}
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
              aria-expanded={open}
              aria-label="Menu">
              
              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ?
        <nav aria-label="Main" className="border-t border-white/10 px-4 pb-3 lg:hidden">
            <ul className="grid gap-1 pt-2">
              {NAV.map((item) =>
            <li key={item.to}>
                  <NavLink
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                cx(
                  'block rounded-lg px-3 py-2 text-sm',
                  isActive ? 'bg-white/15 font-semibold' : 'text-white/85 hover:bg-white/10'
                )
                }>
                
                    {t(item.key)}
                  </NavLink>
                </li>
            )}
              <li>
                <button
                type="button"
                onClick={handleSignOut}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-white/10">
                
                  <LogOutIcon className="h-4 w-4" aria-hidden />
                  {t('nav.signOut')}
                </button>
              </li>
            </ul>
          </nav> :
        null}
      </header>

      <DemoModeBanner />
      <JourneyBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
        {t('app.name')} · {user?.email}
      </footer>
    </div>);

}