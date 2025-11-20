# LogInsightsAI 🛡️

LogInsightsAI is a sophisticated web application designed to automatically redact sensitive information from log files and then provide a deep, AI-powered analysis of the content. Users can upload various log formats (`.log`, `.txt`, `.json`), and the application will find and mask sensitive data, then generate a structured and detailed report on the log's meaning.

This project is built with Next.js, React, TailwindCSS, and Genkit for AI integration.

## Key Features

- **Drag-and-Drop File Upload**: Easily upload `.log`, `.txt`, and `.json` files.
- **Automated Data Redaction**: Automatically finds and redacts sensitive information (PII, secrets, keys).
- **Redaction Summary**: Displays a table of all the data that was masked.
- **Download Masked File**: Allows you to download the cleaned log file.
- **In-Depth AI Analysis**: After masking, provides a detailed, structured analysis of the log content, including error extraction, security alerts, and a final summary.

For a deep dive into the project's architecture, design decisions, and setup, please see the detailed [**PROJECT.md**](./PROJECT.md) file.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI Toolkit**: [Genkit](https://firebase.google.com/docs/genkit)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN/UI](https://ui.shadcn.com/) components
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Prerequisites

- Node.js (v18 or later)
- A Google AI API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tawfeeq-bahur/log_insight_ai.git
    cd log_insight_ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your API key:
    ```env
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

### 3. Running the Application

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application running.

---

This project was built for **GROOTAN TECHNOLOGIES**.
# grootan
