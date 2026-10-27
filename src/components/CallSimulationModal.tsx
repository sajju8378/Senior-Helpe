import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Video, VideoOff, User } from 'lucide-react';
import { Contact, Language } from '../types';
import { playChime, playAlarm } from '../utils/sound';
import { speakText, stopSpeech } from '../utils/speech';

interface CallSimulationModalProps {
  contact: Contact | null;
  isVideo: boolean;
  onClose: () => void;
  language: Language;
}

export const CallSimulationModal: React.FC<CallSimulationModalProps> = ({
  contact,
  isVideo,
  onClose,
  language,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!contact) return;
    setCallStatus('ringing');
    setDuration(0);

    // Speak announcement
    speakText(
      language === 'hi'
        ? `${contact.name} को कॉल मिल रहा है...`
        : `Calling ${contact.name}...`,
      language
    );

    // Connect after 2.5 seconds
    const ringTimer = setTimeout(() => {
      setCallStatus('connected');
      playChime();
      speakText(
        language === 'hi'
          ? `नमस्ते पापा! मैं सुन रही हूँ, आप कैसे हैं?`
          : `Hello! I can hear you clearly. How are you doing?`,
        language
      );
    }, 2500);

    return () => clearTimeout(ringTimer);
  }, [contact]);

  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!contact) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    stopSpeech();
    playChime();
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-stone-900 border-4 border-amber-500 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 flex flex-col justify-between items-center min-h-[500px]">
        {/* Contact info header */}
        <div className="text-center w-full">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={contact.photoUrl}
              alt={contact.name}
              className="w-full h-full rounded-full object-cover border-4 border-amber-400 shadow-xl"
            />
            {callStatus === 'ringing' && (
              <span className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping opacity-75" />
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-stone-100">
            {contact.name}
          </h3>

          <p className="text-sm sm:text-base text-amber-400 font-semibold mt-1">
            {language === 'hi' ? contact.relationshipHi : contact.relationship}
          </p>

          <p className="text-sm font-mono text-stone-400 mt-1">
            {contact.phone}
          </p>

          <div className="mt-3">
            {callStatus === 'ringing' && (
              <span className="text-base text-amber-300 font-bold animate-pulse">
                {language === 'hi' ? 'घंटी जा रही है...' : 'Ringing...'}
              </span>
            )}
            {callStatus === 'connected' && (
              <span className="text-lg text-emerald-400 font-mono font-extrabold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700">
                Connected • {formatDuration(duration)}
              </span>
            )}
            {callStatus === 'ended' && (
              <span className="text-base text-rose-400 font-bold">Call Ended</span>
            )}
          </div>
        </div>

        {/* Video Simulation Preview */}
        {isVideo && callStatus === 'connected' && (
          <div className="w-full my-4 h-48 bg-stone-950 rounded-2xl overflow-hidden relative border-2 border-stone-700">
            <img
              src={contact.photoUrl}
              alt="Video Feed"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-stone-950/80 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-800">
              HD Video Live
            </div>
          </div>
        )}

        {/* Call In-Progress Controls */}
        <div className="w-full space-y-4 mt-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl border transition-all ${
                isMuted
                  ? 'bg-rose-950 border-rose-600 text-rose-300'
                  : 'bg-stone-800 border-stone-700 text-stone-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-4 rounded-2xl border transition-all ${
                isSpeaker
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                  : 'bg-stone-800 border-stone-700 text-stone-200'
              }`}
              title="Speakerphone"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
          >
            <PhoneOff className="w-6 h-6" />
            <span>{language === 'hi' ? 'कॉल काटें (End Call)' : 'End Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
