import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Pill,
  Sparkles,
  Users,
  ShieldCheck,
  Heart,
  Mic,
  Clock,
  Activity,
  ArrowRight,
  Smile,
  Volume2,
} from 'lucide-react';
import { Reminder, CheckInStatus, Language, ActiveRole } from '../types';
import { getTranslation } from '../utils/translations';
import { playChime, playAlarm } from '../utils/sound';
import { speakText } from '../utils/speech';

interface ElderHomeProps {
  language: Language;
  onOpenSOS: () => void;
  nextReminder: Reminder | null;
  onConfirmTaken: (id: string) => void;
  onTriggerAlarm: (reminder: Reminder) => void;
  checkInStatus: CheckInStatus;
  onCheckIn: (mood: 'happy' | 'peaceful' | 'okay' | 'tired' | 'low') => void;
  onNavigateTab: (tab: 'reminders' | 'memory' | 'contacts' | 'safety' | 'health') => void;
  onOpenVoiceAssistant: () => void;
  voiceEnabled: boolean;
}

export const ElderHome: React.FC<ElderHomeProps> = ({
  language,
  onOpenSOS,
  nextReminder,
  onConfirmTaken,
  onTriggerAlarm,
  checkInStatus,
  onCheckIn,
  onNavigateTab,
  onOpenVoiceAssistant,
  voiceEnabled,
}) => {
  const t = getTranslation(language);

  const moods: Array<{
    key: 'happy' | 'peaceful' | 'okay' | 'tired' | 'low';
    label: string;
    emoji: string;
    color: string;
  }> = [
    { key: 'happy', label: t.moodHappy, emoji: '😊', color: 'hover:bg-amber-500/20' },
    { key: 'peaceful', label: t.moodPeaceful, emoji: '🌿', color: 'hover:bg-emerald-500/20' },
    { key: 'okay', label: t.moodOkay, emoji: '👍', color: 'hover:bg-blue-500/20' },
    { key: 'tired', label: t.moodTired, emoji: '🥱', color: 'hover:bg-purple-500/20' },
    { key: 'low', label: t.moodLow, emoji: '💙', color: 'hover:bg-indigo-500/20' },
  ];

  const handleMoodSelect = (mood: any) => {
    playChime();
    onCheckIn(mood.key);
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? `धन्यवाद! आपकी हाज़िरी दर्ज हो गई है और परिवार को बता दिया गया है कि आप ${mood.label} महसूस कर रहे हैं।`
          : `Thank you! Your check-in is recorded. Your family knows you are feeling ${mood.label}.`,
        language
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* 1. GIANT ONE-TOUCH SOS BUTTON (At least 80px tall, High-Contrast Red) */}
      <div className="w-full">
        <button
          onClick={() => {
            playAlarm();
            onOpenSOS();
          }}
          className="w-full py-5 sm:py-6 px-6 bg-red-600 hover:bg-red-500 text-stone-950 font-black rounded-3xl flex items-center justify-between gap-4 shadow-2xl shadow-red-600/40 border-4 border-red-300 transition-all active:scale-95 group text-left cursor-pointer"
          aria-label="One-Touch Emergency SOS Button"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-950 text-red-500 rounded-2xl flex-shrink-0 animate-pulse group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black tracking-tight leading-none text-stone-950">
                {t.sosButton}
              </span>
              <span className="block text-xs sm:text-sm font-extrabold text-red-950 mt-1 opacity-90">
                {t.sosSub}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-stone-950 font-mono font-black text-sm">
            <span>Direct to 112</span>
            <span className="text-xs font-semibold">+ SMS Caregiver</span>
          </div>
        </button>
      </div>

      {/* 2. DAILY CHECK-IN CARD ("How are you feeling today?" + "I'm OK" button) */}
      <div className="p-5 sm:p-6 bg-stone-900 border-3 border-amber-500/60 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-100">
                {t.howAreYou}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                {language === 'hi'
                  ? 'दैनिक उपस्थिति (परिवार को सूचित करता है)'
                  : 'Daily Presence (Peace of mind for your family)'}
              </p>
            </div>
          </div>

          {checkInStatus.checkedIn && (
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-xs sm:text-sm rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Checked in today</span>
            </span>
          )}
        </div>

        {/* Big Quick I'M OK Button */}
        {!checkInStatus.checkedIn ? (
          <div className="space-y-3">
            <button
              onClick={() => handleMoodSelect({ key: 'happy', label: t.moodHappy })}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 border-2 border-emerald-300"
            >
              <CheckCircle className="w-7 h-7" />
              <span>{t.checkInOk}</span>
            </button>

            {/* Simple Mood Selector */}
            <div className="pt-2">
              <p className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider text-center">
                {language === 'hi' ? 'या अपना मनोभाव चुनें:' : 'Or choose how you feel right now:'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {moods.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleMoodSelect(m)}
                    className="p-3 bg-stone-950 hover:bg-stone-800 border-2 border-stone-800 hover:border-amber-400 rounded-2xl flex flex-col items-center justify-center text-center transition-all group active:scale-95"
                  >
                    <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                      {m.emoji}
                    </span>
                    <span className="text-xs font-extrabold text-stone-200">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
            <p className="text-sm sm:text-base text-stone-200 font-medium">
              {t.checkedInDone} Mood logged:{' '}
              <span className="text-amber-400 font-bold capitalize">
                {checkInStatus.mood}
              </span>
            </p>
            <button
              onClick={() => onCheckIn('peaceful')}
              className="text-xs text-stone-400 hover:text-amber-400 underline font-semibold ml-2"
            >
              Update
            </button>
          </div>
        )}
      </div>

      {/* 3. NEXT MEDICINE REMINDER CARD WITH FOOD INSTRUCTIONS */}
      {nextReminder && (
        <div className="p-5 sm:p-6 bg-stone-900 border-3 border-amber-500 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 text-stone-950 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400">
                {t.nextReminder} • {nextReminder.time}
              </span>
            </div>

            <button
              onClick={() => onTriggerAlarm(nextReminder)}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-bold"
            >
              Test Ringing Alarm
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-stone-100">
              {language === 'hi' ? nextReminder.titleHi || nextReminder.title : nextReminder.title}
            </h3>
            <p className="text-base sm:text-lg text-amber-300 font-bold">
              {language === 'hi' ? nextReminder.doseHi || nextReminder.dose : nextReminder.dose}
            </p>
            {nextReminder.notes && (
              <p className="text-xs sm:text-sm text-stone-400 italic">
                "{nextReminder.notes}"
              </p>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {!nextReminder.taken ? (
              <>
                <button
                  onClick={() => {
                    playChime();
                    onConfirmTaken(nextReminder.id);
                  }}
                  className="py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 border-2 border-emerald-300"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>{t.takenButton}</span>
                </button>

                <button
                  onClick={() => onTriggerAlarm(nextReminder)}
                  className="py-4 px-6 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 border border-stone-600 transition-all active:scale-95"
                >
                  <Clock className="w-5 h-5" />
                  <span>{t.snoozeButton}</span>
                </button>
              </>
            ) : (
              <div className="col-span-2 p-3 bg-emerald-950 text-emerald-300 rounded-2xl border border-emerald-700 font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Confirmed taken today! Next dose will ring on schedule.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TALK TO MITRA VOICE COMPANION BANNER */}
      <div
        onClick={onOpenVoiceAssistant}
        className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border-3 border-stone-700 hover:border-amber-400 rounded-3xl shadow-xl cursor-pointer transition-all active:scale-98 group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-500 group-hover:bg-amber-400 text-stone-950 rounded-2xl shadow-lg transition-colors flex-shrink-0">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-100 flex items-center gap-2">
                <span>{t.talkToMitra}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300">
                  Voice First
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                {t.talkToMitraSub}
              </p>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="px-4 py-2 bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-200 font-bold text-sm rounded-xl transition-colors">
              Tap to Speak
            </span>
          </div>
        </div>
      </div>

      {/* 5. FOUR GIANT TOUCH TILES (>= 64dp, High Contrast, One task per screen) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tile 1: Medicines & Reminders */}
        <button
          onClick={() => onNavigateTab('reminders')}
          className="p-6 bg-stone-900 hover:bg-stone-850 border-3 border-stone-800 hover:border-amber-400 rounded-3xl flex flex-col justify-between text-left transition-all active:scale-95 group shadow-lg min-h-[150px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
              <Pill className="w-8 h-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-stone-600 group-hover:text-amber-400 transition-colors" />
          </div>

          <div className="mt-4">
            <h4 className="text-xl sm:text-2xl font-black text-stone-100">
              {t.medicinesTile}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {t.medicinesSub}
            </p>
          </div>
        </button>

        {/* Tile 2: Memory Vault */}
        <button
          onClick={() => onNavigateTab('memory')}
          className="p-6 bg-stone-900 hover:bg-stone-850 border-3 border-stone-800 hover:border-cyan-400 rounded-3xl flex flex-col justify-between text-left transition-all active:scale-95 group shadow-lg min-h-[150px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl group-hover:bg-cyan-500 group-hover:text-stone-950 transition-colors">
              <Sparkles className="w-8 h-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-stone-600 group-hover:text-cyan-400 transition-colors" />
          </div>

          <div className="mt-4">
            <h4 className="text-xl sm:text-2xl font-black text-stone-100">
              {t.memoryTile}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {t.memorySub}
            </p>
          </div>
        </button>

        {/* Tile 3: Family & Contacts */}
        <button
          onClick={() => onNavigateTab('contacts')}
          className="p-6 bg-stone-900 hover:bg-stone-850 border-3 border-stone-800 hover:border-emerald-400 rounded-3xl flex flex-col justify-between text-left transition-all active:scale-95 group shadow-lg min-h-[150px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl group-hover:bg-emerald-500 group-hover:text-stone-950 transition-colors">
              <Users className="w-8 h-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-stone-600 group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="mt-4">
            <h4 className="text-xl sm:text-2xl font-black text-stone-100">
              {t.contactsTile}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {t.contactsSub}
            </p>
          </div>
        </button>

        {/* Tile 4: Safety & Scam Guard */}
        <button
          onClick={() => onNavigateTab('safety')}
          className="p-6 bg-stone-900 hover:bg-stone-850 border-3 border-stone-800 hover:border-rose-400 rounded-3xl flex flex-col justify-between text-left transition-all active:scale-95 group shadow-lg min-h-[150px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl group-hover:bg-rose-500 group-hover:text-stone-950 transition-colors">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-stone-600 group-hover:text-rose-400 transition-colors" />
          </div>

          <div className="mt-4">
            <h4 className="text-xl sm:text-2xl font-black text-stone-100">
              {t.safetyTile}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {t.safetySub}
            </p>
          </div>
        </button>
      </div>

      {/* Extra helper card: Health Logs */}
      <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-amber-400" />
          <div>
            <h5 className="font-bold text-stone-200 text-sm sm:text-base">
              {t.healthTile}
            </h5>
            <p className="text-xs text-stone-400">
              {t.healthSub}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('health')}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs sm:text-sm rounded-xl"
        >
          View Diary
        </button>
      </div>
    </div>
  );
};
