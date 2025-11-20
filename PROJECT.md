# 🛡️ LogInsightsAI: Project Documentation

This document provides a comprehensive overview of the LogInsightsAI application, including its architecture, features, design decisions, and technical details.

---

### 1. Project Overview

LogInsightsAI is a secure, production-ready web application that helps developers and security analysts redact sensitive data from log files and then uses AI to provide a deep, structured analysis of the log content. Users can upload various log formats (`.log`, `.txt`, `.json`), and the application will automatically find and mask sensitive data, displaying a summary of the redactions. Afterward, it provides a detailed, AI-powered analysis of the masked log.

**Core Goals:**
- **Enhance Security**: Prevent exposure of sensitive data (PII, secrets) by masking it before analysis.
- **Provide Clarity**: Show the user exactly what information was redacted.
- **Deep AI Analysis**: Offer a structured, multi-faceted analysis of the log data to quickly identify issues, security threats, and system status.
- **User-Friendly Interface**: Offer a clean, intuitive UI for uploading files and viewing results.

---

### 2. Features

- **File Upload**: Drag-and-drop or manual file selection for `.log`, `.txt`, and `.json` files (up to 5MB).
- **Metadata Display**: Shows filename upon upload.
- **Automatic Data Redaction**: Server-side regex-based redaction of sensitive information.
- **Redaction Summary**: A table showing the original value, the masked value, and the line number for each redaction.
- **Download Masked Log**: Allows users to download the newly created log file with all sensitive data masked.
- **AI-Powered Log Analysis**: After masking, users can trigger an AI analysis that provides a detailed, structured breakdown of the log file, including summaries, error extractions, security alerts, and recommendations.
- **Responsive & Modern UI**: Built with ShadCN/UI and Tailwind CSS for a professional look and feel on all devices.

---

### 3. System Architecture

The application follows a modern, server-centric architecture built on Next.js.

1.  **Client (Browser)**: The user interacts with a React-based frontend. File uploads and UI state are managed locally.
2.  **Web Server (Next.js)**: The Next.js server handles client requests.
    - **Server Actions**: Instead of traditional REST API endpoints, the frontend communicates with the backend via Server Actions (`src/app/actions.ts`). This simplifies the architecture by co-locating client and server logic.
    - **Business Logic**: The server actions contain the primary business logic, which includes both the data redaction process and the AI analysis.

**Data Flow:**
1. User uploads a file.
2. The frontend calls the `performMasking` Server Action, passing the file content.
3. The `performMasking` action uses regular expressions to find and replace sensitive data, returning the masked log content and a list of redactions.
4. The client displays the redactions.
5. The user clicks "Analyze".
6. The frontend calls the `performAnalysis` Server Action, passing the masked log content.
7. The `performAnalysis` action invokes a Genkit AI flow, which calls the Google Gemini model to analyze the text and return a structured JSON object.
8. The client receives the structured analysis and renders it in a detailed, multi-section dashboard.

---

### 4. Tech Stack

- **Framework**: **Next.js 15** (App Router, Server Components, Server Actions)
- **AI Toolkit**: **Genkit** (for Google Gemini integration)
- **UI**: **React 18**
- **UI Components**: **ShadCN/UI**
- **Styling**: **Tailwind CSS**
- **Language**: **TypeScript**
- **Icons**: **Lucide React**

---

### 5. Design Decisions

- **Next.js App Router & Server Actions**: Chosen for its simplified data-fetching patterns, improved performance with Server Components, and the ability to write backend logic without creating separate API endpoints.
- **Genkit for AI**: Provides a structured and maintainable way to define AI prompts, manage schemas with Zod, and create server-side AI flows.
- **ShadCN/UI Components**: Offers beautifully designed, unstyled components that are highly customizable with Tailwind CSS, allowing for rapid UI development.
- **Server-Side Redaction & Analysis**: All sensitive processing is performed on the server inside Server Actions. This is a critical security decision to ensure that raw, sensitive log data is never exposed to the client and that AI analysis is performed in a secure environment.

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
3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root of the project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```
4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
5.  **Access the Application**:
    Open [http://localhost:9002](http://localhost:9002) in your browser.

---

### 7. Core Modules / Folder Structure

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
│   |   ├── flows/
│   |   |   └── explain-log-root-cause.ts # Genkit flow for AI analysis
│   |   └── genkit.ts         # Genkit configuration
│   │
│   ├── components/
│   │   ├── ui/               # Reusable UI components from ShadCN
│   │   └── icons.tsx         # Custom SVG icons
│   │
│   ├── hooks/
│   │   └── use-toast.ts      # Custom hook for displaying notifications
│   │
│   └── lib/
│       ├── log-parser.ts     # Utilities for data redaction
│       ├── types.ts          # TypeScript type definitions
│       └── utils.ts          # Utility functions (e.g., `cn` for Tailwind)
│
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Project dependencies and scripts
```

---

### 8. API Endpoints

This application uses **Next.js Server Actions** instead of traditional API endpoints.

- **`performMasking(input: { logContent: string })`**:
  - **File**: `src/app/actions.ts`
  - **Description**: The action called by the client to initiate data redaction.
  - **Input**: `{ logContent: string }`
  - **Output**: `Promise<MaskingResult>`

- **`performAnalysis(input: { logContent: string })`**:
  - **File**: `src/app/actions.ts`
  - **Description**: The action called by the client to initiate AI log analysis.
  - **Input**: `{ logContent: string }` (masked log content)
  - **Output**: `Promise<AnalysisResult>`

---

### 9. Redaction Rules

Redaction is handled by the `redactSensitiveData` function in `src/lib/log-parser.ts`. It uses regular expressions to find and replace sensitive patterns with placeholders like `xxxxxx`.

**Redacted Data Types:**
- IP Addresses (v4 & v6)
- URLs
- File Paths (Windows and Linux formats)
- Email Addresses
- API Keys (common prefixes like `sk_`, `pk_` and long alphanumeric strings)
- Usernames (patterns like `user=...`)
- Timestamps (ISO 8601 format)
- JSON values and key-value pairs

---

### 10. Manual Testing

1.  **Valid Files**: Upload `.log`, `.txt`, and `.json` files under 5MB. Verify that the masking is successful and redactions are shown.
2.  **Invalid Files**: Attempt to upload other file types (e.g., `.png`, `.docx`) or files larger than 5MB. Verify that the appropriate error toasts appear.
3.  **Redaction**: Use a log file containing sensitive data (IPs, emails, etc.) and verify in the "Masked Areas" table that the data is correctly identified and masked.
4.  **Download**: Click the download button and verify that the downloaded file contains the masked content.
5.  **AI Analysis**: After masking, click the "Analyze" button. Verify that the analysis dashboard appears and is populated with structured data from the AI.

---

### 11. Limitations

- **No User Accounts**: The application is designed for single-user, local use and does not support multiple user accounts.
- **Regex-Based Redaction**: While comprehensive, the regex patterns may not catch all possible formats of sensitive data.

---

### 12. Future Enhancements

- **User Authentication**: Implement a login system to manage user accounts.
- **Configurable Redaction Rules**: Allow users to define their own regex patterns for redaction.
- **Team Collaboration**: Add features for sharing masked logs and analysis within a team.

---

### 13. License

This project is licensed under the MIT License.

---

### 14. Contributors

- Built by the Firebase Studio AI assistant.
- Project for **GROOTAN TECHNOLOGIES**.
