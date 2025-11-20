'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting and masking sensitive data in log files.
 *
 * - maskSensitiveData - An exported function that masks sensitive data.
 * - MaskSensitiveDataInput - The input type for the maskSensitiveData function.
 * - MaskSensitiveDataOutput - The output type for the maskSensitiveData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaskSensitiveDataInputSchema = z.object({
  logContent: z.string().describe('The log content to be scanned and masked.'),
});
export type MaskSensitiveDataInput = z.infer<typeof MaskSensitiveDataInputSchema>;

const RedactionItemSchema = z.object({
  original: z.string().describe('The original sensitive value that was detected.'),
  masked: z.string().describe('The masked version of the value (e.g., "[REDACTED_EMAIL]").'),
});

const MaskSensitiveDataOutputSchema = z.object({
  maskedLog: z.string().describe('The full log content with all sensitive data replaced by masked values.'),
  redactions: z.array(RedactionItemSchema).describe('A list of all the redactions that were performed.'),
});
export type MaskSensitiveDataOutput = z.infer<typeof MaskSensitiveDataOutputSchema>;

export async function maskSensitiveData(input: MaskSensitiveDataInput): Promise<MaskSensitiveDataOutput> {
  return maskSensitiveDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'maskSensitiveDataPrompt',
  input: {schema: MaskSensitiveDataInputSchema},
  output: {schema: MaskSensitiveDataOutputSchema},
  prompt: `You are a security expert specializing in data loss prevention (DLP).
  Your task is to scan the provided log file and automatically detect and mask any sensitive or personal information.

  Log Content:
  {{{logContent}}}

  Detect the following types of information:
  - Names (e.g., Tawfeeq)
  - Email addresses
  - Phone numbers
  - API Keys
  - Access Tokens
  - Password fields
  - IP addresses
  - Device IDs
  - Session IDs
  - Any metadata containing private info (like SSN, address, etc.)

  Replace all detected sensitive **values** with a secure mask (e.g., "[REDACTED_EMAIL]").
  **Important**: Do NOT change the field names (keys), only mask the values. The log structure must be maintained exactly. For example, if you find 'email: "test@example.com"', you should replace it with 'email: "[REDACTED_EMAIL]"'.

  Your output must be a JSON object containing two fields:
  1.  'maskedLog': The complete log content with all sensitive data values replaced.
  2.  'redactions': An array of objects, where each object details a change you made, with 'original' and 'masked' keys. For example: { "original": "test@example.com", "masked": "[REDACTED_EMAIL]" }.
  If no sensitive data is found, return the original log content in 'maskedLog' and an empty 'redactions' array.
  `,
});

const maskSensitiveDataFlow = ai.defineFlow(
  {
    name: 'maskSensitiveDataFlow',
    inputSchema: MaskSensitiveDataInputSchema,
    outputSchema: MaskSensitiveDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
