'use server';

import {
  explainLogRootCause,
  type ExplainLogRootCauseInput,
  type ExplainLogRootCauseOutput,
} from '@/ai/flows/explain-log-root-cause';
import {
  automateResolutionsWithAI,
  type AutomateResolutionsWithAIInput,
  type AutomateResolutionsWithAIOutput,
} from '@/ai/flows/automate-resolutions-with-ai';
import {
  intelligentlyCacheAIResults,
  type IntelligentlyCacheAIResultsInput,
  type IntelligtlyCacheAIResultsOutput,
} from '@/ai/flows/intelligently-cache-ai-results';


export async function performAnalysis(
  input: ExplainLogRootCauseInput
): Promise<ExplainLogRootCauseOutput> {
  try {
    const output = await explainLogRootCause(input);
    return output;
  } catch (error) {
    console.error('Error in performAnalysis:', error);
    throw new Error('Failed to perform AI analysis.');
  }
}

export async function performAction(
  input: AutomateResolutionsWithAIInput
): Promise<AutomateResolutionsWithAIOutput> {
  try {
    const output = await automateResolutionsWithAI(input);
    // This is a mocked response as the underlying tool is not implemented
    return {
      actionResult: `Successfully created ticket for: ${input.desiredAction}. Ticket ID: TIX-${Math.floor(Math.random() * 1000)}.`,
      followUpTasks: "Monitor ticket for updates. Notify team in #engineering channel.",
    };
  } catch (error) {
    console.error('Error in performAction:', error);
    throw new Error('Failed to perform AI action.');
  }
}

export async function checkCache(
  input: IntelligentlyCacheAIResultsInput
): Promise<IntelligtlyCacheAIResultsOutput> {
    try {
        const output = await intelligentlyCacheAIResults(input);
        return output;
    } catch (error) {
        console.error('Error in checkCache:', error);
        throw new Error('Failed to check AI cache.');
    }
}
