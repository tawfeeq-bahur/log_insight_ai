import { type ExplainLogRootCauseOutput } from "@/ai/flows/explain-log-root-cause";
import { type IntelligtlyCacheAIResultsOutput } from "@/ai/flows/intelligently-cache-ai-results";
import { type MaskSensitiveDataOutput } from "@/ai/flows/mask-sensitive-data";

export type LogAnalysisResult = ExplainLogRootCauseOutput;
export type MaskingResult = MaskSensitiveDataOutput;

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
