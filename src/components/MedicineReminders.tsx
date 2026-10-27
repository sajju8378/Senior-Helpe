import React, { useState } from 'react';
import {
  Pill,
  CheckCircle,
  Clock,
  BellRing,
  Utensils,
  Plus,
  Volume2,
  Droplets,
  Footprints,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Reminder, Language, FoodInstruction } from '../types';
import { playChime, playAlarm } from '../utils/sound';
import { speakText } from '../utils/speech';

interface MedicineRemindersProps {
  reminders: Reminder[];
  onConfirmTaken: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onTriggerAlarm: (reminder: Reminder) => void;
  language: Language;
  voiceEnabled: boolean;
}

export const MedicineReminders: React.FC<MedicineRemindersProps> = ({
  reminders,
  onConfirmTaken,
  onSnooze,
  onTriggerAlarm,
  language,
  voiceEnabled,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken'>('all');

  const filteredReminders = reminders.filter((rem) => {
    if (filter === 'pending') return !rem.taken;
    if (filter === 'taken') return rem.taken;
    return true;
  });

  const getFoodBadge = (instruction: FoodInstruction) => {
    switch (instruction) {
      case 'after_meal':
        return {
          label: language === 'hi' ? 'नाश्ते / खाने के बाद' : 'After Breakfast / Meal',
          color: 'bg-blue-950/80 text-blue-300 border-blue-800',
        };
      case 'before_meal':
        return {
          label: language === 'hi' ? 'खाली पेट (खाने से पहले)' : 'Before Meal (Empty Stomach)',
          color: 'bg-purple-950/80 text-purple-300 border-purple-800',
        };
      case 'with_food':
        return {
          label: language === 'hi' ? 'भोजन या दूध के साथ' : 'With Food or Milk',
          color: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      default:
        return {
          label: language === 'hi' ? 'कभी भी पानी के साथ' : 'Anytime with Water',
          color: 'bg-stone-800 text-stone-300 border-stone-700',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-6 h-6 text-cyan-400" />;
      case 'walk':
        return <Footprints className="w-6 h-6 text-emerald-400" />;
      case 'appointment':
        return <Calendar className="w-6 h-6 text-purple-400" />;
      default:
        return <Pill className="w-6 h-6 text-amber-400" />;
    }
  };

  const handleReadAloud = (rem: Reminder) => {
    const title = language === 'hi' ? rem.titleHi || rem.title : rem.title;
    const dose = language === 'hi' ? rem.doseHi || rem.dose : rem.dose;
    const food = getFoodBadge(rem.foodInstruction).label;
    const msg =
      language === 'hi'
        ? `समय ${rem.time}: ${title}। खुराक: ${dose || ''}। निर्देश: ${food}।`
        : `At ${rem.time}: ${title}. Dose: ${dose || ''}. Instruction: ${food}.`;
    speakText(msg, language);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Filter Ribbon */}
      <div className="p-4 sm:p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <Pill className="w-7 h-7" />
            <span>{language === 'hi' ? 'दवाइयां और दैनिक स्मरण' : 'Medicines & Daily Reminders'}</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-1">
            {language === 'hi'
              ? 'समय पर आवाज़ और अलार्म के साथ याद दिलाया जाता है।'
              : 'Escalating alarms sound at scheduled time with food directions.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'सभी' : 'All'} ({reminders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'बाकी' : 'Pending'} ({reminders.filter((r) => !r.taken).length})
          </button>
          <button
            onClick={() => setFilter('taken')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'taken'
                ? 'bg-emerald-500 text-stone-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'ली जा चुकी' : 'Taken'} ({reminders.filter((r) => r.taken).length})
          </button>
        </div>
      </div>

      {/* Reminder Cards List */}
      <div className="space-y-4">
        {filteredReminders.map((rem) => {
          const title = language === 'hi' ? rem.titleHi || rem.title : rem.title;
          const dose = language === 'hi' ? rem.doseHi || rem.dose : rem.dose;
          const foodBadge = getFoodBadge(rem.foodInstruction);

          return (
            <div
              key={rem.id}
              className={`p-5 sm:p-6 rounded-3xl border-3 transition-all ${
                rem.taken
                  ? 'bg-stone-950/80 border-emerald-900/60 opacity-80'
                  : 'bg-stone-900 border-amber-500/50 shadow-xl'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl flex-shrink-0 border ${
                      rem.taken
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                        : 'bg-stone-950 border-stone-800 text-amber-400'
                    }`}
                  >
                    {getTypeIcon(rem.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-stone-950 border border-stone-700 text-amber-400 font-mono font-extrabold text-base rounded-xl">
                        {rem.time}
                      </span>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1 ${foodBadge.color}`}
                      >
                        <Utensils className="w-3 h-3" />
                        <span>{foodBadge.label}</span>
                      </span>

                      {rem.taken && (
                        <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'ले ली गई है' : 'Taken'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-stone-100">
                      {title}
                    </h3>

                    <p className="text-base sm:text-lg text-amber-300 font-semibold">
                      {dose}
                    </p>

                    {rem.notes && (
                      <p className="text-sm text-stone-400 italic">
                        "{rem.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Big Action Buttons */}
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                  {!rem.taken ? (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {/* TAKEN confirmation button */}
                      <button
                        onClick={() => {
                          playChime();
                          onConfirmTaken(rem.id);
                        }}
                        className="flex-1 sm:flex-initial py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span>{language === 'hi' ? 'दवाई ले ली' : 'TAKEN'}</span>
                      </button>

                      {/* Test Ring Alarm Button */}
                      <button
                        onClick={() => onTriggerAlarm(rem)}
                        className="py-3 px-3 bg-stone-800 hover:bg-amber-950 text-amber-300 border border-stone-700 rounded-2xl flex items-center gap-1.5 text-xs font-bold"
                        title="Simulate the escalating alarm for this medicine"
                      >
                        <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>Test Alarm</span>
                      </button>

                      {/* Audio read button */}
                      <button
                        onClick={() => handleReadAloud(rem)}
                        className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl"
                        title="Read reminder aloud"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-emerald-400 font-bold">
                        {language === 'hi' ? 'सुरक्षित रूप से दर्ज' : 'Recorded Taken'}
                      </span>
                      <button
                        onClick={() => onConfirmTaken(rem.id)}
                        className="text-xs text-stone-400 hover:text-stone-200 underline font-semibold"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
