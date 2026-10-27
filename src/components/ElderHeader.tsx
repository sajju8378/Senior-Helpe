import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Languages,
  SlidersHorizontal,
  ShieldAlert,
  UserCheck,
  HeartHandshake,
  Activity,
  ClipboardList,
  Smartphone,
} from 'lucide-react';
import { Language, TextScale, ThemeMode, ActiveRole } from '../types';
import { getTranslation } from '../utils/translations';
import { playChime } from '../utils/sound';

interface ElderHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  textScale: TextScale;
  onTextScaleChange: (scale: TextScale) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  onTriggerFallSim: () => void;
  onOpenApkModal: () => void;
}

export const ElderHeader: React.FC<ElderHeaderProps> = ({
  language,
  onLanguageChange,
  textScale,
  onTextScaleChange,
  themeMode,
  onThemeModeChange,
  voiceEnabled,
  onToggleVoice,
  activeRole,
  onRoleChange,
  onTriggerFallSim,
  onOpenApkModal,
}) => {
  const t = getTranslation(language);
  const [showAccessMenu, setShowAccessMenu] = useState(false);

  // Live formatted clock
  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hour = now.getHours();
  const greeting =
    hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;

  return (
    <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      {/* Top Utility Ribbon */}
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-800/60 text-sm">
        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-xl border border-stone-800">
          <button
            onClick={() => onRoleChange('elder')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-xs sm:text-sm ${
              activeRole === 'elder'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
            aria-label="Switch to Elder View"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.elderMode}</span>
          </button>

          <button
            onClick={() => onRoleChange('caregiver')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-xs sm:text-sm ${
              activeRole === 'caregiver'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
            aria-label="Switch to Caregiver Portal"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>{t.caregiverMode}</span>
          </button>

          <button
            onClick={() => onRoleChange('usability-lab')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-xs sm:text-sm ${
              activeRole === 'usability-lab'
                ? 'bg-cyan-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
            aria-label="Switch to Usability Test Lab"
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">{t.usabilityMode}</span>
            <span className="sm:hidden">Lab (5)</span>
          </button>
        </div>

        {/* Quick Accessibility Controls */}
        <div className="flex items-center gap-1.5">
          {/* Android APK & Install Button */}
          <button
            onClick={() => {
              playChime();
              onOpenApkModal();
            }}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95"
            title="Install as Android App or Build APK"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>

          {/* Fall Detector Trigger Test Button */}
          <button
            onClick={() => {
              playChime();
              onTriggerFallSim();
            }}
            className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Simulate sudden fall detection sensor trigger"
          >
            <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Simulate Fall</span>
          </button>

          {/* Voice Mute Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-lg border transition-colors ${
              voiceEnabled
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
            aria-label={voiceEnabled ? 'Voice output active' : 'Voice output muted'}
            title={voiceEnabled ? 'Voice output active' : 'Voice muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              playChime();
              onLanguageChange(language === 'en' ? 'hi' : 'en');
            }}
            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1"
            aria-label="Toggle language between English and Hindi"
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Accessibility Settings Toggle */}
          <button
            onClick={() => setShowAccessMenu(!showAccessMenu)}
            className={`p-2 rounded-lg border transition-colors ${
              showAccessMenu
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:text-stone-100'
            }`}
            aria-label="Open accessibility options"
            title="Text size and appearance"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Accessibility Panel */}
      {showAccessMenu && (
        <div className="max-w-5xl mx-auto mb-3 p-4 bg-stone-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl text-stone-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
            <h3 className="text-base sm:text-lg font-bold text-amber-400 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Accessibility & Display Preferences (WCAG AAA)</span>
            </h3>
            <button
              onClick={() => setShowAccessMenu(false)}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Text Scaler */}
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">
                {t.textSize}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onTextScaleChange('normal')}
                  className={`py-2 px-2 rounded-xl text-center border font-bold text-sm ${
                    textScale === 'normal'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  {t.textSizeNormal}
                </button>
                <button
                  onClick={() => onTextScaleChange('large')}
                  className={`py-2 px-2 rounded-xl text-center border font-bold text-base ${
                    textScale === 'large'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  {t.textSizeLarge}
                </button>
                <button
                  onClick={() => onTextScaleChange('huge')}
                  className={`py-2 px-2 rounded-xl text-center border font-bold text-lg ${
                    textScale === 'huge'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  {t.textSizeHuge}
                </button>
              </div>
            </div>

            {/* High Contrast Themes */}
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">
                {t.theme} Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onThemeModeChange('dark-amber')}
                  className={`py-2 px-1 rounded-xl text-center border text-xs sm:text-sm font-bold ${
                    themeMode === 'dark-amber'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  Dark Amber
                </button>
                <button
                  onClick={() => onThemeModeChange('contrast-black')}
                  className={`py-2 px-1 rounded-xl text-center border text-xs sm:text-sm font-bold ${
                    themeMode === 'contrast-black'
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-black border-stone-700 text-yellow-300'
                  }`}
                >
                  OLED High-Contrast
                </button>
                <button
                  onClick={() => onThemeModeChange('warm-light')}
                  className={`py-2 px-1 rounded-xl text-center border text-xs sm:text-sm font-bold ${
                    themeMode === 'warm-light'
                      ? 'bg-stone-100 text-stone-900 border-stone-300'
                      : 'bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  Warm Light
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Elder Header Banner */}
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-black text-2xl shadow-lg shadow-amber-500/20 border-2 border-amber-400">
            म
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-400">
                {t.appName}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                Online & Safe
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 font-medium">
              {greeting}, Ramesh ji • {dateString}
            </p>
          </div>
        </div>

        {/* Large Readable Clock */}
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-100 font-mono">
            {timeString}
          </div>
          <p className="text-xs text-amber-400 font-semibold">
            {language === 'hi' ? 'समय अनुसार दवा व आराम' : 'On Schedule'}
          </p>
        </div>
      </div>
    </header>
  );
};
