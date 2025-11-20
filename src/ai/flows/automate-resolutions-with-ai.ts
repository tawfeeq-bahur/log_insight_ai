'use server';
/**
 * @fileOverview This file contains the Genkit flow for automating resolution steps and creating follow-up tasks using AI tools.
 *
 * - automateResolutionsWithAI - A function that automates resolution steps and creates follow-up tasks.
 * - AutomateResolutionsWithAIInput - The input type for the automateResolutionsWithAI function.
 * - AutomateResolutionsWithAIOutput - The return type for the automateResolutionsWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomateResolutionsWithAIInputSchema = z.object({
  logAnalysis: z.string().describe('The analysis of the log data, including issue type, root cause, suggested fixes, and severity rating.'),
  desiredAction: z.string().describe('The desired action to take based on the log analysis, such as creating a Jira ticket or sending an email.'),
});
export type AutomateResolutionsWithAIInput = z.infer<typeof AutomateResolutionsWithAIInputSchema>;

const AutomateResolutionsWithAIOutputSchema = z.object({
  actionResult: z.string().describe('The result of the automated action, such as the Jira ticket number or the email status.'),
  followUpTasks: z.string().describe('A list of follow-up tasks that need to be done, such as monitoring the ticket or contacting the user.'),
});
export type AutomateResolutionsWithAIOutput = z.infer<typeof AutomateResolutionsWithAIOutputSchema>;

export async function automateResolutionsWithAI(input: AutomateResolutionsWithAIInput): Promise<AutomateResolutionsWithAIOutput> {
  return automateResolutionsWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automateResolutionsWithAIPrompt',
  input: {schema: AutomateResolutionsWithAIInputSchema},
  output: {schema: AutomateResolutionsWithAIOutputSchema},
  prompt: `You are an AI assistant helping to automate log resolution steps and create follow-up tasks.

  Based on the log analysis and the desired action, you will determine the best course of action and generate a list of follow-up tasks.

  Log Analysis: {{{logAnalysis}}}
  Desired Action: {{{desiredAction}}}

  Output the action result and a list of follow-up tasks.
  `,
});

const automateResolutionsWithAIFlow = ai.defineFlow(
  {
    name: 'automateResolutionsWithAIFlow',
    inputSchema: AutomateResolutionsWithAIInputSchema,
    outputSchema: AutomateResolutionsWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
