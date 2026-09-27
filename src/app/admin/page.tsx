import {redirect} from 'next/navigation';
import {isAuthenticated} from '@/lib/admin/auth';
import {getExperience, storageMode} from '@/lib/experience-store';
import {getSettings} from '@/lib/settings-store';
import {logoutAction} from './actions';
import Dashboard from './dashboard';
import ResumePanel from './resume-panel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect('/admin/login');
  const [experience, settings] = await Promise.all([getExperience(), getSettings()]);
  const mode = storageMode();

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Content</h1>
          <p className="mt-2 text-sm text-mist">
            Manage your resume link and work experience. Storage:{' '}
            <span className={mode === 'redis' ? 'text-acid' : 'text-amber-300'}>
              {mode === 'redis' ? 'Upstash Redis' : 'local file (dev only)'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-acid hover:text-acid">
            View site ↗
          </a>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-red-400 hover:text-red-400">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <ResumePanel initial={settings.resumeUrl} />
      <h2 className="mt-14 font-display text-2xl font-bold tracking-tight">Experience</h2>
      <p className="mt-1 text-sm text-mist">Entries appear in the Journey chapter of the site.</p>
      <Dashboard initial={experience} />
    </main>
  );
}
