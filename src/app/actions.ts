'use server';

import { redactSensitiveData } from '@/lib/log-parser';
import type { MaskingResult, AnalysisResult } from '@/lib/types';
import { explainLogRootCause } from '@/ai/flows/explain-log-root-cause';

export async function performMasking(
  input: { logContent: string }
): Promise<MaskingResult> {
  try {
    const originalContent = input.logContent;
    const { maskedLog, redactions } = redactSensitiveData(originalContent);

    return { maskedLog, redactions };
  } catch (error) {
    console.error('Error in performMasking:', error);
    throw new Error('Failed to perform data masking.');
  }
}

export async function performAnalysis(
  input: { logContent: string }
): Promise<AnalysisResult> {
  try {
    const result = await explainLogRootCause(input);
    return result;
  } catch (error: any) {
    console.error('Detailed error in performAnalysis:', error.message);
    throw new Error(`Failed to perform AI analysis. Reason: ${error.message}`);
  }
}
