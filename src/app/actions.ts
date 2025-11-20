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
import { redactSensitiveData } from '@/lib/log-parser';
import type { MaskingResult } from '@/lib/types';


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
    // The underlying AI flow is called, but we are using a mocked response
    // to simulate the action since no real tools (Jira, email APIs) are connected.
    await automateResolutionsWithAI(input);

    if (input.desiredAction === 'Send Email Notification') {
      return {
        actionResult: `Email notification sent to tawfeeqbahur@gmail.com.`,
        followUpTasks: "Monitor for responses and follow internal escalation procedures if necessary.",
      };
    }

    // Default mocked response for other actions like "Create Jira Ticket"
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
        // This is a mocked response as this feature is not fully implemented.
        return {
            cacheHit: false,
            analysisResults: "A similar log for a 'database connection error' was found. Cached analysis suggests checking firewall rules.",
        };
    } catch (error) {
        console.error('Error in checkCache:', error);
        throw new Error('Failed to check AI cache.');
    }
}

export async function performMasking(
  input: { logContent: string }
): Promise<MaskingResult> {
  try {
    const originalContent = input.logContent;
    const maskedLog = redactSensitiveData(originalContent);
    
    // To create the list of redactions, we need to find what was changed.
    // This is a simplified way to do it. A more robust solution might
    // involve getting the matches from the regex function itself.
    const redactions: { original: string; masked: string }[] = [];
    const originalLines = originalContent.split('\n');
    const maskedLines = maskedLog.split('\n');

    originalLines.forEach((originalLine, i) => {
      const maskedLine = maskedLines[i];
      if (originalLine !== maskedLine) {
        const originalWords = originalLine.split(/(\s+|\[|\]|,|\(|\))/);
        const maskedWords = maskedLine.split(/(\s+|\[|\]|,|\(|\))/);
        originalWords.forEach((word, j) => {
          if (word !== maskedWords[j] && !word.startsWith('[')) {
             const maskedWord = maskedWords[j];
             if(maskedWord && maskedWord.startsWith('[')) {
                redactions.push({ original: word, masked: maskedWord });
             }
          }
        });
      }
    });

    // A simple heuristic to find changed values if line-by-line fails.
    if(redactions.length === 0 && originalContent !== maskedLog){
        const uniqueRedactions = [...new Set(maskedLog.match(/\[REDACTED_[A-Z_]+\]/g))];
        uniqueRedactions.forEach(masked => {
            redactions.push({original: "Value obscured by redaction", masked: masked})
        })
    }

    return { maskedLog, redactions };
  } catch (error) {
    console.error('Error in performMasking:', error);
    throw new Error('Failed to perform data masking.');
  }
}
