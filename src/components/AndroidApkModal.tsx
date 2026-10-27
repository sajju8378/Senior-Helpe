import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Sparkles,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { Language } from '../types';
import { playChime } from '../utils/sound';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'pwabuilder' | 'capacitor' | 'github'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        playChime();
      }
    } else {
      alert(
        language === 'hi'
          ? 'अपने मोबाइल ब्राउज़र (जैसे Chrome) के मेनू (तीन बिंदु ⋮) पर टैप करें और "Add to Home screen" या "Install app" चुनें।'
          : 'In your mobile browser (Chrome/Edge), tap the three dots (⋮) menu and select "Install app" or "Add to Home screen" to generate the Android WebAPK!'
      );
    }
  };

  const copyCapacitorCommands = () => {
    const text = `npm run build\nnpm i -D @capacitor/cli @capacitor/core @capacitor/android\nnpx cap add android\nnpx cap open android`;
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    playChime();
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-stone-900 border-4 border-amber-500 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-stone-950 rounded-2xl shadow-lg">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-400">
                {language === 'hi' ? 'एंड्रॉइड ऐप व APK बनाएं' : 'Build & Install Android App (.APK)'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                Install as native app on Android, generate signed APK, or fix GitHub Pages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800 my-4 text-xs sm:text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            📱 1-Tap WebAPK
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            ⚡ 1-Click PWABuilder APK
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            🤖 Android Studio APK
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-emerald-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            🌐 Fix GitHub Pages 404
          </button>
        </div>

        {/* Content Tab 1: PWA WebAPK */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>WebAPK Manifest & Service Worker Ready</span>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed">
                Modern Android phones (via Google Play Services & Chrome) automatically package Progressive Web Apps into a <strong>real native APK (WebAPK)</strong> with its own home screen launcher icon, splash screen, and full-screen display without browser address bars!
              </p>
            </div>

            <button
              onClick={handleInstallPWA}
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
            >
              <Download className="w-6 h-6" />
              <span>
                {isInstalled ? 'Already Installed as App' : 'Install Directly on Android Device'}
              </span>
            </button>

            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <p className="font-bold text-stone-200">How it works on Android:</p>
              <p>1. Open this link on your Android phone's Google Chrome browser.</p>
              <p>2. Tap the button above, or tap Chrome's menu (⋮) → <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
              <p>3. Android will compile and install <strong>Mitra</strong> directly onto your app drawer!</p>
            </div>
          </div>
        )}

        {/* Content Tab 2: PWABuilder (1-Click APK Download) */}
        {activeTab === 'pwabuilder' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
              <h3 className="font-extrabold text-base text-amber-400">
                Generate Signed Standalone .APK File Online:
              </h3>
              <p className="text-sm text-stone-300">
                You can use Microsoft's official free <strong>PWABuilder</strong> tool to convert your deployed URL into a downloadable <strong>.apk</strong> or <strong>.aab</strong> file ready for direct phone installation or Google Play Store!
              </p>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-2xl space-y-2 text-sm text-amber-200">
              <p className="font-bold text-amber-300">Step-by-step 1-Click APK generation:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm">
                <li>
                  Open PWABuilder in a new tab:
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1.5 inline-flex items-center gap-1 text-amber-400 underline font-bold"
                  >
                    pwabuilder.com <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  Enter your GitHub Pages URL: <code className="bg-stone-950 px-2 py-0.5 rounded text-amber-300 font-mono">https://sajju8378.github.io/Senior-Helpe/</code>
                </li>
                <li>
                  Click <strong>"Start"</strong> → then click <strong>"Package for Stores"</strong> → Choose <strong>"Android"</strong>!
                </li>
                <li>
                  Click <strong>"Generate APK / Package"</strong> and download your ready-to-use <strong>.apk</strong> file!
                </li>
              </ol>
            </div>

            <a
              href="https://www.pwabuilder.com/"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-6 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 border border-stone-600 shadow-md transition-all"
            >
              <ExternalLink className="w-5 h-5 text-amber-400" />
              <span>Open PWABuilder (pwabuilder.com)</span>
            </a>
          </div>
        )}

        {/* Content Tab 3: Capacitor Android Studio */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
              <h3 className="font-extrabold text-base text-amber-400">
                Compile Native APK with Android Studio & Capacitor:
              </h3>
              <p className="text-sm text-stone-300">
                We have already created the <code className="text-amber-300">capacitor.config.json</code> in this project with App ID <code className="text-amber-300">com.mitra.eldercompanion</code>.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Terminal Commands:</span>
                <button
                  onClick={copyCapacitorCommands}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-400 rounded-lg flex items-center gap-1"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>

              <pre className="p-3 bg-stone-900 rounded-xl text-xs sm:text-sm font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`# 1. Build the web distribution
npm run build

# 2. Install Capacitor packages (if on local machine)
npm install @capacitor/core @capacitor/android @capacitor/cli

# 3. Add Android platform
npx cap add android

# 4. Open project in Android Studio
npx cap open android`}
              </pre>

              <p className="text-xs text-stone-400 pt-1">
                In Android Studio: Click <strong>Build</strong> &gt; <strong>Build Bundle(s) / APK(s)</strong> &gt; <strong>Build APK(s)</strong> to generate <code className="text-stone-200">app-debug.apk</code> or <code className="text-stone-200">app-release.apk</code>!
              </p>
            </div>
          </div>
        )}

        {/* Content Tab 4: Fix GitHub Pages 404 Error */}
        {activeTab === 'github' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-stone-950 rounded-2xl border border-rose-900/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>Why did "404 main.tsx" happen on sajju8378.github.io/Senior-Helpe/?</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Your browser showed <strong>404 main.tsx</strong> because GitHub Pages only hosts static files. When you push raw repository files without building, GitHub Pages tries to load <code className="text-rose-300">/src/main.tsx</code> directly without compiling it to Javascript, and looks at the root domain instead of the <code className="text-amber-300">/Senior-Helpe/</code> subfolder.
              </p>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-600/60 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>What We Already Fixed For You:</span>
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-emerald-200/90 space-y-1">
                <li>Set <code className="bg-stone-900 px-1.5 py-0.5 rounded text-white">base: './'</code> in <code className="text-white">vite.config.ts</code> so asset paths are relative and work on any subfolder.</li>
                <li>Created <code className="bg-stone-900 px-1.5 py-0.5 rounded text-white">.github/workflows/deploy.yml</code> for automated GitHub Pages deployment!</li>
              </ul>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs sm:text-sm text-stone-300 space-y-2">
              <p className="font-bold text-stone-100">To publish live on GitHub Pages with 1 git push:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-stone-300">
                <li>In your GitHub repo: Go to <strong>Settings</strong> &gt; <strong>Pages</strong>.</li>
                <li>Under <strong>"Build and deployment" Source</strong>: Select <strong>"GitHub Actions"</strong>!</li>
                <li>Now, simply push your commit to GitHub. GitHub Actions will build and deploy cleanly with zero 404s!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
