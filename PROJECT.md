# 🧠 LogInsightsAI: Project Documentation

This document provides a comprehensive overview of the LogInsightsAI application, including its architecture, features, design decisions, and technical details.

---

### 1. Project Overview

LogInsightsAI is an intelligent, secure, and production-ready web application that helps developers and security analysts analyze log files. Users can upload various log formats (`.log`, `.txt`, `.json`), and the application will automatically redact sensitive data, perform an in-depth AI-powered analysis, and display the results in a structured, easy-to-digest format. The system also includes features like deduplication and caching to optimize performance and cost.

**Core Goals:**
- **Speed up debugging**: Provide instant, actionable insights from complex log files.
- **Enhance Security**: Prevent exposure of sensitive data (PII, secrets) during analysis.
- **Improve Efficiency**: Avoid re-analyzing identical logs by using hashing and caching.
- **User-Friendly Interface**: Offer a clean, intuitive UI for uploading and reviewing log analyses.

---

### 2. Features

- **File Upload**: Drag-and-drop or manual file selection for `.log`, `.txt`, and `.json` files (up to 5MB).
- **Metadata Display**: Shows filename and size upon upload.
- **Content Preview**: A scrollable panel to view original or redacted log content.
- **Automatic Data Redaction**: Server-side regex-based redaction of sensitive information before AI processing.
- **AI-Powered Analysis**: Utilizes Google's Gemini model via Genkit to generate a structured analysis covering:
  - Overview Summary
  - Categorized Log Summary
  - Error Log Extraction
  - Security Alerts
  - Key Statistics
  - Final Conclusion and Recommendations
- **Deduplication via Hashing**: Generates a SHA-256 hash of the original file content to detect duplicates.
- **Smart AI Caching**: Caches analysis results in the browser's `localStorage` and prompts the user to reuse them for duplicate logs.
- **Analysis History Dashboard**: A persistent, client-side history of all uploaded logs and their analyses, allowing users to review past results.
- **Actionable Resolutions**: A (mocked) feature to simulate creating tickets or sending notifications based on the analysis.
- **Responsive & Modern UI**: Built with ShadCN/UI and Tailwind CSS for a professional look and feel on all devices.

---

### 3. System Architecture

The application follows a modern, server-centric architecture built on Next.js.

1.  **Client (Browser)**: The user interacts with a React-based frontend. File uploads and UI state are managed locally. For analysis, the client calls a Next.js Server Action.
2.  **Web Server (Next.js)**: The Next.js server handles client requests.
    - **Server Actions**: Instead of traditional REST API endpoints, the frontend communicates with the backend via Server Actions (`src/app/actions.ts`). This simplifies the architecture by co-locating client and server logic.
    - **Business Logic**: The server actions contain the primary business logic, such as calling AI flows, handling file processing, and orchestrating the analysis pipeline.
3.  **AI Layer (Genkit)**: All AI-related functionality is encapsulated in Genkit flows (`src/ai/flows/`).
    - **Genkit**: Acts as an abstraction layer over the AI model provider (Google Gemini). It simplifies prompt management, input/output schema enforcement (using Zod), and tool definition.
    - **Flows**: The `explainLogRootCause` flow is the core AI component. It takes sanitized log content and returns a structured JSON analysis based on a detailed prompt.
4.  **Data Storage**:
    - **`localStorage`**: Used on the client side to persist the user's upload history. This simplifies the architecture by avoiding the need for a dedicated database and user authentication for this feature. Each history entry includes the file metadata and its corresponding AI analysis.
    - **`.env`**: Securely stores the `GEMINI_API_KEY` on the server, which is never exposed to the client.

**Data Flow for Analysis:**
1. User uploads a file.
2. The frontend reads the file content and computes its SHA-256 hash.
3. It checks `localStorage` for an existing entry with the same hash.
4.  - **If duplicate**: It prompts the user to reuse the cached analysis.
    - **If not duplicate**: The frontend calls the `performAnalysis` Server Action, passing the file content.
5. The Server Action redacts sensitive data from the content.
6. The Server Action invokes the `explainLogRootCause` Genkit flow with the sanitized content.
7. The Genkit flow sends the content and a structured prompt to the Gemini LLM.
8. Gemini returns a structured JSON object.
9. The Server Action returns the JSON to the client.
10. The client displays the formatted analysis and saves the new entry to `localStorage`.

---

### 4. Tech Stack

- **Framework**: **Next.js 15** (App Router, Server Components, Server Actions)
- **UI**: **React 18**
- **AI Toolkit**: **Genkit (Google)**
- **AI Model**: **Google Gemini 2.5 Flash**
- **UI Components**: **ShadCN/UI**
- **Styling**: **Tailwind CSS**
- **Language**: **TypeScript**
- **Schema Definition**: **Zod**
- **Icons**: **Lucide React**

---

### 5. Design Decisions

- **Next.js App Router & Server Actions**: Chosen for its simplified data-fetching patterns, improved performance with Server Components, and the ability to write backend logic without creating separate API endpoints. This streamlines development and reduces boilerplate.
- **Genkit for AI**: Provides a robust, type-safe framework for interacting with LLMs. Its integration with Zod for schema definition ensures that the AI output is always structured and predictable, which is critical for a production application. It also makes it easy to swap models or providers in the future.
- **ShadCN/UI Components**: Offers a set of beautifully designed, unstyled components that are highly customizable with Tailwind CSS. This allows for rapid UI development while maintaining full control over the visual style.
- **Client-Side Caching (`localStorage`)**: For this specific use case, using `localStorage` for history and caching is a pragmatic choice. It avoids the complexity of setting up a database and user authentication, making the application self-contained and easier to run locally. For a multi-user SaaS, a database would be the next logical step.
- **Server-Side Redaction**: Redaction is performed on the server inside a Server Action. This is a critical security decision to ensure that raw, sensitive log data never leaves the server environment to be processed by a third-party AI service.

---

### 6. Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/tawfeeq-bahur/log_insight_ai.git
    cd log_insight_ai
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Set Up Environment Variables**:
    Create a `.env` file in the project root and add your Google AI Studio API key.
    ```env
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
4.  **Run the Development Servers**:
    You need two terminals open.
    - **Terminal 1 (Genkit AI Server)**:
      ```bash
      npm run genkit:watch
      ```
    - **Terminal 2 (Next.js App)**:
      ```bash
      npm run dev
      ```
5.  **Access the Application**:
    Open [http://localhost:9002](http://localhost:9002) in your browser.

---

### 7. Environment Variables

- `GEMINI_API_KEY`: **Required**. Your API key for the Google Gemini family of models, obtainable from Google AI Studio. This key is used by Genkit on the server side to authenticate with the AI service.

---

### 8. Database Schema

The application uses the browser's `localStorage` to persist upload history. The data is stored under the key `logHistory` as a JSON array of `LogHistoryEntry` objects.

**`LogHistoryEntry` Interface (`src/lib/types.ts`):**
```typescript
export interface LogHistoryEntry {
  id: string;          // Unique ID (ISO timestamp)
  filename: string;      // Original name of the uploaded file
  uploadTime: string;    // Formatted date and time of upload
  fileSize: string;      // File size in KB
  hash: string;          // SHA-256 hash of the raw file content
  analysis: LogAnalysisResult; // The structured JSON analysis from the AI
  content: string;       // The raw, un-redacted content of the log file
}
```

---

### 9. Core Modules / Folder Structure

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page component (UI and client-side logic)
│   │   ├── layout.tsx        # Root layout for the application
│   │   ├── globals.css       # Global styles and Tailwind directives
│   │   └── actions.ts        # Server Actions for backend logic
│   │
│   ├── ai/
│   │   ├── flows/
│   │   │   └── explain-log-root-cause.ts # Genkit flow for AI analysis
│   │   ├── genkit.ts         # Genkit configuration and initialization
│   │   └── dev.ts            # Entry point for the Genkit development server
│   │
│   ├── components/
│   │   ├── ui/               # Reusable UI components from ShadCN
│   │   └── icons.tsx         # Custom SVG icons
│   │
│   ├── hooks/
│   │   └── use-toast.ts      # Custom hook for displaying notifications
│   │
│   └── lib/
│       ├── log-parser.ts     # Utilities for SHA-256 hashing and data redaction
│       ├── types.ts          # TypeScript type definitions
│       └── utils.ts          # Utility functions (e.g., `cn` for Tailwind)
│
├── public/                 # Static assets
├── .env                    # Environment variables (git-ignored)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Project dependencies and scripts
```

---

### 10. API Endpoints

This application does not use traditional REST or GraphQL API endpoints. Instead, it uses **Next.js Server Actions**.

- **`performAnalysis(input: ExplainLogRootCauseInput)`**:
  - **File**: `src/app/actions.ts`
  - **Description**: The primary action called by the client to initiate a log analysis. It redacts the data and invokes the Genkit AI flow.
  - **Input**: `{ logContent: string }`
  - **Output**: `Promise<ExplainLogRootCauseOutput>`

- **`performAction(input: AutomateResolutionsWithAIInput)`**:
  - **File**: `src/app/actions.ts`
  - **Description**: A mocked action to simulate creating tickets or notifications.
  - **Input**: `{ logAnalysis: string, desiredAction: string }`
  - **Output**: `Promise<{ actionResult: string, followUpTasks: string }>`

- **`checkCache(input: IntelligentlyCacheAIResultsInput)`**:
  - **File**: `src/app/actions.ts`
  - **Description**: A mocked action to simulate checking a smart cache for similar logs.
  - **Input**: `{ logData: string, analysisResults: string }`
  - **Output**: `Promise<CacheCheckResult>`

---

### 11. Redaction Rules

Redaction is handled by the `redactSensitiveData` function in `src/lib/log-parser.ts`. It uses regular expressions to find and replace sensitive patterns with placeholders like `[REDACTED_IP]`.

**Redacted Data Types:**
- IP Addresses (v4 & v6)
- URLs
- File Paths (Windows and Linux formats)
- Email Addresses
- API Keys (common prefixes like `sk_`, `pk_` and long alphanumeric strings)
- Usernames (patterns like `user=...`)
- Timestamps (ISO 8601 format)

---

### 12. Deduplication Logic

1.  When a file is uploaded, the frontend reads its content into a string.
2.  The `getSha256` function (`src/lib/log-parser.ts`) is called, which uses the Web Crypto API (`crypto.subtle`) to compute a SHA-256 hash of the content string.
3.  The frontend then searches the `logHistory` array (from `localStorage`) for an entry with a matching `hash`.
4.  If a match is found, the `isDuplicate` state is set to `true`, and a dialog appears, asking the user whether to reuse the cached analysis or perform a new one.

---

### 13. Caching Strategy

The application employs a simple yet effective client-side caching strategy using `localStorage`.

- **Storage**: The `logHistory` array, which holds all `LogHistoryEntry` objects, is serialized and stored in `localStorage`.
- **Persistence**: This makes the user's analysis history persistent across browser sessions on the same machine.
- **Cache Hits**: When a duplicate file hash is detected, the cached analysis result is retrieved directly from the corresponding history entry, avoiding a costly AI API call.
- **Cache Invalidation**: The user can force a new analysis for a duplicate file, which overwrites the existing entry for that hash in the history.

---

### 14. AI Prompt Template

The core AI logic is defined in `src/ai/flows/explain-log-root-cause.ts`. The prompt instructs the Gemini model to act as an expert analyst and return a structured JSON object.

**Key Prompting Techniques:**
- **Role-Playing**: `You are an expert system administrator...`
- **Structured Output**: The prompt explicitly defines the desired JSON schema (via Zod), including keys and data types for each section (Overview, Categorized Summary, Errors, etc.).
- **Content Injection**: The sanitized log data is injected into the prompt using `{{{logContent}}}`.
- **Detailed Instructions**: The prompt provides clear, step-by-step instructions for each section of the analysis, guiding the model to produce a high-quality, comprehensive output.

---

### 15. Security Measures

- **Input Validation**: File size and type are validated on the client-side before upload.
- **Data Redaction**: Sensitive data is redacted on the server before being sent to the AI model, minimizing data exposure.
- **No Sensitive Data Storage**: The original, un-redacted log content is stored only in the user's local `localStorage` and is never transmitted or stored elsewhere. The server only handles it transiently during a request.
- **Environment Variables**: The AI API key is stored securely in an `.env` file and is only accessible by the server, never exposed to the client.
- **Server Actions**: Using Server Actions reduces the attack surface by eliminating the need for publicly exposed API endpoints.

---

### 16. Testing Instructions

1.  **Unit/Integration Tests**: (Future Enhancement) Tests could be written for:
    - The `redactSensitiveData` function to ensure it correctly identifies and redacts patterns.
    - The `getSha256` function.
    - React components to ensure they render correctly based on different states (loading, error, success).
2.  **Manual Testing**:
    - **Valid Files**: Upload `.log`, `.txt`, and `.json` files under 5MB. Verify that the analysis is successful.
    - **Invalid Files**: Attempt to upload other file types (e.g., `.png`, `.docx`) or files larger than 5MB. Verify that the appropriate error toasts appear.
    - **Duplicate Files**: Upload the same file twice. Verify that the "Duplicate Log Detected" dialog appears and that both "View Existing" and "Analyze Again" options work correctly.
    - **Redaction**: Use a log file containing sensitive data (IPs, emails, etc.) and verify in the "Log Content" preview that the data is redacted when the "Redact PII" switch is on.
    - **History**: Refresh the page after an analysis. Verify that the analysis appears in the "History" tab and can be viewed again.

---

### 17. Limitations

- **Client-Side Storage**: The use of `localStorage` means the history is tied to a specific browser on a specific machine. It is not synced across devices.
- **No User Authentication**: The application is designed for single-user, local analysis. It does not support multiple user accounts.
- **Mocked Features**: The "Actionable Resolutions" and "Smart Cache Check" features are currently mocked and do not perform real actions.
- **Rate Limiting**: The application relies on the user's personal AI API key. Heavy usage may be subject to rate limits imposed by the AI provider.

---

### 18. Future Enhancements

- **Backend Database**: Replace `localStorage` with a proper database (like PostgreSQL or Firestore) to enable multi-user support and cross-device history syncing.
- **User Authentication**: Implement a login system (e.g., using Firebase Auth) to manage user accounts.
- **Implement "Actionable Resolutions"**: Connect the action dropdown to real APIs like Jira, Slack, or SendGrid to create tickets or send notifications.
- **Implement "Smart Caching"**: Develop a backend service that uses vector embeddings to find *semantically similar* logs, not just identical ones.
- **Streaming AI Response**: Stream the AI response to the client to show partial results faster, improving the user experience for large analyses.
- **Team Collaboration**: Add features for sharing analysis results within a team.

---

### 19. Demo Instructions

To demonstrate the application:
1. Start the app using the `npm run dev` and `npm run genkit:watch` commands.
2. Open the app in the browser.
3. Drag and drop a sample log file into the upload box.
4. Show the file content preview and toggle the redaction switch to demonstrate the redaction feature.
5. Click "Analyze Log" and show the loading state.
6. Once complete, walk through each section of the detailed AI analysis.
7. Upload the same file again to demonstrate the duplicate detection and caching feature.
8. Switch to the "History" tab to show the persistent record of the analysis.

---

### 20. License

This project is licensed under the MIT License.

---

### 21. Contributors

- Built by the Firebase Studio AI assistant.
- Project for **GROOTAN TECHNOLOGIES**.
