'use server';
/**
 * @fileOverview This file defines a Genkit flow for refining project descriptions using AI to emphasize the impact of specific projects based on their objectives and technologies used.
 *
 * - refineProjectDescription - A function that refines a single project description.
 * - RefineProjectDescriptionInput - The input type for the refineProjectDescription function.
 * - RefineProjectDescriptionOutput - The return type for the refineProjectDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineProjectDescriptionInputSchema = z.object({
  projectType: z.string().describe('The type of the project (e.g., marketing site, open-source project, e-commerce implementation).'),
  technologiesUsed: z.string().describe('A comma-separated list of the technologies used in the project.'),
  objectives: z.string().describe('The objectives of the project.'),
  originalDescription: z.string().describe('The original project description.'),
});
export type RefineProjectDescriptionInput = z.infer<typeof RefineProjectDescriptionInputSchema>;

const RefineProjectDescriptionOutputSchema = z.object({
  refinedDescription: z.string().describe('The refined project description, optimized to emphasize impact.'),
});
export type RefineProjectDescriptionOutput = z.infer<typeof RefineProjectDescriptionOutputSchema>;

export async function refineProjectDescription(
  input: RefineProjectDescriptionInput
): Promise<RefineProjectDescriptionOutput> {
  return refineProjectDescriptionFlow(input);
}

const refineProjectDescriptionPrompt = ai.definePrompt({
  name: 'refineProjectDescriptionPrompt',
  input: {schema: RefineProjectDescriptionInputSchema},
  output: {schema: RefineProjectDescriptionOutputSchema},
  prompt: `You are an AI assistant specializing in refining project descriptions to highlight their impact.
  Given the following information about a project, rewrite the original description to emphasize the most relevant aspects based on the project's type, technologies, and objectives.

  Project Type: {{{projectType}}}
  Technologies Used: {{{technologiesUsed}}}
  Objectives: {{{objectives}}}
  Original Description: {{{originalDescription}}}

  Focus on quantifiable results and benefits where possible. For example, for a marketing site, emphasize user conversion; for an open-source project, highlight usage stats and community contributions; for an e-commerce implementation, feature sales and revenue increases.
  The refined description should be concise and engaging.
  `,
});

const refineProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'refineProjectDescriptionFlow',
    inputSchema: RefineProjectDescriptionInputSchema,
    outputSchema: RefineProjectDescriptionOutputSchema,
  },
  async input => {
    const {output} = await refineProjectDescriptionPrompt(input);
    return output!;
  }
);
