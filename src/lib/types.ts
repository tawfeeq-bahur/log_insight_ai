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
});

const CategorizedLogSchema = z.object({
  category: z.string().describe("The high-level category of the log entry (e.g., 'Authentication', 'Database', 'Payments')."),
  summary: z.string().describe("A one-sentence summary of the log entry."),
});

const ErrorLogSchema = z.object({
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']).describe('The severity of the error.'),
  service: z.string().describe("The service or component where the error occurred (e.g., 'Database', 'Payment Gateway')."),
  message: z.string().describe('The primary error message.'),
  details: z.string().optional().describe('Any additional technical details or context about the error.'),
});

const SecurityAlertSchema = z.object({
  alertType: z.string().describe("The type of security alert (e.g., 'SQL Injection Attempt', 'High-rate API abuse')."),
  description: z.string().describe('A detailed description of the security event, including relevant data like IP addresses or malicious queries.'),
  recommendation: z.string().describe('A recommended action to take in response to the alert.'),
});

const StatisticsSchema = z.object({
  requestsProcessed: z.number().describe('Total number of requests processed.'),
  successfulActions: z.number().describe('Number of successful actions or operations.'),
  errors: z.number().describe('Total number of errors.'),
  criticalErrors: z.number().describe('Number of critical errors.'),
  securityAlerts: z.number().describe('Total number of security alerts triggered.'),
});

const ConclusionSchema = z.object({
  summary: z.string().describe('A high-level summary of the system status and key findings.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations for system improvement or investigation.'),
});


export const AnalysisResultSchema = z.object({
  overviewSummary: OverviewSummarySchema,
  categorizedLogSummary: z.array(CategorizedLogSchema).describe("A summary of log entries categorized by their function."),
  errorLogExtraction: z.array(ErrorLogSchema).describe("A detailed extraction of all error logs."),
  securityAlerts: z.array(SecurityAlertSchema).describe("A list of all identified security alerts."),
  keyStatistics: StatisticsSchema,
  finalConclusion: ConclusionSchema,
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
