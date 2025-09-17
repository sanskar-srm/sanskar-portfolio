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

const SendEmailInputSchema = z.object({
  name: z.string().describe('The name of the sender.'),
  email: z.string().email().describe('The email address of the sender.'),
  message: z.string().describe('The message content.'),
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
        to: 'your.email@example.com', // Replace with your actual email
        subject: `Message from ${input.name} via Portfolio`,
        html: `<p>Name: ${input.name}</p><p>Email: ${input.email}</p><p>Message: ${input.message}</p>`,
      });
      return {success: true};
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email.');
    }
  }
);
