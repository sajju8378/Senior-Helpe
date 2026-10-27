import React, { useState } from 'react';
import { Activity, Heart, Droplet, Plus, Calendar, AlertCircle, CheckCircle, Volume2 } from 'lucide-react';
import { HealthLog, Language } from '../types';
import { playChime } from '../utils/sound';
import { speakText } from '../utils/speech';

interface HealthLoggingProps {
  healthLogs: HealthLog[];
  onAddLog: (log: Omit<HealthLog, 'id'>) => void;
  language: Language;
  voiceEnabled: boolean;
}

export const HealthLogging: React.FC<HealthLoggingProps> = ({
  healthLogs,
  onAddLog,
  language,
  voiceEnabled,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<'bp' | 'sugar' | 'weight'>('bp');
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [sugarVal, setSugarVal] = useState('110');
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let value = '';
    let unit = '';
    let status: 'normal' | 'elevated' | 'attention' = 'normal';

    if (type === 'bp') {
      value = `${bpSys} / ${bpDia}`;
      unit = 'mmHg';
      const sys = parseInt(bpSys, 10);
      if (sys >= 140) status = 'elevated';
      else if (sys >= 160) status = 'attention';
    } else if (type === 'sugar') {
      value = sugarVal;
      unit = 'mg/dL';
      const s = parseInt(sugarVal, 10);
      if (s >= 140) status = 'elevated';
      else if (s >= 200) status = 'attention';
    }

    onAddLog({
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      value,
      unit,
      status,
      symptoms: symptoms.trim() || undefined,
    });

    playChime();
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'स्वास्थ्य रीडिंग डायरी में दर्ज कर ली गई है।'
          : 'Health reading recorded in your diary.',
        language
      );
    }

    setShowAdd(false);
    setSymptoms('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <Activity className="w-7 h-7" />
            <span>{language === 'hi' ? 'स्वास्थ्य डायरी' : 'Health Logs & Vitals'}</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-1">
            {language === 'hi'
              ? 'ब्लड प्रेशर और शुगर का सरल रिकॉर्ड, आपके डॉक्टर के लिए।'
              : 'Simple logging of blood pressure and sugar for your doctor visits.'}
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>{language === 'hi' ? 'नया माप दर्ज करें' : 'Log New Reading'}</span>
        </button>
      </div>

      {/* Add Entry Form */}
      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-stone-900 border-2 border-amber-500 rounded-3xl space-y-4 shadow-xl animate-in fade-in"
        >
          <h3 className="text-lg font-bold text-amber-400">
            {language === 'hi' ? 'रीडिंग दर्ज करें' : 'Record Vital Measurement'}
          </h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('bp')}
              className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                type === 'bp'
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-950 text-stone-300 border-stone-700'
              }`}
            >
              Blood Pressure (BP)
            </button>
            <button
              type="button"
              onClick={() => setType('sugar')}
              className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                type === 'sugar'
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-950 text-stone-300 border-stone-700'
              }`}
            >
              Blood Sugar
            </button>
          </div>

          {type === 'bp' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">
                  Systolic (Upper / ऊपर का)
                </label>
                <input
                  type="number"
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-xl font-mono font-bold text-stone-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">
                  Diastolic (Lower / नीचे का)
                </label>
                <input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(e.target.value)}
                  className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-xl font-mono font-bold text-stone-100"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">
                Glucose Level (mg/dL)
              </label>
              <input
                type="number"
                value={sugarVal}
                onChange={(e) => setSugarVal(e.target.value)}
                className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-xl font-mono font-bold text-stone-100"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-400 mb-1">
              Symptoms / कैसा महसूस हो रहा है? (वैकल्पिक)
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Mild tiredness or feeling energetic"
              className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-sm font-medium text-stone-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 text-stone-950 font-black rounded-xl text-sm shadow-md"
            >
              Save Reading
            </button>
          </div>
        </form>
      )}

      {/* History Cards */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-stone-100">
          {language === 'hi' ? 'हालिया माप' : 'Recent Measurements'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 bg-stone-900 border-2 border-stone-800 rounded-2xl flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-700 text-amber-400">
                    {log.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-stone-400">
                    {log.date} at {log.time}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-stone-100">
                    {log.value}
                  </span>
                  <span className="text-sm font-semibold text-stone-400">
                    {log.unit}
                  </span>
                </div>

                {log.symptoms && (
                  <p className="text-xs text-stone-300 italic">
                    Note: {log.symptoms}
                  </p>
                )}
              </div>

              <div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    log.status === 'normal'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
