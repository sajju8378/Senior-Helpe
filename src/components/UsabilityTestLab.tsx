import React, { useState } from 'react';
import {
  ClipboardCheck,
  UserCheck,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Pill,
  ShieldAlert,
  HelpCircle,
  Eye,
  Award,
} from 'lucide-react';
import { UsabilityParticipant } from '../types';
import { playChime } from '../utils/sound';

interface UsabilityTestLabProps {
  participants: UsabilityParticipant[];
  onUpdateParticipant: (updated: UsabilityParticipant) => void;
  onRunTestTask: (task: 'reminder' | 'sos' | 'memory') => void;
}

export const UsabilityTestLab: React.FC<UsabilityTestLabProps> = ({
  participants,
  onUpdateParticipant,
  onRunTestTask,
}) => {
  const [selectedId, setSelectedId] = useState<string>(participants[0]?.id || '');
  const [activeTaskTimer, setActiveTaskTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const current = participants.find((p) => p.id === selectedId) || participants[0];

  const handleToggleTask = (taskKey: 'reminderConfirmation' | 'emergencySOS' | 'memoryRetrieval') => {
    if (!current) return;
    const updated = {
      ...current,
      tasksCompleted: {
        ...current.tasksCompleted,
        [taskKey]: !current.tasksCompleted[taskKey],
      },
    };
    playChime();
    onUpdateParticipant(updated);
  };

  const handleUpdateFeedback = (text: string) => {
    if (!current) return;
    onUpdateParticipant({
      ...current,
      feedback: text,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-cyan-950 via-stone-900 to-stone-900 border-2 border-cyan-500/70 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-cyan-500 text-stone-950 rounded-2xl shadow-lg">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-cyan-400">
              Elder Usability Testing Lab
            </h2>
            <p className="text-sm text-stone-300 mt-1">
              Live Evaluation Protocol with 5 Senior Citizen Profiles across 3 Core Flows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-300">
          <Award className="w-5 h-5 text-amber-400" />
          <span>WCAG AAA Contrast • 64dp Targets • Zero Pill Menus</span>
        </div>
      </div>

      {/* Participant Selector Tabs (5 Profiles as required by Brief) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {participants.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              playChime();
              setSelectedId(p.id);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all ${
              p.id === selectedId
                ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <p className="font-extrabold text-sm">{p.name}</p>
            <p className="text-[11px] text-cyan-300/80 truncate mt-0.5">{p.profile}</p>
            <div className="flex gap-1 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  p.tasksCompleted.reminderConfirmation ? 'bg-emerald-400' : 'bg-stone-700'
                }`}
                title="Reminder Task"
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  p.tasksCompleted.emergencySOS ? 'bg-emerald-400' : 'bg-stone-700'
                }`}
                title="SOS Task"
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  p.tasksCompleted.memoryRetrieval ? 'bg-emerald-400' : 'bg-stone-700'
                }`}
                title="Memory Task"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Selected Participant Profile Details Card */}
      {current && (
        <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-800">
            <div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Active Test Participant #{current.id.toUpperCase()}
              </span>
              <h3 className="text-2xl font-black text-stone-100 mt-2">
                {current.name} • {current.profile}
              </h3>
              <p className="text-sm text-stone-300 mt-1">{current.notes}</p>
            </div>
          </div>

          {/* 3 Core Usability Test Tasks with Launchers */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-stone-200">
              Interactive Test Tasks (Click "Run Scenario" to simulate on live UI):
            </h4>

            {/* Task 1: Reminder Confirmation */}
            <div className="p-4 bg-stone-950 border-2 border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-amber-400" />
                  <h5 className="font-extrabold text-base text-stone-100">
                    Task 1: Medicine Reminder Confirmation Flow
                  </h5>
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  Scenario: Escalating alarm sounds for Blood Pressure tablet. Participant must hear spoken voice, read food instruction, and tap TAKEN.
                </p>
                <div className="text-xs text-amber-400 font-mono">
                  Recorded duration: {current.durationSeconds.reminderConfirmation || 12}s
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRunTestTask('reminder')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Scenario</span>
                </button>
                <button
                  onClick={() => handleToggleTask('reminderConfirmation')}
                  className={`p-2 rounded-xl border ${
                    current.tasksCompleted.reminderConfirmation
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-stone-900 text-stone-500 border-stone-700'
                  }`}
                  title="Mark Task Passed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Task 2: Emergency SOS Flow */}
            <div className="p-4 bg-stone-950 border-2 border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h5 className="font-extrabold text-base text-stone-100">
                    Task 2: One-Touch SOS & Cancellation Window
                  </h5>
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  Scenario: Participant triggers emergency SOS, examines the 5-second countdown safety cancel window, and verifies emergency dialer.
                </p>
                <div className="text-xs text-rose-400 font-mono">
                  Recorded duration: {current.durationSeconds.emergencySOS || 8}s
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRunTestTask('sos')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Scenario</span>
                </button>
                <button
                  onClick={() => handleToggleTask('emergencySOS')}
                  className={`p-2 rounded-xl border ${
                    current.tasksCompleted.emergencySOS
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-stone-900 text-stone-500 border-stone-700'
                  }`}
                  title="Mark Task Passed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Task 3: Memory Retrieval */}
            <div className="p-4 bg-stone-950 border-2 border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h5 className="font-extrabold text-base text-stone-100">
                    Task 3: Voice Memory Retrieval ("Where are my glasses?")
                  </h5>
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  Scenario: Participant asks Mitra where they kept their glasses or spare key. Assistant restates calmly without judgment or impatience.
                </p>
                <div className="text-xs text-cyan-400 font-mono">
                  Recorded duration: {current.durationSeconds.memoryRetrieval || 14}s
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRunTestTask('memory')}
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Scenario</span>
                </button>
                <button
                  onClick={() => handleToggleTask('memoryRetrieval')}
                  className={`p-2 rounded-xl border ${
                    current.tasksCompleted.memoryRetrieval
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-stone-900 text-stone-500 border-stone-700'
                  }`}
                  title="Mark Task Passed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Qualitative Observation & Participant Feedback */}
          <div>
            <label className="block text-xs font-bold text-stone-400 mb-1.5">
              Participant Observation Notes & Usability Feedback:
            </label>
            <textarea
              rows={3}
              value={current.feedback || ''}
              onChange={(e) => handleUpdateFeedback(e.target.value)}
              className="w-full p-3.5 bg-stone-950 border border-stone-700 rounded-2xl text-stone-200 text-sm font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};
