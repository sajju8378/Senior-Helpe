import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertOctagon } from 'lucide-react';
import { Language } from '../types';
import { playSosBeep, playChime } from '../utils/sound';
import { speakText, stopSpeech } from '../utils/speech';

interface FallDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOS: () => void;
  language: Language;
  voiceEnabled: boolean;
  onLogAlert?: (type: 'fall', title: string, details: string) => void;
}

export const FallDetectionModal: React.FC<FallDetectionModalProps> = ({
  isOpen,
  onClose,
  onTriggerSOS,
  language,
  voiceEnabled,
  onLogAlert,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(30);
      stopSpeech();
      return;
    }

    playSosBeep(true);
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'गिरने का संकेत मिला है! क्या आप ठीक हैं? तीस सेकंड में आपातकालीन अलार्म बजेगा।'
          : 'A fall was detected! Are you alright? Emergency alert will dispatch in 30 seconds.',
        language
      );
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        if (prev % 3 === 0 || prev <= 10) {
          playSosBeep(prev <= 5);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleTimeout = () => {
    stopSpeech();
    if (onLogAlert) {
      onLogAlert(
        'fall',
        'UNCONFIRMED FALL DETECTED (30s Elapsed)',
        'Accelerometer detected sudden impact. Elder did not cancel within 30s window. Escalated to SOS.'
      );
    }
    onClose();
    onTriggerSOS();
  };

  const handleCancel = () => {
    stopSpeech();
    playChime();
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'अलर्ट रद्द कर दिया गया। खुशी है कि आप सुरक्षित हैं।'
          : 'Alert cancelled. Glad to know you are okay.',
        language
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-amber-950/90 backdrop-blur-xl animate-alert-flash">
      <div className="w-full max-w-lg bg-stone-950 border-4 border-amber-500 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        <div className="text-center">
          <div className="inline-flex p-4 bg-amber-500 text-stone-950 rounded-full mb-4 animate-bounce">
            <Activity className="w-14 h-14" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
            {language === 'hi' ? 'गिरने की आशंका का संकेत!' : 'Potential Fall Detected!'}
          </h2>

          <p className="mt-2 text-lg text-stone-200">
            {language === 'hi'
              ? 'फोन सेंसर ने अचानक झटके का संकेत दर्ज किया है।'
              : 'Sensors detected a sudden impact or fall.'}
          </p>

          <div className="my-6 p-6 bg-stone-900 border-2 border-amber-500/80 rounded-2xl">
            <p className="text-sm uppercase tracking-wider text-amber-400 font-bold mb-1">
              {language === 'hi' ? 'आपातकालीन सहायता जाने में शेष:' : 'Emergency SOS will dispatch in:'}
            </p>
            <div className="text-6xl sm:text-7xl font-black font-mono text-amber-300">
              {secondsLeft}s
            </div>
            <div className="w-full bg-stone-800 rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(secondsLeft / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {/* Giant I'M OKAY button */}
          <button
            onClick={handleCancel}
            className="w-full py-5 px-6 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-2xl sm:text-3xl rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all border-2 border-emerald-200 active:scale-95"
          >
            <CheckCircle className="w-8 h-8" />
            <span>
              {language === 'hi' ? 'मैं ठीक हूँ (अलर्ट रद्द करें)' : "I'M OKAY - CANCEL"}
            </span>
          </button>

          {/* Trigger Emergency Now */}
          <button
            onClick={() => {
              onClose();
              onTriggerSOS();
            }}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 border border-red-400 transition-colors"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>
              {language === 'hi' ? 'मुझे मदद चाहिए (तुरंत SOS भेजें)' : 'I Need Help (Dispatch SOS Now)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
