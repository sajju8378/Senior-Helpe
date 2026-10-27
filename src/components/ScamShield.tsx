import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, PhoneCall, CheckCircle, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { Language, CaregiverSettings } from '../types';
import { playChime, playAlarm } from '../utils/sound';
import { speakText } from '../utils/speech';

interface ScamShieldProps {
  language: Language;
  caregiverSettings: CaregiverSettings;
  voiceEnabled: boolean;
}

export const ScamShield: React.FC<ScamShieldProps> = ({
  language,
  caregiverSettings,
  voiceEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const sampleScams = [
    {
      label: '⚡ Electricity Cut-off SMS',
      labelHi: '⚡ बिजली बिल कटने का फर्जी संदेश',
      text: 'Dear customer, your electricity bill is unpaid. Power will be disconnected tonight at 9:30 PM. Call officer urgently at 9876543210 to update and pay ₹250.',
    },
    {
      label: '🎁 Lottery / Prize Winner',
      labelHi: '🎁 लॉटरी जीतने का झांसा',
      text: 'Congratulations! Your mobile number won 25 Lakhs in Kaun Banega Crorepati. Please share your bank account number and OTP with manager immediately.',
    },
    {
      label: '🏦 Bank Account Block Alert',
      labelHi: '🏦 बैंक खाता बंद होने का फर्जी डर',
      text: 'Urgent: Your SBI Bank account KYC is expired. Your debit card is blocked. Download this APK app and enter 6-digit OTP to unblock now.',
    },
  ];

  const handleCheck = async (textToCheck?: string) => {
    const query = (textToCheck || inputText).trim();
    if (!query) return;

    setIsChecking(true);
    setResult(null);

    try {
      const res = await fetch('/api/companion/scam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, language }),
      });
      const data = await res.json();
      setResult(data);

      if (data.verdict === 'SCAM' || data.riskLevel === 'high') {
        playAlarm();
        if (voiceEnabled) {
          speakText(
            language === 'hi'
              ? 'सावधान! यह एक फर्जी संदेश या धोखा हो सकता है। कोई भी ओटीपी या बैंक विवरण साझा न करें।'
              : 'Caution! This appears to be a fraudulent scam. Never share any OTP or bank details.',
            language
          );
        }
      } else {
        playChime();
      }
    } catch (e) {
      console.error(e);
      setResult({
        verdict: 'SCAM',
        riskLevel: 'high',
        explanation: 'Any message creating false urgency about power, bank accounts, or lottery is usually a scam.',
        actionAdvice: 'Do not click any link or send money. Please call your family first.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7" />
            <span>{language === 'hi' ? 'सुरक्षा व धोखाधड़ी से बचाव (Scam Shield)' : 'Safety & Scam Protection Shield'}</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-1">
            {language === 'hi'
              ? 'किसी भी अनजान कॉल, लॉटरी या ओटीपी मांगने वाले संदेश की तुरंत जांच करें।'
              : 'Verify suspicious phone calls, bank warnings, and urgent OTP messages.'}
          </p>
        </div>
      </div>

      {/* Verified Senior Helplines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-stone-900 border-2 border-stone-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400">Senior Citizen Helpline</p>
            <p className="text-2xl font-black text-amber-400 font-mono">14567</p>
            <p className="text-xs text-stone-300">Elder Line (Free 8AM - 8PM)</p>
          </div>
          <a
            href="tel:14567"
            className="p-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl"
            title="Call Elder Line"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>

        <div className="p-4 bg-stone-900 border-2 border-stone-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400">Cyber Fraud Helpline</p>
            <p className="text-2xl font-black text-rose-400 font-mono">1930</p>
            <p className="text-xs text-stone-300">National Financial Fraud</p>
          </div>
          <a
            href="tel:1930"
            className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
            title="Call Cyber Fraud Helpline"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>

        <div className="p-4 bg-stone-900 border-2 border-stone-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400">National Emergency</p>
            <p className="text-2xl font-black text-emerald-400 font-mono">112</p>
            <p className="text-xs text-stone-300">Police / Ambulance 24x7</p>
          </div>
          <a
            href="tel:112"
            className="p-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl"
            title="Call 112"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Interactive Scam Check Tester */}
      <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-4">
        <h3 className="text-xl font-bold text-stone-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span>{language === 'hi' ? 'संदेहास्पद संदेश की जांच करें' : 'Check a Suspicious Message or Call'}</span>
        </h3>

        {/* Quick Sample Buttons */}
        <div>
          <p className="text-xs font-bold text-stone-400 mb-2">
            {language === 'hi' ? 'उदाहरण टेस्ट करें:' : 'Try an example scam message:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleScams.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(s.text);
                  handleCheck(s.text);
                }}
                className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              >
                {language === 'hi' ? s.labelHi : s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'संदेश को यहाँ पेस्ट करें या जो फोन पर कहा गया वह लिखें...'
              : 'Paste the SMS or message you received, or type what the caller said...'
          }
          className="w-full p-4 bg-stone-950 border-2 border-stone-700 focus:border-amber-500 rounded-2xl text-stone-100 text-base sm:text-lg font-medium outline-none"
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleCheck()}
            disabled={!inputText.trim() || isChecking}
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-lg rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            {isChecking ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6" />
                <span>{language === 'hi' ? 'सुरक्षा जांचें' : 'Check Safety'}</span>
              </>
            )}
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div
            className={`p-5 rounded-2xl border-3 mt-4 space-y-3 ${
              result.verdict === 'SCAM' || result.riskLevel === 'high'
                ? 'bg-rose-950/80 border-rose-500 text-rose-100'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.verdict === 'SCAM' ? (
                <ShieldAlert className="w-8 h-8 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <span className="text-xs uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full bg-stone-950/80 border">
                  Verdict: {result.verdict} ({result.riskLevel} Risk)
                </span>
                <h4 className="text-xl font-black mt-1">
                  {result.verdict === 'SCAM'
                    ? language === 'hi'
                      ? '🚨 सावधान! यह धोखाधड़ी (स्कैम) है।'
                      : '🚨 WARNING: High Risk Scam Detected'
                    : '✅ Message Appears Legitimate'}
                </h4>
              </div>
            </div>

            <p className="text-base sm:text-lg font-medium">
              {result.explanation}
            </p>

            <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-amber-300 font-bold text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <span>Recommended Action: {result.actionAdvice}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href={`tel:${caregiverSettings.caregiverPhone}`}
                className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-100 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <span>Call Caregiver Priya to Verify</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
