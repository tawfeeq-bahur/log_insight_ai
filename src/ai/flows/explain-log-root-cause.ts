'use server';

/**
 * @fileOverview Analyzes log files to explain the root cause of errors.
 *
 * - explainLogRootCause - A function that handles the log analysis and root cause explanation.
 * - ExplainLogRootCauseInput - The input type for the explainLogRootCause function.
 * - ExplainLogRootCauseOutput - The return type for the explainLogRootCause function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainLogRootCauseInputSchema = z.object({
  logContent: z
    .string()
    .describe('The content of the log file to be analyzed.'),
});
export type ExplainLogRootCauseInput = z.infer<typeof ExplainLogRootCauseInputSchema>;

const ExplainLogRootCauseOutputSchema = z.object({
  issueType: z.string().describe('The type of issue identified in the log.'),
  rootCause: z.string().describe('A clear and concise explanation of the root cause of the error.'),
  suggestedFix: z.string().describe('A suggestion for how to fix the error.'),
  severityRating: z.string().describe('A rating of the severity of the issue (e.g., low, medium, high).'),
});
export type ExplainLogRootCauseOutput = z.infer<typeof ExplainLogRootCauseOutputSchema>;

export async function explainLogRootCause(input: ExplainLogRootCauseInput): Promise<ExplainLogRootCauseOutput> {
  return explainLogRootCauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainLogRootCausePrompt',
  input: {schema: ExplainLogRootCauseInputSchema},
  output: {schema: ExplainLogRootCauseOutputSchema},
  prompt: `Analyze the following log file content and explain the root cause of any errors or issues.

Log Content:
{{logContent}}

Provide the following information in your response:

- Issue Type: A brief description of the type of issue identified in the log.
- Root Cause: A clear and concise explanation of the root cause of the error.
- Suggested Fix: A suggestion for how to fix the error.
- Severity Rating: A rating of the severity of the issue (e.g., low, medium, high).`,
});

const explainLogRootCauseFlow = ai.defineFlow(
  {
    name: 'explainLogRootCauseFlow',
    inputSchema: ExplainLogRootCauseInputSchema,
    outputSchema: ExplainLogRootCauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
