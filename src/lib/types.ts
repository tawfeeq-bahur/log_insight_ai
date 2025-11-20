import {z} from 'zod';

export interface MaskingResult {
  maskedLog: string;
  redactions: {
    original: string;
    masked: string;
    lineNumber: number;
  }[];
}

const OverviewSummarySchema = z.object({
  totalEntries: z.number().describe('Total number of log entries processed'),
  infoLogs: z.number().describe('Number of informational logs'),
  errorLogs: z.number().describe('Number of error logs'),
  securityAlerts: z.number().describe('Number of security or critical alerts'),
  dbFailures: z.number().describe('Number of database failures'),
  paymentFailures: z.number().describe('Number of payment failures'),
  authFailures: z.number().describe('Number of authentication failures'),
  fileUploadFailures: z.number().describe('Number of file/upload failures'),
  apiFailures: z.number().describe('Number of API failures'),
  suspiciousRequests: z.number().describe('Number of suspicious request attempts'),
});

const CategorizedLogSummarySchema = z.object({
  applicationAndSystem: z.array(z.string()).describe('Summary of application and system-level logs (startup, config, etc.)'),
  authenticationAndAuthorization: z.array(z.string()).describe('Summary of authentication and authorization logs (logins, tokens).'),
  database: z.array(z.string()).describe('Summary of database-related logs'),
  payments: z.array(z.string()).describe('Summary of payment-related logs'),
  api: z.array(z.string()).describe('Summary of API-related logs'),
  fileUpload: z.array(z.string()).describe('Summary of file upload-related logs'),
  security: z.array(z.string()).describe('Summary of security-related logs'),
  userActions: z.array(z-string()).describe('Summary of user action-related logs'),
});

export const AnalysisResultSchema = z.object({
  overviewSummary: OverviewSummarySchema,
  categorizedLogSummary: CategorizedLogSummarySchema,
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
