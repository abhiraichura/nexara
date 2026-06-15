# Nexara — Setup & Run

## The app is already built (no build step needed)
The `dist/` folder contains the compiled app ready to run.

---

## Run on Mac or Windows

### Step 1 — Install Node.js (one time only)
Go to **https://nodejs.org** → click **LTS** → run the installer.

### Step 2 — Open Terminal (Mac) or Command Prompt (Windows)
Navigate to this folder. On Mac you can drag the folder into Terminal.

### Step 3 — Install Electron and start
```
npm install electron --save-dev
npm start
```

That's it. Nexara opens as a desktop app window.

---

## If you get "Electron failed to install" error
Delete and reinstall:
```
rm -rf node_modules/electron
npm install electron --save-dev
npm start
```

## If npm is very slow
Electron is a 130MB download. Wait for it — it only downloads once.

---

## To build a .dmg (Mac installer to share with others)
Run on your Mac:
```
npm install electron-builder --save-dev
npx electron-builder --mac --dir
```
Creates a `.app` file in `dist-electron/` — double-click to run, no Node needed.

## To build a .exe (Windows installer)
Run on Windows:
```
npm install electron-builder --save-dev
npx electron-builder --win
```

---

## Data & Backup
- Data saved locally in your OS user folder (never sent anywhere)
- Go to **Settings → Backup** to download a JSON backup
- Go to **Settings → Backup → Restore** to load a backup file

## Keyboard shortcuts
| Mac        | Windows     | Action       |
|------------|-------------|--------------|
| ⌘K         | Ctrl+K      | Search       |
| ⌘N         | Ctrl+N      | New Invoice  |
| ⌘D         | Ctrl+D      | Dark Mode    |
| ⌘B         | Ctrl+B      | Backup       |
| Esc        | Esc         | Close panels |
