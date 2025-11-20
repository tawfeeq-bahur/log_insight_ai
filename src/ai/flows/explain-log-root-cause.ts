'use server';

/**
 * @fileOverview Analyzes log files to explain the root cause of errors.
 *
 * - explainLogRootCause - A function that handles the log analysis and root cause explanation.
 * - ExplainLogRootCauseInput - The input type for the explainLogRootCause function.
 * - ExplainLogRootCauseOutput - The return type for the explainLogRootCause function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainLogRootCauseInputSchema = z.object({
  logContent: z
    .string()
    .describe('The content of the log file to be analyzed.'),
});
export type ExplainLogRootCauseInput = z.infer<typeof ExplainLogRootCauseInputSchema>;

const OverviewSummarySchema = z.object({
  totalEntries: z.number().describe('Total number of log entries processed.'),
  infoLogs: z.number().describe('Number of INFO level logs.'),
  errorLogs: z.number().describe('Number of ERROR level logs.'),
  securityAlerts: z.number().describe('Number of security-related or critical alerts.'),
  databaseFailures: z.number().describe('Number of database-related failures.'),
  paymentFailures: z.number().describe('Number of payment-related failures.'),
  authenticationFailures: z.number().describe('Number of authentication-related failures.'),
  fileUploadFailures: z.number().describe('Number of file/upload related failures.'),
  apiFailures: z.number().describe('Number of API related failures.'),
  suspiciousRequests: z.number().describe('Number of suspicious request attempts.'),
});

const CategorizedLogSummaryItemSchema = z.object({
  category: z.string().describe('The category of the log summary (e.g., Authentication, Database).'),
  summary: z.array(z.string()).describe('A list of summary points for the category.'),
});

const ErrorLogExtractionItemSchema = z.object({
  title: z.string().describe('The title for the error category (e.g., Critical Database Errors).'),
  details: z.array(z.string()).describe('A list of detailed error descriptions.'),
});

const SecurityAlertItemSchema = z.object({
  title: z.string().describe('The title of the security alert.'),
  details: z.array(z.string()).describe('A list of details about the security alert.'),
});

const KeyStatisticItemSchema = z.object({
  category: z.string(),
  count: z.number(),
});

const ExplainLogRootCauseOutputSchema = z.object({
  overviewSummary: OverviewSummarySchema.describe('An overall summary of the log file.'),
  categorizedLogSummary: z.array(CategorizedLogSummaryItemSchema).describe('A summary of logs categorized by type.'),
  errorLogExtraction: z.array(ErrorLogExtractionItemSchema).describe('A detailed extraction of critical errors.'),
  securityAlerts: z.array(SecurityAlertItemSchema).describe('A summary of security-related alerts.'),
  keyStatistics: z.array(KeyStatisticItemSchema).describe('A table of key statistics and their counts.'),
  finalConclusion: z.object({
    summary: z.string().describe("A summary of the system's state based on the logs."),
    recommendations: z.array(z.string()).describe('A list of recommendations.'),
  }).describe('The final conclusion and recommendations.'),
  // Legacy fields for compatibility, can be populated from the new structure.
  issueType: z.string().describe('The main type of issue identified in the log.'),
  rootCause: z.string().describe('A clear and concise explanation of the root cause of the primary error.'),
  suggestedFix: z.string().describe('A suggestion for how to fix the primary error.'),
  severityRating: z.string().describe('A rating of the overall severity of the issues (e.g., low, medium, high).'),
});
export type ExplainLogRootCauseOutput = z.infer<typeof ExplainLogRootCauseOutputSchema>;

export async function explainLogRootCause(input: ExplainLogRootCauseInput): Promise<ExplainLogRootCauseOutput> {
  return explainLogRootCauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainLogRootCausePrompt',
  input: {schema: ExplainLogRootCauseInputSchema},
  output: {schema: ExplainLogRootCauseOutputSchema},
  model: 'googleai/gemini-pro',
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
        },
    ],
  },
  prompt: `Analyze the following log file content and provide a comprehensive, structured analysis in JSON format.

Log Content:
{{{logContent}}}

Please provide the output in the following structured format. Be thorough and detailed.

1.  **Overview Summary**:
    *   Count total log entries, INFO logs, ERROR logs, security/critical alerts, and specific failure types (database, payment, authentication, etc.).

2.  **Categorized Log Summary**:
    *   Group related logs into categories (e.g., Authentication, Database, Payments, API, Security).
    *   For each category, provide a bulleted list summarizing the key events.

3.  **Error Log Extraction**:
    *   Identify and detail critical errors.
    *   For each error, extract key information like host, user, error messages, and relevant codes.

4.  **Security Alerts**:
    *   Detail any security-related events like SQL injection attempts, rate limiting, etc.
    *   Extract attacker IP, tools used, and malicious payloads.

5.  **Key Statistics**:
    *   Provide a simple key-value count for important metrics like total requests, successes, errors, and alerts.

6.  **Final Conclusion**:
    *   Summarize the overall system status.
    *   Provide actionable recommendations.

Please also populate the legacy fields (issueType, rootCause, suggestedFix, severityRating) by summarizing the most critical issue found in the logs. For severityRating, provide an overall rating for the entire log file.`,
});

const explainLogRootCauseFlow = ai.defineFlow(
  {
    name: 'explainLogRootCauseFlow',
    inputSchema: ExplainLogRootCauseInputSchema,
    outputSchema: ExplainLogRootCauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI analysis returned an empty response.');
    }
    return output;
  }
);
