'use server';

import {revalidatePath, revalidateTag} from 'next/cache';
import {redirect} from 'next/navigation';
import {
  adminConfigured,
  clearFailures,
  clientKey,
  createSession,
  destroySession,
  isAuthenticated,
  isThrottled,
  recordFailure,
  verifyCredentials,
} from '@/lib/admin/auth';
import {ExperienceListSchema, type Experience} from '@/lib/experience';
import {saveExperience} from '@/lib/experience-store';
import {SettingsSchema} from '@/lib/settings';
import {saveSettings} from '@/lib/settings-store';

export type LoginState = {error?: string; email?: string};

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) return {error: 'Admin is not configured on this server (missing env vars).'};

  const key = await clientKey();
  if (isThrottled(key)) return {error: 'Too many attempts. Try again in 15 minutes.', email: String(formData.get('email') ?? '')};

  const email = String(formData.get('email') ?? '').slice(0, 200);
  const password = String(formData.get('password') ?? '');
  const ok = await verifyCredentials(email, password);
  if (!ok) {
    recordFailure(key);
    await new Promise(r => setTimeout(r, 600));
    return {error: 'Invalid email or password.', email};
  }

  clearFailures(key);
  await createSession();
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/admin/login');
}

export async function saveExperienceAction(list: Experience[]): Promise<{ok: boolean; error?: string}> {
  if (!(await isAuthenticated())) return {ok: false, error: 'Your session expired. Please sign in again.'};

  const parsed = ExperienceListSchema.safeParse(list);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {ok: false, error: `Entry ${Number(issue.path[0]) + 1}: ${issue.message}`};
  }

  try {
    await saveExperience(parsed.data);
  } catch (e) {
    return {ok: false, error: e instanceof Error ? e.message : 'Could not save.'};
  }
  revalidatePath('/');
  return {ok: true};
}

export async function saveResumeAction(resumeUrl: string): Promise<{ok: boolean; error?: string}> {
  if (!(await isAuthenticated())) return {ok: false, error: 'Your session expired. Please sign in again.'};

  const parsed = SettingsSchema.safeParse({resumeUrl});
  if (!parsed.success) return {ok: false, error: parsed.error.issues[0].message};

  try {
    await saveSettings(parsed.data);
  } catch (e) {
    return {ok: false, error: e instanceof Error ? e.message : 'Could not save.'};
  }
  revalidateTag('resume');
  revalidatePath('/', 'layout');
  return {ok: true};
}
