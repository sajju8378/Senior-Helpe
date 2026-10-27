/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Mic,
  ShieldAlert,
  Pill,
  Sparkles,
  Users,
  ShieldCheck,
  Activity,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import {
  Language,
  TextScale,
  ThemeMode,
  ActiveRole,
  Reminder,
  MemoryNote,
  Contact,
  HealthLog,
  CaregiverSettings,
  UsabilityParticipant,
  AlertLogEntry,
  CheckInStatus,
} from './types';
import {
  initialReminders,
  initialMemories,
  initialContacts,
  initialHealthLogs,
  initialCaregiverSettings,
  initialParticipants,
  initialAlertLogs,
} from './data/mockData';
import { getTranslation } from './utils/translations';
import { playChime, playAlarm } from './utils/sound';
import { speakText, stopSpeech } from './utils/speech';

import { ElderHeader } from './components/ElderHeader';
import { ElderHome } from './components/ElderHome';
import { MedicineReminders } from './components/MedicineReminders';
import { MemoryAssistant } from './components/MemoryAssistant';
import { QuickContacts } from './components/QuickContacts';
import { ScamShield } from './components/ScamShield';
import { HealthLogging } from './components/HealthLogging';
import { CaregiverPortal } from './components/CaregiverPortal';
import { UsabilityTestLab } from './components/UsabilityTestLab';
import { SOSModal } from './components/SOSModal';
import { FallDetectionModal } from './components/FallDetectionModal';
import { ActiveReminderAlarm } from './components/ActiveReminderAlarm';
import { CallSimulationModal } from './components/CallSimulationModal';

export default function App() {
  // App accessibility & settings state
  const [language, setLanguage] = useState<Language>('en');
  const [textScale, setTextScale] = useState<TextScale>('normal');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark-amber');
  const [activeRole, setActiveRole] = useState<ActiveRole>('elder');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Elder View active sub-screen ('home' or individual dedicated views)
  const [activeElderTab, setActiveElderTab] = useState<
    'home' | 'reminders' | 'memory' | 'contacts' | 'safety' | 'health'
  >('home');

  // Core Data State
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [memories, setMemories] = useState<MemoryNote[]>(initialMemories);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(initialHealthLogs);
  const [caregiverSettings, setCaregiverSettings] = useState<CaregiverSettings>(
    initialCaregiverSettings
  );
  const [participants, setParticipants] = useState<UsabilityParticipant[]>(initialParticipants);
  const [alertLogs, setAlertLogs] = useState<AlertLogEntry[]>(initialAlertLogs);

  // Daily Check-in state
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>({
    date: 'Today',
    checkedIn: false,
    caregiverNotifiedForMiss: false,
  });

  // Modal / Overlay states
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isFallModalOpen, setIsFallModalOpen] = useState(false);
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<Reminder | null>(null);
  const [activeCall, setActiveCall] = useState<{ contact: Contact; isVideo: boolean } | null>(null);

  const t = getTranslation(language);

  // Next upcoming reminder
  const nextReminder = reminders.find((r) => !r.taken) || reminders[0] || null;

  // Apply theme and font size classes to root container
  const getThemeClasses = () => {
    switch (themeMode) {
      case 'contrast-black':
        return 'bg-black text-yellow-300';
      case 'warm-light':
        return 'bg-amber-50 text-stone-900';
      default:
        return 'bg-stone-950 text-stone-100';
    }
  };

  const getTextScaleClass = () => {
    switch (textScale) {
      case 'large':
        return 'text-[1.25rem] leading-relaxed'; // 26pt
      case 'huge':
        return 'text-[1.55rem] leading-loose'; // 32pt
      default:
        return 'text-[1.125rem] leading-normal'; // 20pt
    }
  };

  // Actions
  const handleConfirmTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, taken: true, takenAt: new Date().toLocaleTimeString() } : r))
    );
    if (activeAlarmReminder && activeAlarmReminder.id === id) {
      setActiveAlarmReminder(null);
    }
    playChime();
  };

  const handleSnooze = (id: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              snoozedUntil: Date.now() + minutes * 60000,
            }
          : r
      )
    );
    setActiveAlarmReminder(null);
  };

  const handleCheckIn = (mood: 'happy' | 'peaceful' | 'okay' | 'tired' | 'low') => {
    setCheckInStatus({
      date: 'Today',
      checkedIn: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood,
      caregiverNotifiedForMiss: false,
    });

    // Log check-in event
    setAlertLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: 'missed_checkin',
        title: 'Morning Check-in Recorded',
        details: `Elder confirmed "I'm Okay" with mood: ${mood}. Caregiver notified.`,
        status: 'resolved',
      },
      ...prev,
    ]);
  };

  const handleLogAlert = (
    type: 'sos' | 'fall' | 'missed_med' | 'missed_checkin' | 'scam_flagged',
    title: string,
    details: string
  ) => {
    setAlertLogs((prev) => [
      {
        id: `alert-${Date.now()}`,
        timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type,
        title,
        details,
        status: 'sent',
      },
      ...prev,
    ]);
  };

  const handleAddMemory = (newMem: Omit<MemoryNote, 'id' | 'date'>) => {
    const item: MemoryNote = {
      ...newMem,
      id: `mem-${Date.now()}`,
      date: 'Just now',
    };
    setMemories((prev) => [item, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddHealthLog = (newLog: Omit<HealthLog, 'id'>) => {
    const item: HealthLog = {
      ...newLog,
      id: `hl-${Date.now()}`,
    };
    setHealthLogs((prev) => [item, ...prev]);
  };

  const handleAddReminder = (
    newRem: Omit<Reminder, 'id' | 'taken' | 'escalationStage' | 'caregiverNotified'>
  ) => {
    const item: Reminder = {
      ...newRem,
      id: `rem-${Date.now()}`,
      taken: false,
      escalationStage: 'pending',
      caregiverNotified: false,
    };
    setReminders((prev) => [...prev, item]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateParticipant = (updated: UsabilityParticipant) => {
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Run test scenario from usability lab
  const handleRunTestTask = (task: 'reminder' | 'sos' | 'memory') => {
    setActiveRole('elder');
    if (task === 'reminder') {
      if (nextReminder) {
        setActiveAlarmReminder(nextReminder);
      }
    } else if (task === 'sos') {
      setIsSOSOpen(true);
    } else if (task === 'memory') {
      setActiveElderTab('memory');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${getThemeClasses()} ${getTextScaleClass()}`}
    >
      {/* Elder Top Header */}
      <ElderHeader
        language={language}
        onLanguageChange={setLanguage}
        textScale={textScale}
        onTextScaleChange={setTextScale}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onTriggerFallSim={() => setIsFallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-6 py-6 pb-28">
        {/* Sub-view Back Button in Elder Mode */}
        {activeRole === 'elder' && activeElderTab !== 'home' && (
          <div className="max-w-4xl mx-auto mb-4">
            <button
              onClick={() => {
                playChime();
                setActiveElderTab('home');
              }}
              className="py-3 px-5 bg-stone-900 hover:bg-stone-850 border-2 border-stone-700 text-stone-100 font-extrabold text-lg rounded-2xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 text-amber-400" />
              <span>{language === 'hi' ? '← मुख्य पृष्ठ (Home)' : '← Back to Home'}</span>
            </button>
          </div>
        )}

        {/* 1. ELDER VIEW */}
        {activeRole === 'elder' && (
          <>
            {activeElderTab === 'home' && (
              <ElderHome
                language={language}
                onOpenSOS={() => setIsSOSOpen(true)}
                nextReminder={nextReminder}
                onConfirmTaken={handleConfirmTaken}
                onTriggerAlarm={(rem) => setActiveAlarmReminder(rem)}
                checkInStatus={checkInStatus}
                onCheckIn={handleCheckIn}
                onNavigateTab={(tab) => {
                  playChime();
                  setActiveElderTab(tab);
                }}
                onOpenVoiceAssistant={() => {
                  playChime();
                  setActiveElderTab('memory');
                }}
                voiceEnabled={voiceEnabled}
              />
            )}

            {activeElderTab === 'reminders' && (
              <MedicineReminders
                reminders={reminders}
                onConfirmTaken={handleConfirmTaken}
                onSnooze={handleSnooze}
                onTriggerAlarm={(rem) => setActiveAlarmReminder(rem)}
                language={language}
                voiceEnabled={voiceEnabled}
              />
            )}

            {activeElderTab === 'memory' && (
              <MemoryAssistant
                memories={memories}
                onAddMemory={handleAddMemory}
                onDeleteMemory={handleDeleteMemory}
                language={language}
                voiceEnabled={voiceEnabled}
                caregiverSettings={caregiverSettings}
                onTriggerSOS={() => setIsSOSOpen(true)}
              />
            )}

            {activeElderTab === 'contacts' && (
              <QuickContacts
                contacts={contacts}
                onStartCall={(contact, isVideo) => setActiveCall({ contact, isVideo })}
                language={language}
              />
            )}

            {activeElderTab === 'safety' && (
              <ScamShield
                language={language}
                caregiverSettings={caregiverSettings}
                voiceEnabled={voiceEnabled}
              />
            )}

            {activeElderTab === 'health' && (
              <HealthLogging
                healthLogs={healthLogs}
                onAddLog={handleAddHealthLog}
                language={language}
                voiceEnabled={voiceEnabled}
              />
            )}
          </>
        )}

        {/* 2. CAREGIVER PORTAL */}
        {activeRole === 'caregiver' && (
          <CaregiverPortal
            settings={caregiverSettings}
            onUpdateSettings={(newSettings) =>
              setCaregiverSettings((prev) => ({ ...prev, ...newSettings }))
            }
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            alertLogs={alertLogs}
            language={language}
          />
        )}

        {/* 3. USABILITY TEST LAB */}
        {activeRole === 'usability-lab' && (
          <UsabilityTestLab
            participants={participants}
            onUpdateParticipant={handleUpdateParticipant}
            onRunTestTask={handleRunTestTask}
          />
        )}
      </main>

      {/* Persistent Bottom Bar for Elder (Always 1-tap Return, Voice & Emergency) */}
      {activeRole === 'elder' && (
        <nav
          className="fixed bottom-0 inset-x-0 z-40 bg-stone-950/95 border-t-2 border-stone-800 backdrop-blur-lg px-4 py-2.5 shadow-2xl"
          aria-label="Elder Core Navigation Bar"
        >
          <div className="max-w-lg mx-auto flex items-center justify-around gap-2">
            {/* 1-tap Home Return */}
            <button
              onClick={() => {
                playChime();
                setActiveElderTab('home');
              }}
              className={`flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                activeElderTab === 'home'
                  ? 'bg-amber-500 text-stone-950 shadow-lg'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900'
              }`}
            >
              <Home className="w-6 h-6 mb-0.5" />
              <span className="text-xs sm:text-sm">{t.home}</span>
            </button>

            {/* Talk to Mitra Button */}
            <button
              onClick={() => {
                playChime();
                setActiveElderTab('memory');
              }}
              className={`flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                activeElderTab === 'memory'
                  ? 'bg-amber-500 text-stone-950 shadow-lg'
                  : 'text-amber-400 hover:bg-stone-900'
              }`}
            >
              <Mic className="w-6 h-6 mb-0.5" />
              <span className="text-xs sm:text-sm">{t.speak}</span>
            </button>

            {/* High-Contrast Red SOS Button */}
            <button
              onClick={() => {
                playAlarm();
                setIsSOSOpen(true);
              }}
              className="flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center font-black bg-red-600 hover:bg-red-500 text-stone-950 shadow-lg border border-red-300 transition-all active:scale-95"
            >
              <ShieldAlert className="w-6 h-6 mb-0.5" />
              <span className="text-xs sm:text-sm font-black">SOS</span>
            </button>
          </div>
        </nav>
      )}

      {/* Emergency SOS Flow Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        caregiverSettings={caregiverSettings}
        language={language}
        voiceEnabled={voiceEnabled}
        onLogAlert={handleLogAlert}
      />

      {/* Fall Detection Modal with 30s Cancel Window */}
      <FallDetectionModal
        isOpen={isFallModalOpen}
        onClose={() => setIsFallModalOpen(false)}
        onTriggerSOS={() => setIsSOSOpen(true)}
        language={language}
        voiceEnabled={voiceEnabled}
        onLogAlert={handleLogAlert}
      />

      {/* Escalating Ringing Alarm Overlay */}
      <ActiveReminderAlarm
        reminder={activeAlarmReminder}
        onConfirmTaken={handleConfirmTaken}
        onSnooze={handleSnooze}
        onDismiss={() => setActiveAlarmReminder(null)}
        language={language}
        voiceEnabled={voiceEnabled}
        caregiverSettings={caregiverSettings}
        onLogAlert={handleLogAlert}
      />

      {/* Live Call Simulator Modal */}
      {activeCall && (
        <CallSimulationModal
          contact={activeCall.contact}
          isVideo={activeCall.isVideo}
          onClose={() => setActiveCall(null)}
          language={language}
        />
      )}
    </div>
  );
}
