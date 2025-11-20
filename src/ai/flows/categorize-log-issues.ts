'use server';
/**
 * @fileOverview This file defines a Genkit flow for categorizing log issues.
 *
 * - categorizeLogIssues - An exported function that categorizes log issues.
 * - CategorizeLogIssuesInput - The input type for the categorizeLogIssues function.
 * - CategorizeLogIssuesOutput - The output type for the categorizeLogIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeLogIssuesInputSchema = z.object({
  sanitizedLog: z.string().describe('The sanitized log data to categorize.'),
});
export type CategorizeLogIssuesInput = z.infer<typeof CategorizeLogIssuesInputSchema>;

const CategorizeLogIssuesOutputSchema = z.object({
  issueType: z.string().describe('The categorized issue type of the log.'),
  rootCause: z.string().describe('The root cause of the issue.'),
  suggestedFix: z.string().describe('A suggested fix for the issue.'),
  severityRating: z.string().describe('The severity rating of the issue (e.g., low, medium, high).'),
});
export type CategorizeLogIssuesOutput = z.infer<typeof CategorizeLogIssuesOutputSchema>;

export async function categorizeLogIssues(input: CategorizeLogIssuesInput): Promise<CategorizeLogIssuesOutput> {
  return categorizeLogIssuesFlow(input);
}

const categorizeLogIssuesPrompt = ai.definePrompt({
  name: 'categorizeLogIssuesPrompt',
  input: {schema: CategorizeLogIssuesInputSchema},
  output: {schema: CategorizeLogIssuesOutputSchema},
  prompt: `You are an expert system administrator specializing in categorizing log file issues.

  Analyze the following sanitized log data and determine the issue type, root cause, suggested fix, and severity rating.

  Sanitized Log Data: {{{sanitizedLog}}}

  Provide your analysis in a structured format.

  Issue Type:
  Root Cause:
  Suggested Fix:
  Severity Rating:`, 
});

const categorizeLogIssuesFlow = ai.defineFlow(
  {
    name: 'categorizeLogIssuesFlow',
    inputSchema: CategorizeLogIssuesInputSchema,
    outputSchema: CategorizeLogIssuesOutputSchema,
  },
  async input => {
    const {output} = await categorizeLogIssuesPrompt(input);
    return output!;
  }
);
