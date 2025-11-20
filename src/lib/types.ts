
export interface MaskingResult {
  maskedLog: string;
  redactions: {
    original: string;
    masked: string;
    lineNumber: number;
  }[];
}
