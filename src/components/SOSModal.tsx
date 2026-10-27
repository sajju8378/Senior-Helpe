import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, X, MapPin, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { CaregiverSettings, Language } from '../types';
import { playSosBeep, playChime } from '../utils/sound';
import { speakText, stopSpeech } from '../utils/speech';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiverSettings: CaregiverSettings;
  language: Language;
  voiceEnabled: boolean;
  onLogAlert?: (type: 'sos', title: string, details: string) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  caregiverSettings,
  language,
  voiceEnabled,
  onLogAlert,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isDispatched, setIsDispatched] = useState(false);
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsDispatched(false);
      setCallActive(false);
      stopSpeech();
      return;
    }

    // Play initial alert sound
    playSosBeep(true);
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'आपातकालीन अलार्म शुरू हो रहा है। रद्द करने के लिए हरा बटन दबाएं।'
          : 'Emergency SOS activated. Press cancel if this was accidental.',
        language
      );
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerDispatch();
          return 0;
        }
        playSosBeep(false);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const triggerDispatch = () => {
    setIsDispatched(true);
    setCallActive(true);
    playSosBeep(true);

    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? `आपातकालीन सेवा ${caregiverSettings.emergencyNumber} और आपकी बेटी ${caregiverSettings.caregiverName} को आपका स्थान भेज दिया गया है।`
          : `Emergency alert and your location have been sent to ${caregiverSettings.emergencyNumber} and your caregiver ${caregiverSettings.caregiverName}.`,
        language
      );
    }

    if (onLogAlert) {
      onLogAlert(
        'sos',
        'EMERGENCY SOS DISPATCHED',
        `Elder triggered SOS. Emergency dialer to ${caregiverSettings.emergencyNumber} opened and SMS sent to ${caregiverSettings.caregiverName} (${caregiverSettings.caregiverPhone}) with GPS Coordinates.`
      );
    }
  };

  const handleCancel = () => {
    stopSpeech();
    playChime();
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'अलार्म रद्द कर दिया गया है। आप सुरक्षित हैं।'
          : 'Emergency alert cancelled. You are safe.',
        language
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-red-950/90 backdrop-blur-xl animate-alert-flash">
      <div className="w-full max-w-xl bg-stone-950 border-4 border-red-600 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        {/* Header Banner */}
        <div className="text-center">
          <div className="inline-flex p-4 bg-red-600 text-stone-950 rounded-full mb-4 animate-sos-pulse">
            <ShieldAlert className="w-14 h-14" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-red-500 tracking-tight">
            {language === 'hi' ? 'आपातकालीन सहायता (SOS)' : 'EMERGENCY SOS'}
          </h2>

          {!isDispatched ? (
            <div className="mt-4 p-4 bg-red-950/80 border-2 border-red-500 rounded-2xl">
              <p className="text-xl sm:text-2xl font-bold text-red-200">
                {language === 'hi' ? 'अलर्ट भेजा जा रहा है:' : 'Dispatching emergency alerts in:'}
              </p>
              <div className="text-6xl font-black font-mono text-white my-2 animate-bounce">
                {countdown}s
              </div>
              <p className="text-sm sm:text-base text-red-300">
                {language === 'hi'
                  ? 'यदि यह गलती से दबा है, तो नीचे दिए गए हरे बटन को दबाकर रद्द करें।'
                  : 'If this was pressed by mistake, tap the big green button below to cancel.'}
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-red-950/90 border-2 border-red-400 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span>
                  {language === 'hi'
                    ? 'आपातकालीन संदेश सफलतापूर्वक भेज दिया गया!'
                    : 'Emergency Alerts Successfully Dispatched!'}
                </span>
              </div>

              {/* Simulated Caregiver SMS */}
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-700 text-sm space-y-1.5">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> SMS to Caregiver: {caregiverSettings.caregiverName}
                  </span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <p className="text-stone-200 font-medium">
                  "🚨 EMERGENCY: Elder Ramesh has triggered SOS at{' '}
                  <span className="text-amber-300 font-semibold underline">
                    Home (Block C, Rajouri Garden, New Delhi)
                  </span>
                  . Live GPS Coordinates: 28.6139° N, 77.2090° E. Please respond immediately!"
                </p>
              </div>

              {/* Location pin */}
              <div className="flex items-center gap-2 text-sm text-stone-300 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Current Location: 28.6139° N, 77.2090° E (Accuracy ~ 10m)</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {/* Dial emergency number button */}
          <a
            href={`tel:${caregiverSettings.emergencyNumber}`}
            onClick={() => {
              playChime();
            }}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-500 text-stone-950 font-black text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 transition-all border-2 border-red-300 active:scale-95"
          >
            <PhoneCall className="w-7 h-7" />
            <span>
              {language === 'hi'
                ? `हेल्पलाइन ${caregiverSettings.emergencyNumber} डायल करें`
                : `Dial Emergency ${caregiverSettings.emergencyNumber}`}
            </span>
          </a>

          {/* Call Caregiver Direct */}
          <a
            href={`tel:${caregiverSettings.caregiverPhone}`}
            className="w-full py-3 px-6 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 border border-stone-600 transition-all active:scale-95"
          >
            <PhoneCall className="w-6 h-6 text-emerald-400" />
            <span>
              {language === 'hi'
                ? `बेटी ${caregiverSettings.caregiverName} को कॉल करें`
                : `Call Caregiver (${caregiverSettings.caregiverName})`}
            </span>
          </a>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all border-2 border-emerald-300 active:scale-95"
          >
            <CheckCircle className="w-7 h-7" />
            <span>
              {language === 'hi' ? 'मैं सुरक्षित हूँ - अलार्म बंद करें' : "I AM SAFE - CANCEL SOS"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
