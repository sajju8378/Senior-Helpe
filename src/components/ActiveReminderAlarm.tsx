import React, { useEffect, useState } from 'react';
import { Pill, CheckCircle2, Clock, BellRing, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Reminder, Language, CaregiverSettings } from '../types';
import { playAlarm, playChime } from '../utils/sound';
import { speakText, stopSpeech } from '../utils/speech';

interface ActiveReminderAlarmProps {
  reminder: Reminder | null;
  onConfirmTaken: (reminderId: string) => void;
  onSnooze: (reminderId: string, minutes: number) => void;
  onDismiss: () => void;
  language: Language;
  voiceEnabled: boolean;
  caregiverSettings: CaregiverSettings;
  onLogAlert?: (type: 'missed_med', title: string, details: string) => void;
}

export const ActiveReminderAlarm: React.FC<ActiveReminderAlarmProps> = ({
  reminder,
  onConfirmTaken,
  onSnooze,
  onDismiss,
  language,
  voiceEnabled,
  caregiverSettings,
  onLogAlert,
}) => {
  const [escalationStage, setEscalationStage] = useState<'due' | 'escalated_5m' | 'escalated_15m' | 'caregiver_alerted'>('due');

  useEffect(() => {
    if (!reminder) {
      stopSpeech();
      return;
    }

    setEscalationStage(reminder.escalationStage === 'pending' ? 'due' : reminder.escalationStage as any);

    // Initial alert ring
    playAlarm();

    const title = language === 'hi' ? reminder.titleHi || reminder.title : reminder.title;
    const dose = language === 'hi' ? reminder.doseHi || reminder.dose : reminder.dose;
    const spokenMessage =
      language === 'hi'
        ? `दवाई का समय हो गया है: ${title}। ${dose || ''}। कृपया दवाई लेकर हरा बटन दबाएं।`
        : `Reminder time for: ${title}. ${dose || ''}. Please take it and press the green button.`;

    if (voiceEnabled) {
      speakText(spokenMessage, language);
    }
  }, [reminder]);

  if (!reminder) return null;

  const handleTaken = () => {
    stopSpeech();
    playChime();
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'बहुत अच्छा! दवाई ले ली गई है।'
          : 'Well done! Medicine confirmed as taken.',
        language
      );
    }
    onConfirmTaken(reminder.id);
  };

  const handleSnooze = () => {
    stopSpeech();
    playChime();
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'दस मिनट बाद फिर से याद दिलाऊँगी।'
          : 'I will remind you again in 10 minutes.',
        language
      );
    }
    onSnooze(reminder.id, 10);
  };

  const advanceEscalation = () => {
    if (escalationStage === 'due') {
      setEscalationStage('escalated_5m');
      playAlarm();
      if (voiceEnabled) {
        speakText(
          language === 'hi'
            ? '5 मिनट बीत चुके हैं। कृपया दवाई ले लें।'
            : '5 minutes have passed. Second alert for medicine.',
          language
        );
      }
    } else if (escalationStage === 'escalated_5m') {
      setEscalationStage('escalated_15m');
      playAlarm();
      if (voiceEnabled) {
        speakText(
          language === 'hi'
            ? '15 मिनट बीत चुके हैं। अब आपकी बेटी को अलर्ट जाएगा।'
            : '15 minutes have passed. Alert will now go to your caregiver.',
          language
        );
      }
    } else if (escalationStage === 'escalated_15m') {
      setEscalationStage('caregiver_alerted');
      playAlarm();
      if (onLogAlert) {
        onLogAlert(
          'missed_med',
          `Unconfirmed Dose: ${reminder.title}`,
          `Reminder scheduled at ${reminder.time} was not confirmed after 15m. Caregiver ${caregiverSettings.caregiverName} was alerted via SMS.`
        );
      }
      if (voiceEnabled) {
        speakText(
          language === 'hi'
            ? `आपकी बेटी ${caregiverSettings.caregiverName} को संदेश भेज दिया गया है कि आपने अभी तक दवाई नहीं ली है।`
            : `Your caregiver ${caregiverSettings.caregiverName} has been alerted that your dose is unconfirmed.`,
          language
        );
      }
    }
  };

  const displayTitle = language === 'hi' ? reminder.titleHi || reminder.title : reminder.title;
  const displayDose = language === 'hi' ? reminder.doseHi || reminder.dose : reminder.dose;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/95 backdrop-blur-xl animate-alert-flash">
      <div className="w-full max-w-xl bg-stone-900 border-4 border-amber-500 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 flex flex-col justify-between max-h-[94vh] overflow-y-auto">
        {/* Header with pulsating alarm icon */}
        <div className="text-center">
          <div className="inline-flex p-4 bg-amber-500 text-stone-950 rounded-full mb-4 animate-bounce">
            <BellRing className="w-12 h-12" />
          </div>

          <div className="inline-block px-3.5 py-1 rounded-full bg-amber-950 border border-amber-500/80 text-amber-300 font-bold text-sm uppercase tracking-wider mb-2">
            {language === 'hi' ? 'दवाई का समय' : 'MEDICINE REMINDER'}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
            {displayTitle}
          </h2>

          {/* Dosage & Food instructions in clear high-contrast box */}
          <div className="mt-4 p-5 bg-stone-950 border-2 border-stone-700 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stone-400 uppercase">
                {language === 'hi' ? 'खुराक व समय' : 'Dosage & Time'}:
              </span>
              <span className="text-lg font-mono font-extrabold text-amber-400">
                {reminder.time}
              </span>
            </div>
            <p className="text-2xl font-bold text-stone-100">{displayDose}</p>
            {reminder.notes && (
              <p className="text-sm text-stone-300 border-t border-stone-800 pt-2 italic">
                "{reminder.notes}"
              </p>
            )}
          </div>

          {/* Escalation Progress Tracker */}
          <div className="mt-5 p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2">
              <span>{language === 'hi' ? 'सुरक्षा एस्केलेशन क्रम' : 'Safety Escalation Chain'}</span>
              <span className="text-amber-400 font-semibold">
                {escalationStage === 'due' && 'Stage 1: Scheduled Time'}
                {escalationStage === 'escalated_5m' && 'Stage 2: +5 Min Repeat'}
                {escalationStage === 'escalated_15m' && 'Stage 3: +15 Min Repeat'}
                {escalationStage === 'caregiver_alerted' && 'Stage 4: Caregiver Alerted!'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-center">
              <div
                className={`p-2 rounded-lg ${
                  escalationStage === 'due'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                0m (Now)
              </div>
              <div
                className={`p-2 rounded-lg ${
                  escalationStage === 'escalated_5m'
                    ? 'bg-amber-500 text-stone-950'
                    : escalationStage === 'escalated_15m' || escalationStage === 'caregiver_alerted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                +5m Ring
              </div>
              <div
                className={`p-2 rounded-lg ${
                  escalationStage === 'escalated_15m'
                    ? 'bg-amber-500 text-stone-950'
                    : escalationStage === 'caregiver_alerted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                +15m Ring
              </div>
              <div
                className={`p-2 rounded-lg ${
                  escalationStage === 'caregiver_alerted'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                Alert Caregiver
              </div>
            </div>

            {/* Test Escalation Trigger button for demonstration */}
            {escalationStage !== 'caregiver_alerted' && (
              <button
                onClick={advanceEscalation}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline font-semibold block mx-auto"
              >
                ⏩ Simulate next escalation step ({escalationStage === 'due' ? '+5m' : escalationStage === 'escalated_5m' ? '+15m' : 'Alert Caregiver'})
              </button>
            )}

            {escalationStage === 'caregiver_alerted' && (
              <div className="mt-2 text-xs p-2 bg-red-950/80 border border-red-700 rounded-lg text-red-200 text-left">
                ⚠️ Caregiver <strong>{caregiverSettings.caregiverName}</strong> has been notified via SMS because this dose was unconfirmed after 15 minutes.
              </div>
            )}
          </div>
        </div>

        {/* Big Action Buttons (min 60px high) */}
        <div className="space-y-3 mt-6">
          <button
            onClick={handleTaken}
            className="w-full py-5 px-6 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-2xl sm:text-3xl rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all border-2 border-emerald-300 active:scale-95"
          >
            <CheckCircle2 className="w-8 h-8" />
            <span>{language === 'hi' ? 'दवाई ले ली (TAKEN)' : "I'VE TAKEN IT (TAKEN)"}</span>
          </button>

          <button
            onClick={handleSnooze}
            className="w-full py-3.5 px-6 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-2 border border-stone-600 transition-all active:scale-95"
          >
            <Clock className="w-6 h-6" />
            <span>{language === 'hi' ? '10 मिनट बाद याद दिलाएं (Snooze)' : 'Remind me in 10 minutes (Snooze)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
