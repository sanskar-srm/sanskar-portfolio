import {z} from 'zod';

export const ExperienceSchema = z.object({
  id: z.string().min(1).max(64),
  role: z.string().trim().min(1, 'Role is required').max(120),
  company: z.string().trim().min(1, 'Company is required').max(120),
  location: z.string().trim().max(120).default(''),
  start: z.string().trim().min(1, 'Start date is required').max(40),
  /** empty = present */
  end: z.string().trim().max(40).default(''),
  description: z.string().trim().max(2000).default(''),
  highlights: z.array(z.string().trim().min(1).max(300)).max(12).default([]),
  tech: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  link: z
    .string()
    .trim()
    .max(300)
    .refine(v => v === '' || /^https?:\/\//.test(v), 'Link must start with http:// or https://')
    .default(''),
});

export const ExperienceListSchema = z.array(ExperienceSchema).max(40);

export type Experience = z.infer<typeof ExperienceSchema>;
