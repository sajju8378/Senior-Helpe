import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  BellRing,
  Pill,
  Clock,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  History,
  Phone,
  Settings,
  Send,
} from 'lucide-react';
import { CaregiverSettings, Reminder, AlertLogEntry, Language, FoodInstruction } from '../types';
import { playChime } from '../utils/sound';

interface CaregiverPortalProps {
  settings: CaregiverSettings;
  onUpdateSettings: (newSettings: Partial<CaregiverSettings>) => void;
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'taken' | 'escalationStage' | 'caregiverNotified'>) => void;
  onDeleteReminder: (id: string) => void;
  alertLogs: AlertLogEntry[];
  language: Language;
}

export const CaregiverPortal: React.FC<CaregiverPortalProps> = ({
  settings,
  onUpdateSettings,
  reminders,
  onAddReminder,
  onDeleteReminder,
  alertLogs,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reminders' | 'alerts' | 'settings'>('overview');
  const [showAddMed, setShowAddMed] = useState(false);

  // New med form state
  const [title, setTitle] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [foodInstruction, setFoodInstruction] = useState<FoodInstruction>('after_meal');
  const [notes, setNotes] = useState('');

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title: title.trim(),
      titleHi: title.trim(),
      type: 'medicine',
      time,
      dose: dose.trim(),
      doseHi: dose.trim(),
      foodInstruction,
      notes: notes.trim() || undefined,
    });

    playChime();
    setTitle('');
    setDose('');
    setNotes('');
    setShowAddMed(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Caregiver Portal Hero Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 border-2 border-emerald-600/70 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500 text-stone-950 rounded-2xl shadow-lg">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
                Caregiver Companion Portal
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-600 font-bold">
                Remote Monitor
              </span>
            </div>
            <p className="text-sm text-stone-300 mt-1">
              Supervising: <strong className="text-stone-100">Ramesh K. (Father)</strong> • Primary Caregiver: <strong className="text-emerald-300">{settings.caregiverName}</strong>
            </p>
          </div>
        </div>

        {/* Elder Consent Badge */}
        <div className="flex items-center gap-2 p-3 bg-stone-950 border border-stone-800 rounded-2xl">
          {settings.elderConsentGranted ? (
            <div className="flex items-center gap-2 text-xs">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-300">Elder Consent Active</p>
                <p className="text-[11px] text-stone-400">Granted {settings.consentTimestamp}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Unlock className="w-4 h-4 text-rose-400" />
              <div>
                <p className="font-bold text-rose-300">Consent Revoked by Elder</p>
                <p className="text-[11px] text-stone-400">Remote alerts paused</p>
              </div>
            </div>
          )}
          <button
            onClick={() => onUpdateSettings({ elderConsentGranted: !settings.elderConsentGranted })}
            className="text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-bold ml-1"
          >
            {settings.elderConsentGranted ? 'Pause' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-900 border border-stone-800 rounded-2xl overflow-x-auto text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Live Status & Cutoff
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'reminders'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Manage Schedules ({reminders.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'alerts'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Alert Audit Log ({alertLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-emerald-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Safety Settings
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Daily Check-in Status */}
            <div className="p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Daily Check-in
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xl font-black text-emerald-400">Confirmed Today</h3>
              </div>
              <p className="text-xs text-stone-300">
                Elder tapped "I'm Okay" at 08:15 AM. Mood logged: "Peaceful & Calm".
              </p>
              <div className="text-[11px] text-amber-400 font-semibold pt-1">
                Cutoff Alert Trigger: {settings.checkInCutoffTime}
              </div>
            </div>

            {/* Medicine Compliance */}
            <div className="p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Dose Compliance
              </span>
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-black text-stone-100">
                  {reminders.filter((r) => r.taken).length} / {reminders.length} Taken
                </h3>
              </div>
              <p className="text-xs text-stone-300">
                Next dose due at {reminders.find((r) => !r.taken)?.time || 'All done today!'}
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                Escalation alerts active (+5m, +15m)
              </div>
            </div>

            {/* Emergency Readiness */}
            <div className="p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Emergency Readiness
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-black text-stone-100">Dialer: {settings.emergencyNumber}</h3>
              </div>
              <p className="text-xs text-stone-300">
                Target phone: {settings.caregiverPhone}
              </p>
              <div className="text-[11px] text-stone-400 pt-1">
                Fall detection: 30s cancellation window active
              </div>
            </div>
          </div>

          {/* Quick Simulation dispatch message */}
          <div className="p-5 bg-stone-900 border border-stone-800 rounded-3xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-stone-100 text-base">
                Send a Gentle Voice Note or Greeting
              </h4>
              <p className="text-xs text-stone-400">
                Will be read to Ramesh ji with Mitra's warm voice upon his next app open.
              </p>
            </div>
            <button
              onClick={() => alert('Message "Have a restful afternoon Papa, see you at 6 PM!" sent to elder device.')}
              className="px-4 py-2 bg-emerald-500 text-stone-950 font-bold rounded-xl text-xs sm:text-sm shadow-md"
            >
              Send Family Greeting
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Reminders Management */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-stone-100">
              Prescription & Reminder Schedule
            </h3>
            <button
              onClick={() => setShowAddMed(!showAddMed)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dose</span>
            </button>
          </div>

          {/* Add Medicine Form */}
          {showAddMed && (
            <form
              onSubmit={handleCreateMed}
              className="p-5 bg-stone-900 border-2 border-emerald-500 rounded-3xl space-y-4 animate-in fade-in"
            >
              <h4 className="font-bold text-emerald-400 text-base">
                Configure New Scheduled Reminder
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1">
                    Medicine / Task Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Amlodipine 5mg or Water"
                    className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1">
                    Dose & Instructions
                  </label>
                  <input
                    type="text"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    placeholder="e.g. 1 tablet with warm water"
                    className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1">
                    Food Relationship
                  </label>
                  <select
                    value={foodInstruction}
                    onChange={(e) => setFoodInstruction(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm font-semibold"
                  >
                    <option value="after_meal">After Meal (नाश्ते/खाने के बाद)</option>
                    <option value="before_meal">Before Meal (खाली पेट)</option>
                    <option value="with_food">With Food / Milk (दूध या खाने के साथ)</option>
                    <option value="anytime">Anytime (कभी भी)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">
                  Doctor's Instructions / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prescribed by Dr Mehta for 30 days"
                  className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddMed(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-stone-950 font-black rounded-xl text-sm shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          )}

          {/* Reminders List */}
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {rem.time}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                      {rem.foodInstruction.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-100 text-base">{rem.title}</h4>
                  <p className="text-xs text-stone-400">{rem.dose}</p>
                </div>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800"
                  title="Delete schedule"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Alerts Log */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <h3 className="text-xl font-black text-stone-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Escalation & Safety Event History</span>
          </h3>

          <div className="space-y-2.5">
            {alertLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                  log.type === 'sos' || log.type === 'fall'
                    ? 'bg-rose-950/40 border-rose-700 text-rose-100'
                    : 'bg-stone-900 border-stone-800 text-stone-200'
                }`}
              >
                <div className="p-2 bg-stone-950 rounded-xl mt-0.5">
                  <BellRing className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-base">{log.title}</h4>
                    <span className="text-xs font-mono text-stone-400">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-stone-300">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Safety Settings */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-5">
          <h3 className="text-xl font-black text-stone-100">
            Escalation & Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <div>
                <p className="font-bold text-stone-100 text-sm">
                  Receive Escalated Unconfirmed Dose Alerts (+15 min)
                </p>
                <p className="text-xs text-stone-400">
                  Sends SMS/Push if elder hasn't confirmed medicine after two gentle repeats.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.receiveEscalatedAlarms}
                onChange={(e) => onUpdateSettings({ receiveEscalatedAlarms: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <div>
                <p className="font-bold text-stone-100 text-sm">
                  Receive Emergency SOS with GPS Location
                </p>
                <p className="text-xs text-stone-400">
                  Immediate SMS dispatch if elder taps SOS or falls without cancelling.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.receiveSOSAlerts}
                onChange={(e) => onUpdateSettings({ receiveSOSAlerts: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <div>
                <p className="font-bold text-stone-100 text-sm">
                  Daily Check-in Cutoff Time
                </p>
                <p className="text-xs text-stone-400">
                  Caregiver is alerted if elder hasn't checked in by this time.
                </p>
              </div>
              <input
                type="text"
                value={settings.checkInCutoffTime}
                onChange={(e) => onUpdateSettings({ checkInCutoffTime: e.target.value })}
                className="p-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm font-mono w-28 text-center"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <div>
                <p className="font-bold text-stone-100 text-sm">
                  Local Emergency Dialer Target
                </p>
                <p className="text-xs text-stone-400">
                  112 (India / EU), 911 (US / Canada), 999 (UK).
                </p>
              </div>
              <select
                value={settings.emergencyNumber}
                onChange={(e) => onUpdateSettings({ emergencyNumber: e.target.value })}
                className="p-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm font-mono"
              >
                <option value="112">112 (India / EU)</option>
                <option value="911">911 (US / Canada)</option>
                <option value="999">999 (UK)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
