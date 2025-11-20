# 🛡️ LogMasker: Project Documentation

This document provides a comprehensive overview of the LogMasker application, including its architecture, features, design decisions, and technical details.

---

### 1. Project Overview

LogMasker is a secure, production-ready web application that helps developers and security analysts redact sensitive data from log files. Users can upload various log formats (`.log`, `.txt`, `.json`), and the application will automatically find and mask sensitive data, displaying a summary of the redactions.

**Core Goals:**
- **Enhance Security**: Prevent exposure of sensitive data (PII, secrets) by masking it.
- **Provide Clarity**: Show the user exactly what information was redacted.
- **User-Friendly Interface**: Offer a clean, intuitive UI for uploading files and viewing results.

---

### 2. Features

- **File Upload**: Drag-and-drop or manual file selection for `.log`, `.txt`, and `.json` files (up to 5MB).
- **Metadata Display**: Shows filename upon upload.
- **Automatic Data Redaction**: Server-side regex-based redaction of sensitive information.
- **Redaction Summary**: A table showing the original value, the masked value, and the line number for each redaction.
- **Download Masked Log**: Allows users to download the newly created log file with all sensitive data masked.
- **Responsive & Modern UI**: Built with ShadCN/UI and Tailwind CSS for a professional look and feel on all devices.

---

### 3. System Architecture

The application follows a modern, server-centric architecture built on Next.js.

1.  **Client (Browser)**: The user interacts with a React-based frontend. File uploads and UI state are managed locally.
2.  **Web Server (Next.js)**: The Next.js server handles client requests.
    - **Server Actions**: Instead of traditional REST API endpoints, the frontend communicates with the backend via Server Actions (`src/app/actions.ts`). This simplifies the architecture by co-locating client and server logic.
    - **Business Logic**: The server actions contain the primary business logic, which is the data redaction process.

**Data Flow for Masking:**
1. User uploads a file.
2. The frontend calls the `performMasking` Server Action, passing the file content.
3. The Server Action uses regular expressions to find and replace sensitive data.
4. The Server Action returns the masked log content and a list of redactions to the client.
5. The client displays the redactions in a table and provides a button to download the masked log.

---

### 4. Tech Stack

- **Framework**: **Next.js 15** (App Router, Server Components, Server Actions)
- **UI**: **React 18**
- **UI Components**: **ShadCN/UI**
- **Styling**: **Tailwind CSS**
- **Language**: **TypeScript**
- **Icons**: **Lucide React**

---

### 5. Design Decisions

- **Next.js App Router & Server Actions**: Chosen for its simplified data-fetching patterns, improved performance with Server Components, and the ability to write backend logic without creating separate API endpoints. This streamlines development and reduces boilerplate.
- **ShadCN/UI Components**: Offers a set of beautifully designed, unstyled components that are highly customizable with Tailwind CSS. This allows for rapid UI development while maintaining full control over the visual style.
- **Server-Side Redaction**: Redaction is performed on the server inside a Server Action. This is a critical security decision to ensure that raw, sensitive log data is processed in a secure environment.

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
3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
4.  **Access the Application**:
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

This application does not use traditional REST or GraphQL API endpoints. Instead, it uses **Next.js Server Actions**.

- **`performMasking(input: { logContent: string })`**:
  - **File**: `src/app/actions.ts`
  - **Description**: The primary action called by the client to initiate data redaction.
  - **Input**: `{ logContent: string }`
  - **Output**: `Promise<MaskingResult>`

---

### 9. Redaction Rules

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

### 10. Manual Testing

1.  **Valid Files**: Upload `.log`, `.txt`, and `.json` files under 5MB. Verify that the masking is successful and redactions are shown.
2.  **Invalid Files**: Attempt to upload other file types (e.g., `.png`, `.docx`) or files larger than 5MB. Verify that the appropriate error toasts appear.
3.  **Redaction**: Use a log file containing sensitive data (IPs, emails, etc.) and verify in the "Masked Areas" table that the data is correctly identified and masked.
4.  **Download**: Click the download button and verify that the downloaded file contains the masked content.

---

### 11. Limitations

- **No User Accounts**: The application is designed for single-user, local use and does not support multiple user accounts.
- **Regex-Based Redaction**: While comprehensive, the regex patterns may not catch all possible formats of sensitive data.

---

### 12. Future Enhancements

- **User Authentication**: Implement a login system to manage user accounts.
- **Configurable Redaction Rules**: Allow users to define their own regex patterns for redaction.
- **Team Collaboration**: Add features for sharing masked logs within a team.

---

### 13. License

This project is licensed under the MIT License.

---

### 14. Contributors

- Built by the Firebase Studio AI assistant.
- Project for **GROOTAN TECHNOLOGIES**.
