'use client';

import {useActionState} from 'react';
import {loginAction, type LoginState} from '../actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-8 space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="eyebrow block">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.email} className="input-field" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="eyebrow block">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input-field" />
      </div>
      <p role="alert" className="min-h-5 text-sm text-red-400">
        {state.error}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-acid px-6 py-3.5 font-medium text-ink-950 transition-opacity disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
