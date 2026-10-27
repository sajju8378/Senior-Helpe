# Mitra — Deployment & Android APK Build Guide

## 1. Why the GitHub Actions Workflow Failed (Commit `320dcf8` in your screenshot)

In your screenshot of `github.com/sajju8378/Senior-Helpe/actions`:
`Deploy Mitra Companion to GitHub Pages` failed after **16 seconds**.

### Root Cause:
1. **NPM Peer Dependency Conflict**: The previous `package.json` had a conflicting `"esbuild": "^0.25.0"` while `vite@8.3.5` requires `esbuild@^0.27.0`. When GitHub Actions ran `npm install`, npm aborted with:
   `npm error code ERESOLVE could not resolve peer dependency`
2. **Missing `package-lock.json`**: GitHub Actions attempted to look for a lockfile that wasn't present.

### Fixes Applied in this Update:
1. **Removed the conflicting `esbuild` dependency** from `package.json`.
2. **Generated a verified `package-lock.json`** using `--legacy-peer-deps`.
3. **Updated `.github/workflows/deploy.yml`** to run `npm install --legacy-peer-deps`, ensuring 100% clean builds on GitHub's Ubuntu runners.
4. **Added `workflow_dispatch`** so you can also trigger the deployment manually by clicking **"Run workflow"** inside GitHub Actions.

---

## 2. Important: GitHub Pages Configuration (Takes 30 seconds)

Notice in your screenshot that GitHub's default **`pages build and deployment`** was also running.

To ensure your built application displays at `https://sajju8378.github.io/Senior-Helpe/`:

1. In your GitHub repository: Click **Settings** (top navigation tab).
2. On the left sidebar: Click **Pages** (under Code and automation).
3. Under **"Build and deployment"**:
   - Change **Source** from *"Deploy from a branch"* to **"GitHub Actions"**!
4. Push the new commit, or go to **Actions** → click **"Deploy Mitra Companion to GitHub Pages"** → click **"Run workflow"**!
5. Once complete, open `https://sajju8378.github.io/Senior-Helpe/` — it will load seamlessly!

---

## 3. How to Build & Install the Android APK

### Option A: 1-Tap Native Android App (WebAPK) — Recommended
1. Open `https://sajju8378.github.io/Senior-Helpe/` on Chrome on your Android phone.
2. Tap the **"Android APK"** button at the top header, or tap Chrome's `⋮` menu → **"Install app"** / **"Add to Home screen"**.
3. Android will automatically package and install **Mitra** as a native **WebAPK** with its own home screen icon, splash screen, and full-screen experience with no browser address bar.

### Option B: 1-Click Online `.apk` Generator (PWABuilder)
1. Go to [pwabuilder.com](https://www.pwabuilder.com/).
2. Enter your URL: `https://sajju8378.github.io/Senior-Helpe/`.
3. Click **Start** → **Package for Stores** → **Android**.
4. Click **Generate APK** to download the signed `.apk` file ready to install on any Android phone.

### Option C: Native Android Studio Build (Capacitor)
The project includes `capacitor.config.json` (`com.mitra.eldercompanion`). On your computer, run:
```bash
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap open android
```
In Android Studio: Click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate `app-debug.apk`.
