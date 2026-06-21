# Nexara — Setup Guide

## Run the app (2 steps, one time only)

### Step 1 — Install Node.js
Download from https://nodejs.org — choose LTS. Run the installer.

### Step 2 — Install Electron and launch
Open Terminal, drag the nexara-app folder in, run:

```
npm install electron --save-dev --ignore-scripts
node node_modules/electron/install.js
npm start
```

Every time after that: just run `npm start`

---

## Setting up Offline AI

Nexara uses 100% offline AI — nothing ever goes to the internet.
The AI runs on your machine using Ollama + Microsoft Phi-3.5.

### Step 1 — Install Ollama (one time)
Download from https://ollama.com and install it like a normal Mac app.

### Step 2 — Download the AI model (one time, ~2.2GB)
Open Terminal and run:
```
ollama pull phi3.5
```
This downloads the model to your machine. Takes 5-15 minutes depending on connection.

### Step 3 — Start Ollama before using Nexara
```
ollama serve
```
Leave this Terminal window open. You'll see "AI Ready" in green in the Nexara topbar.

### Checking AI works
- Green "AI READY" badge in the topbar = fully working
- Orange "AI LOADING" = Ollama starting up, wait 10-20 seconds
- Grey "AI OFFLINE" = Ollama not running, run `ollama serve`

### Zero data sharing — guaranteed
- The model runs on your CPU/GPU only
- No internet connection is used for ANY AI feature
- Your business data never leaves your machine
- Not even Anthropic (who made Claude) can see anything

---

## Data Storage

All your data is stored in:
- **SQLite database**: ~/Library/Application Support/Nexara/nexara.db
- This file survives restarts, updates, cache clears, and temp file cleaning
- It is ONLY deleted if you manually delete that file or the folder
- Use Settings → Data & Backup to export a JSON backup anytime

---

## Modules (40 total)
Dashboard · Accounting (Ledger, P&L, Balance Sheet, GST, HSN) · Taxation & GST ·
Cash Flow · Banking · HR & Payroll · Attendance · Recruitment · Performance Reviews ·
Training Materials · Inventory · Vendors · Supplier Comparison · Production ·
CRM & Pipeline · Proposals · Invoices · Quotations & Challans · Credit/Debit Notes ·
Price Lists · PDC Cheques · Outstanding Management · Legal & Compliance · Contracts ·
Regulatory Q&A · Insurance · Document Brain · Analytics · Reports (PDF) ·
Communications · Debt Recovery & Tender · Asset Tracking · Depreciation Chart ·
Goals & OKRs · Risk Register · Payroll Run · Non-Moving Stock · Pharmacy Module ·
Jewellery / Metal Ledger · Audit Trail · Settings
