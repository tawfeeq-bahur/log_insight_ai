# LogMasker 🛡️

LogMasker is a simple web application designed to automatically redact sensitive information from log files. Users can upload various log formats (`.log`, `.txt`, `.json`), and the application will find and mask sensitive data like IP addresses, email addresses, and keys.

This project is built with Next.js, React, and TailwindCSS.

## Key Features

- **Drag-and-Drop File Upload**: Easily upload `.log`, `.txt`, and `.json` files.
- **Automated Data Redaction**: Automatically finds and redacts sensitive information (PII, secrets, keys).
- **Redaction Summary**: Displays a table of all the data that was masked.
- **Download Masked File**: Allows you to download the cleaned log file.

For a deep dive into the project's architecture, design decisions, and setup, please see the detailed [**PROJECT.md**](./PROJECT.md) file.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN/UI](https://ui.shadcn.com/) components
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Prerequisites

- Node.js (v18 or later)

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

### 3. Running the Application

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application running.

---

This project was built for **GROOTAN TECHNOLOGIES**.
