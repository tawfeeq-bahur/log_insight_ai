import { type ExplainLogRootCauseOutput } from "@/ai/flows/explain-log-root-cause";
import { type IntelligtlyCacheAIResultsOutput } from "@/ai/flows/intelligently-cache-ai-results";

export type LogAnalysisResult = ExplainLogRootCauseOutput;

export interface MaskingResult {
  maskedLog: string;
  redactions: {
    original: string;
    masked: string;
  }[];
}

export interface LogHistoryEntry {
  id: string;
  filename: string;
  uploadTime: string;
  fileSize: string;
  hash: string;
  analysis: LogAnalysisResult;
  content: string;
}

export type CacheCheckResult = IntelligtlyCacheAIResultsOutput;
