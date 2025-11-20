'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting fixes based on AI analysis of log data.
 * It includes the flow definition, input/output schemas, and a wrapper function.
 *
 * @exports suggestFixesForLogs - The wrapper function to trigger the flow.
 * @exports SuggestFixesForLogsInput - The input type for the suggestFixesForLogs function.
 * @exports SuggestFixesForLogsOutput - The output type for the suggestFixesForLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFixesForLogsInputSchema = z.object({
  logData: z.string().describe('The sanitized log data to analyze.'),
  issueType: z.string().describe('The identified issue type from the log analysis.'),
  rootCause: z.string().describe('The root cause identified from the log analysis.'),
});
export type SuggestFixesForLogsInput = z.infer<typeof SuggestFixesForLogsInputSchema>;

const SuggestFixesForLogsOutputSchema = z.object({
  suggestedFixes: z.array(z.string()).describe('An array of suggested fixes for the identified issue.'),
  severityRating: z.string().describe('A rating of the severity of the issue (e.g., Low, Medium, High).'),
});
export type SuggestFixesForLogsOutput = z.infer<typeof SuggestFixesForLogsOutputSchema>;

export async function suggestFixesForLogs(input: SuggestFixesForLogsInput): Promise<SuggestFixesForLogsOutput> {
  return suggestFixesForLogsFlow(input);
}

const suggestFixesPrompt = ai.definePrompt({
  name: 'suggestFixesPrompt',
  input: {schema: SuggestFixesForLogsInputSchema},
  output: {schema: SuggestFixesForLogsOutputSchema},
  prompt: `You are an AI expert in debugging and resolving software issues.
  Based on the provided log data, issue type, and root cause, suggest potential fixes and estimate the severity.

  Log Data: {{{logData}}}
  Issue Type: {{{issueType}}}
  Root Cause: {{{rootCause}}}

  Provide an array of suggested fixes that can be implemented to resolve the issue.
  Also, provide a severity rating (Low, Medium, High) based on the potential impact of the issue.
  Ensure the suggested fixes are practical and directly address the root cause.
  Ensure the severity rating is accurate and justified based on the provided information.
`,
});

const suggestFixesForLogsFlow = ai.defineFlow(
  {
    name: 'suggestFixesForLogsFlow',
    inputSchema: SuggestFixesForLogsInputSchema,
    outputSchema: SuggestFixesForLogsOutputSchema,
  },
  async input => {
    const {output} = await suggestFixesPrompt(input);
    return output!;
  }
);
