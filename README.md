# LogInsightsAI 🧠✨

LogInsightsAI is an intelligent web application designed to analyze log files, automatically redact sensitive information, and provide deep, AI-driven insights to help developers and security analysts diagnose issues quickly. It leverages modern AI models to provide structured, actionable feedback on log data.

This project is built with Next.js, React, and Google's Genkit for seamless AI integration.

## Key Features

- **Drag-and-Drop File Upload**: Easily upload `.log`, `.txt`, and `.json` files.
- **Automated Data Redaction**: Automatically finds and redacts sensitive information (PII, secrets, keys) before analysis.
- **In-Depth AI Analysis**: Uses advanced AI models to provide a multi-section analysis, including an overview, categorized summaries, error extractions, and security alerts.
- **Duplicate Detection**: Uses SHA-256 hashing to identify previously analyzed logs.
- **Smart Caching**: Caches analysis results to provide instant feedback for duplicate logs.
- **Analysis History**: A dashboard to view and revisit past log analysis sessions.
- **Secure by Design**: Follows security best practices by processing data on the server and never storing sensitive log content.

For a deep dive into the project's architecture, design decisions, and setup, please see the detailed [**PROJECT.md**](./PROJECT.md) file.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN/UI](https://ui.shadcn.com/) components
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (with Google Gemini)
- **State Management**: React Hooks (`useState`, `useEffect`)
- **Schema & Validation**: [Zod](https://zod.dev/)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Prerequisites

- Node.js (v18 or later)
- An active Google AI Studio API Key.

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

### 3. Environment Variables

1.  Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```

2.  Add your Google AI Studio API key to the `.env` file:
    ```
    GEMINI_API_KEY=your_google_ai_studio_api_key_here
    ```

### 4. Running the Application

1.  **Start the Genkit development server:**
    This command starts the Genkit AI flows and makes them available for the Next.js app.
    ```bash
    npm run genkit:watch
    ```

2.  **In a separate terminal, start the Next.js development server:**
    ```bash
    npm run dev
    ```

3.  Open your browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application running.

---

This project was built for **GROOTAN TECHNOLOGIES**.
