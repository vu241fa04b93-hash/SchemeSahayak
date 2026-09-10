import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LandmarkIcon } from 'lucide-react';
import { Button, Card, Field, Input, TrustNotice } from '../components/ui';
import { LanguageSelect } from '../components/AppShell';
import { AuthError, useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

type Errors = Partial<Record<'full_name' | 'email' | 'password' | 'confirm' | 'form', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Auth({ mode }: {mode: 'login' | 'register';}) {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as {returnTo?: string;} | null)?.returnTo ?? '/dashboard';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  function validate(): Errors {
    const next: Errors = {};
    if (isRegister && !fullName.trim()) next.full_name = t('valid.required');
    if (!email.trim()) next.email = t('valid.required');else
    if (!EMAIL_RE.test(email.trim())) next.email = t('valid.email');
    if (!password) next.password = t('valid.required');else
    if (isRegister && password.length < 8) next.password = t('valid.password');
    if (isRegister && confirm !== password) next.confirm = t('valid.passwordMatch');
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined
        });
      } else {
        await login(email.trim(), password);
      }
      navigate(returnTo, { replace: true });
    } catch (e) {
      const code = e instanceof AuthError ? e.code : 'network';
      const message =
      code === 'not_found' ?
      t('auth.errNotFound') :
      code === 'wrong_password' ?
      t('auth.errWrongPassword') :
      code === 'exists' ?
      t('auth.errExists') :
      t('auth.errNetwork');
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <LandmarkIcon className="h-5 w-5" aria-hidden />
            {t('app.name')}
          </Link>
          <div className="ml-auto">
            <LanguageSelect compact />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-navy-900">
            {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
          </h1>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {errors.form ?
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800">
              
                {errors.form}
              </p> :
            null}

            {isRegister ?
            <Field label={t('form.fullName')} htmlFor="full_name" error={errors.full_name}>
                <Input
                id="full_name"
                value={fullName}
                autoComplete="name"
                invalid={Boolean(errors.full_name)}
                onChange={(e) => setFullName(e.target.value)} />
              
              </Field> :
            null}

            <Field label={t('auth.email')} htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={email}
                autoComplete="email"
                invalid={Boolean(errors.email)}
                onChange={(e) => setEmail(e.target.value)} />
              
            </Field>

            {isRegister ?
            <Field label={t('auth.phone')} htmlFor="phone" hint={t('form.optional')}>
                <Input
                id="phone"
                type="tel"
                value={phone}
                autoComplete="tel"
                onChange={(e) => setPhone(e.target.value)} />
              
              </Field> :
            null}

            <Field label={t('auth.password')} htmlFor="password" error={errors.password}>
              <Input
                id="password"
                type="password"
                value={password}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                invalid={Boolean(errors.password)}
                onChange={(e) => setPassword(e.target.value)} />
              
            </Field>

            {isRegister ?
            <Field label={t('auth.confirm')} htmlFor="confirm" error={errors.confirm}>
                <Input
                id="confirm"
                type="password"
                value={confirm}
                autoComplete="new-password"
                invalid={Boolean(errors.confirm)}
                onChange={(e) => setConfirm(e.target.value)} />
              
              </Field> :
            null}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? '…' : isRegister ? t('nav.register') : t('nav.signIn')}
            </Button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            <Link
              to={isRegister ? '/login' : '/register'}
              className="font-semibold text-navy-800 underline underline-offset-2">
              
              {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
            </Link>
          </p>
        </Card>

        <div className="space-y-5">
          <TrustNotice />
        </div>
      </main>
    </div>);

}