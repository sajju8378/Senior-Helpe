# Mitra — Deployment & Android APK Build Guide

## 1. Why GitHub Pages showed `404 main.tsx` (From your screenshot)

In your screenshot at `sajju8378.github.io/Senior-Helpe/`, Chrome showed:
```
Failed to load resource: the server responded with a status of 404 () main.tsx:1
```

### Cause:
1. **GitHub Pages is a static file host**: It does not compile `.tsx` files on the fly. It needs the compiled Javascript in the `dist/` directory.
2. **Subfolder Base Path**: When hosting at `github.io/Senior-Helpe/`, assets must use relative paths (`./`) instead of root paths (`/`).

### How We Fixed It:
1. Updated `vite.config.ts` with `base: './'` so that all assets, scripts, and links are relative and work seamlessly on `sajju8378.github.io/Senior-Helpe/`.
2. Created `.github/workflows/deploy.yml`: When you push your code to GitHub, GitHub Actions will now automatically run `npm run build` and deploy the compiled `dist/` folder directly to GitHub Pages!

### How to Activate on GitHub:
1. In your GitHub repository: Go to **Settings** → **Pages**.
2. Under **"Build and deployment" Source**, change it from "Deploy from a branch" to **"GitHub Actions"**.
3. Push your repository to GitHub (`git push origin main`).
4. Your app at `https://sajju8378.github.io/Senior-Helpe/` will load instantly with zero 404 errors!

---

## 2. How to Build & Install the Android APK

You have three simple ways to get Mitra on Android as a native app / APK:

### Option A: Install Directly on Android as Native App (WebAPK) — Recommended
1. Open `https://sajju8378.github.io/Senior-Helpe/` (or your app URL) on Google Chrome on your Android phone.
2. Tap the **"Android APK"** button at the top, or tap Chrome's 3-dot menu (`⋮`) → **"Install app"** / **"Add to Home screen"**.
3. Android will automatically compile and install **Mitra** as a native **WebAPK** on your phone! It has its own launcher icon, opens full-screen without URL bars, and runs offline.

---

### Option B: 1-Click Online Standalone `.apk` File Generator (PWABuilder)
1. Go to Microsoft's free APK generator: [pwabuilder.com](https://www.pwabuilder.com/)
2. Paste your live URL: `https://sajju8378.github.io/Senior-Helpe/`
3. Click **Start** → **Package for Stores** → Choose **Android**.
4. Click **Generate APK**.
5. Download your signed `.apk` file and install it directly on any Android phone (or publish to Google Play)!

---

### Option C: Compile APK with Android Studio & Capacitor
The project is already pre-configured with `capacitor.config.json` (`com.mitra.eldercompanion`).

Run these commands on your computer:
```bash
# 1. Build the production web bundle
npm run build

# 2. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Add Android platform
npx cap add android

# 4. Open in Android Studio
npx cap open android
```
In Android Studio:
- Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
- Your `.apk` file will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`!
