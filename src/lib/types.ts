export interface LogAnalysisResult {
  issueType: string;
  rootCause: string;
  suggestedFix: string;
  severityRating: string;
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
