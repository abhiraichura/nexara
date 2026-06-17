# Nexara — Setup Guide

## What's inside
- `dist/` — Pre-built app (already compiled, no build step needed)
- `src/` — Source code
- `electron.js` — Desktop window shell
- `package.json` — Dependencies

## How to run (one time setup)

### Step 1 — Install Node.js (if not already installed)
Download from: https://nodejs.org  
Choose the **LTS** version. Run the installer. Done.

### Step 2 — Install Electron
Open Terminal, drag the `nexara-app` folder into Terminal, then run:
```
npm install electron --save-dev --ignore-scripts
node node_modules/electron/install.js
```

### Step 3 — Launch Nexara
```
npm start
```

## After first setup
Every time you want to open Nexara, just run `npm start` from the nexara-app folder.

## Data & Privacy
- All your data is stored in your browser's localStorage on this machine
- Nothing is ever sent to any server
- Use Settings → Data & Backup to export a full backup JSON at any time

## Modules included (22 fully functional)
Dashboard · Accounting · Taxation & GST · Cash Flow · Banking · HR & Payroll ·
Attendance · Recruitment · Inventory · Vendors · Production · CRM & Pipeline ·
Proposals · Legal & Compliance · Contracts · Document Brain · Analytics ·
Reports · Communications · Audit Trail · Settings · AI Advisor
