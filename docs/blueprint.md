# **App Name**: LogInsightsAI

## Core Features:

- Log Upload and Parsing: Accept log files (.log, .txt, .json) via drag-and-drop or manual upload, displaying file metadata and content in a scrollable panel.
- Sensitive Data Redaction: Automatically detect and redact sensitive information (file paths, IPs, usernames, API keys, URLs, timestamps) from log files before AI analysis.
- AI-Powered Log Analysis: Utilize AI to analyze sanitized log data, determining the issue type, root cause, suggested fixes, and severity rating; returns to the user in an itemized list.
- Duplicate Log Prevention: Generate SHA-256 hashes for uploaded logs to detect duplicates and prompt the user to reuse previous analysis results if a duplicate is found.
- Smart AI Caching: Cache AI analysis results for similar logs to avoid reprocessing. Reuse cached results to expedite the process, while allowing user control to trigger re-analysis when desired. The system employs a tool that incorporates domain-specific insight, assisting with whether information from a cache match would be helpful, harmful, or neutral.
- Dashboard & Upload History: Display a dashboard summarizing log uploads, including filename, upload time, file size, severity, analysis status, issue type, root cause, suggested fix, and severity rating.
- Actionable Resolutions: Take resolution steps and create follow ups on tasks, creating automations using AI tools

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to convey intelligence and stability.
- Background color: Very light Indigo (#E8EAF6) to provide a clean and unobtrusive backdrop.
- Accent color: Vibrant Amber (#FFB300) to highlight actionable items and severity indicators.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern and neutral look, suitable for both headlines and body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clear, concise icons to represent log types, severity levels, and suggested actions.
- Maintain a clean and responsive layout that adapts to different screen sizes, with a clear separation of log upload, analysis results, and historical data.