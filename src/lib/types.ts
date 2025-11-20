import { type ExplainLogRootCauseOutput } from "@/ai/flows/explain-log-root-cause";

export type LogAnalysisResult = ExplainLogRootCauseOutput;

export interface LogHistoryEntry {
  id: string;
  filename: string;
  uploadTime: string;
  fileSize: string;
  hash: string;
  analysis: LogAnalysisResult;
  content: string;
}
