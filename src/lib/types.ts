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
  totalEntries: z.number(),
  infoLogs: z.number(),
  errorLogs: z.number(),
  securityAlerts: z.number(),
  dbFailures: z.number(),
  paymentFailures: z.number(),
  authFailures: z.number(),
  fileUploadFailures: z.number(),
  apiFailures: z.number(),
  suspiciousRequests: z.number(),
});

const CategorizedLogSummarySchema = z.object({
  authentication: z.array(z.string()),
  database: z.array(z.string()),
  payments: z.array(z.string()),
  api: z.array(z.string()),
  fileUpload: z.array(z.string()),
  security: z.array(z.string()),
  userActions: z.array(z.string()),
});

const ErrorLogExtractionSchema = z.object({
  criticalDatabaseErrors: z.array(z.string()),
  paymentErrors: z.array(z.string()),
  authenticationErrors: z.array(z.string()),
  fileUploadErrors: z.array(z.string()),
  externalApiErrors: z.array(z.string()),
  webSocketAuthErrors: z.array(z.string()),
});

const SecurityAlertsSchema = z.object({
  sqlInjectionAttempts: z.array(z.string()),
  highRateApiAbuse: z.array(z.string()),
});

const KeyStatisticsSchema = z.object({
  category: z.string(),
  count: z.number(),
});

const FinalConclusionSchema = z.object({
  summary: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const AnalysisResultSchema = z.object({
  overviewSummary: OverviewSummarySchema,
  categorizedLogSummary: CategorizedLogSummarySchema,
  errorLogExtraction: ErrorLogExtractionSchema,
  securityAlerts: SecurityAlertsSchema,
  keyStatistics: z.array(KeyStatisticsSchema),
  finalConclusion: FinalConclusionSchema,
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
