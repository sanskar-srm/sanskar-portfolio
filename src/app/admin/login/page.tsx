import {redirect} from 'next/navigation';
import {isAuthenticated} from '@/lib/admin/auth';
import LoginForm from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAuthenticated()) redirect('/admin');
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Restricted</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Admin sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
