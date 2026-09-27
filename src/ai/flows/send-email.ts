'use server';
/**
 * @fileOverview This file defines a Genkit flow for sending an email using Resend.
 *
 * - sendEmail - A function that sends an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Resend} from 'resend';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]!);

const SendEmailInputSchema = z.object({
  name: z.string().min(1).max(200).describe('The name of the sender.'),
  email: z.string().email().describe('The email address of the sender.'),
  message: z.string().min(1).max(5000).describe('The message content.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<{success: boolean}> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({success: z.boolean()}),
  },
  async input => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev', // This should be a configured domain in Resend
        to: 'sanskarbhadani0810@gmail.com', // Replace with your actual email
        subject: `Message from ${input.name} via Portfolio`,
        reply_to: input.email,
        html: `<p>Name: ${escapeHtml(input.name)}</p><p>Email: ${escapeHtml(input.email)}</p><p>Message: ${escapeHtml(input.message).replaceAll('\n', '<br>')}</p>`,
      });
      return {success: true};
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email.');
    }
  }
);
