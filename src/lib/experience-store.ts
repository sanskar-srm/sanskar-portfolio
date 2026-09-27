import 'server-only';

import {ExperienceListSchema, type Experience} from './experience';
import {readJSON, writeJSON} from './kv';

export {storageMode} from './kv';

export async function getExperience(): Promise<Experience[]> {
  const parsed = ExperienceListSchema.safeParse((await readJSON('portfolio:experience', 'experience')) ?? []);
  return parsed.success ? parsed.data : [];
}

export async function saveExperience(list: Experience[]): Promise<void> {
  await writeJSON('portfolio:experience', 'experience', ExperienceListSchema.parse(list));
}
