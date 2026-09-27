import 'server-only';

import {cache} from 'react';
import {readJSON, writeJSON} from './kv';
import {SettingsSchema, type Settings} from './settings';

export const getSettings = cache(async (): Promise<Settings> => {
  const parsed = SettingsSchema.safeParse((await readJSON('portfolio:settings', 'settings')) ?? {});
  return parsed.success ? parsed.data : {resumeUrl: ''};
});

export async function saveSettings(settings: Settings): Promise<void> {
  await writeJSON('portfolio:settings', 'settings', SettingsSchema.parse(settings));
}
