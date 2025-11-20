'use server';

import { redactSensitiveData } from '@/lib/log-parser';
import type { MaskingResult } from '@/lib/types';

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
