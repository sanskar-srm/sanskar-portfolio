import {z} from 'zod';

/** Pulls the file id out of any common Google Drive share URL. */
export function driveFileId(url: string): string | null {
  const patterns = [/\/file\/d\/([\w-]{10,})/, /[?&]id=([\w-]{10,})/, /\/d\/([\w-]{10,})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export const SettingsSchema = z.object({
  resumeUrl: z
    .string()
    .trim()
    .max(500)
    .refine(v => v === '' || (/^https:\/\/(drive|docs)\.google\.com\//.test(v) && !!driveFileId(v)), {
      message: 'Paste a Google Drive share link, e.g. https://drive.google.com/file/d/…/view',
    })
    .default(''),
});

export type Settings = z.infer<typeof SettingsSchema>;
