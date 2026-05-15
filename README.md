# Email Threat Analysis System

A cross-platform security solution for detecting phishing and social engineering attempts in Gmail. This project implements a modular architecture consisting of a Google Workspace Add-on (Client) and a FastAPI-based analysis engine (Backend).

## Detection Methodology

Unlike simple pattern matching, this system employs layered heuristics:

* **URL De-obfuscation:** Unpacking hidden redirect parameters and detecting URL shorteners.
* **Identity Spoofing Detection:** Cross-referencing display names with sender domains to identify brand impersonation.
* **Behavioral Analysis:** Scoring content based on urgency triggers and psychological pressure tactics (Multilingual support: English/Hebrew).
* **Infrastructure Reputation:** Screening against known malicious TLDs (.zip, .xyz) and Punycode/Homograph patterns.

## Architecture & Data Flow

1.  **Frontend (Google Apps Script):** Light-weight client that extracts email metadata and handles UI rendering.
2.  **Network Layer (Ngrok):** Secure HTTPS tunneling to expose the local development server.
3.  **Backend (Python/FastAPI):** High-performance analysis engine that processes incoming payloads and returns weighted risk scores.

## Project Structure

* `main.py` - FastAPI server and detection logic.
* `gmail-addon/` - Client-side source code.
    * `code.gs` - Main Google Apps Script logic.
    * `appsscript.json` - Manifest file with OAuth scopes.
* `.gitignore` - Configuration to prevent uploading environment-specific files.

## ⚙️ Setup & Deployment

### Backend
1. Install dependencies:
   ```bash
   pip install fastapi uvicorn

2. Start the analysis engine:

python -m uvicorn main:app --reload
### Frontend
Create a new Google Apps Script project.

Deploy the files from the gmail-addon/ directory.

Update the URL constant in code.gs with your active tunnel endpoint.