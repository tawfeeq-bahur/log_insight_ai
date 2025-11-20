'use server';
import {ai} from '@/ai/genkit';
import {z} from 'zod';

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
  authentication: z.array(z.string()).describe('Summary of authentication-related logs'),
  database: z.array(z.string()).describe('Summary of database-related logs'),
  payments: z.array(z.string()).describe('Summary of payment-related logs'),
  api: z.array(z.string()).describe('Summary of API-related logs'),
  fileUpload: z.array(z.string()).describe('Summary of file upload-related logs'),
  security: z.array(z.string()).describe('Summary of security-related logs'),
  userActions: z.array(z.string()).describe('Summary of user action-related logs'),
});

const ErrorLogExtractionSchema = z.object({
  criticalDatabaseErrors: z.array(z.string()).describe('Details of critical database errors'),
  paymentErrors: z.array(z.string()).describe('Details of payment errors'),
  authenticationErrors: z.array(z.string()).describe('Details of authentication errors'),
  fileUploadErrors: z.array(z.string()).describe('Details of file upload errors'),
  externalApiErrors: z.array(z.string()).describe('Details of external API errors'),
  webSocketAuthErrors: z.array(z.string()).describe('Details of WebSocket authentication errors'),
});

const SecurityAlertsSchema = z.object({
  sqlInjectionAttempts: z.array(z.string()).describe('Details of SQL injection attempts'),
  highRateApiAbuse: z.array(z.string()).describe('Details of high-rate API abuse detected'),
});

const KeyStatisticsSchema = z.object({
  category: z.string(),
  count: z.number(),
});

const FinalConclusionSchema = z.object({
  summary: z.array(z.string()).describe('A summary of the system\'s status'),
  recommendations: z.array(z.string()).describe('A list of recommended actions'),
});

const AnalysisResultSchema = z.object({
  overviewSummary: OverviewSummarySchema,
  categorizedLogSummary: CategorizedLogSummarySchema,
  errorLogExtraction: ErrorLogExtractionSchema,
  securityAlerts: SecurityAlertsSchema,
  keyStatistics: z.array(KeyStatisticsSchema),
  finalConclusion: FinalConclusionSchema,
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const explainLogRootCausePrompt = ai.definePrompt({
  name: 'explainLogRootCausePrompt',
  input: {
    schema: z.object({
      logContent: z.string(),
    }),
  },
  output: {
    schema: AnalysisResultSchema,
  },
  prompt: `
    You are an expert log analysis AI. Analyze the provided log content and provide a detailed breakdown.
    The log content is as follows:
    \`\`\`
    {{{logContent}}}
    \`\`\`

    Based on the logs, provide a comprehensive analysis in JSON format. Follow the schema exactly.
    - Summarize counts for all specified categories in 'overviewSummary'.
    - Categorize individual log events in 'categorizedLogSummary'.
    - Extract and detail all critical errors in 'errorLogExtraction'.
    - Detail all security alerts in 'securityAlerts'.
    - Compile key statistics in 'keyStatistics'.
    - Provide a final conclusion and actionable recommendations in 'finalConclusion'.
  `,
  model: 'googleai/gemini-pro',
});

export const explainLogRootCause = ai.defineFlow(
  {
    name: 'explainLogRootCause',
    inputSchema: z.object({logContent: z.string()}),
    outputSchema: AnalysisResultSchema,
  },
  async (input) => {
    const {output} = await explainLogRootCausePrompt(input);
    if (!output) {
      throw new Error('Analysis failed to produce an output.');
    }
    return output;
  }
);
