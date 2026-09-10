import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  CalculatorIcon,
  FileCheckIcon,
  LandmarkIcon,
  ListChecksIcon,
  MessagesSquareIcon } from
'lucide-react';
import { Button, Card, TrustNotice } from '../components/ui';
import { LanguageSelect } from '../components/AppShell';
import { useI18n } from '../contexts/I18nContext';

const FEATURES = [
{
  Icon: ListChecksIcon,
  title: 'A verdict, not a list',
  body: 'Every scheme comes back eligible, partially eligible or not eligible — with the exact criterion that decided it.'
},
{
  Icon: CalculatorIcon,
  title: 'Your actual money',
  body: 'Subsidy, loan amount, EMI, total interest and whether the repayment fits your income — all from your own numbers.'
},
{
  Icon: MessagesSquareIcon,
  title: 'Ask in your language',
  body: 'Describe your plan in Telugu, Hindi, Tamil, Kannada or English — by typing or speaking.'
},
{
  Icon: FileCheckIcon,
  title: 'Ready to apply',
  body: 'A document checklist per scheme, your readiness percentage, and the branch or office that accepts it.'
}];


const STEPS = [
{ title: 'Tell us what you need', body: 'A short form or a conversation — whichever you prefer.' },
{ title: 'See who says yes', body: 'Schemes are checked against your answers, criterion by criterion.' },
{ title: 'Understand the money', body: 'EMI, subsidy and affordability, computed from your figures.' },
{ title: 'Walk in prepared', body: 'Documents, readiness and where to submit your application.' }];


export function Landing() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 font-extrabold tracking-tight">
            <LandmarkIcon className="h-5 w-5" aria-hidden />
            {t('app.name')}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSelect compact />
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/90 hover:bg-white/10">
              
              {t('nav.signIn')}
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-slate-100">
              
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-navy-900 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-24 lg:pt-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-300">
                Public service · Government schemes
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {t('app.tagline')}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                Say what you want to start, where, and how much it will cost. SchemeSahayak checks
                every scheme against your answers and shows you the money before you walk into a
                bank.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                    {t('action.getStarted')}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                    {t('nav.signIn')}
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="p-6 shadow-xl">
              <p className="text-sm font-semibold text-slate-500">Example requirement</p>
              <p className="mt-2 text-lg font-semibold text-navy-900">
                “I want to start a tailoring unit in Guntur with ₹3 lakh.”
              </p>
              <dl className="mt-5 space-y-3 text-sm">
                {[
                ['Schemes analysed', '10'],
                ['Eligible right now', '3'],
                ['Needs more information', '4'],
                ['Estimated EMI at 11% over 5 years', '₹5,870']].
                map(([k, v]) =>
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
                    <dt className="text-slate-600">{k}</dt>
                    <dd className="tabular font-bold text-navy-900">{v}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Illustrative. Your figures drive every number on every screen.
              </p>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ Icon, title, body }) =>
            <Card key={title} className="flex h-full flex-col p-5">
                <Icon className="h-6 w-6 text-navy-700" aria-hidden />
                <h2 className="mt-3 text-base font-bold text-navy-900">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </Card>
            )}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-bold text-navy-900">How it works</h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) =>
              <li key={step.title} className="border-t-2 border-navy-900 pt-4">
                  <span className="tabular text-sm font-bold text-teal-700">Step {i + 1}</span>
                  <h3 className="mt-1 text-base font-bold text-navy-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>
                </li>
              )}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <TrustNotice />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
        {t('app.name')} — information service. Always confirm final terms with the implementing
        agency.
      </footer>
    </div>);

}