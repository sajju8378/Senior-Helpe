export type Language = 'en' | 'hi';

export type TextScale = 'normal' | 'large' | 'huge'; // 100%, 130%, 160%

export type ThemeMode = 'dark-amber' | 'contrast-black' | 'warm-light';

export type ActiveRole = 'elder' | 'caregiver' | 'usability-lab';

export type ReminderType = 'medicine' | 'water' | 'walk' | 'appointment' | 'prayer' | 'bill' | 'custom';

export type FoodInstruction = 'after_meal' | 'before_meal' | 'with_food' | 'anytime';

export type EscalationStage = 'pending' | 'due' | 'escalated_5m' | 'escalated_15m' | 'caregiver_alerted';

export interface Reminder {
  id: string;
  title: string;
  titleHi: string;
  type: ReminderType;
  time: string; // "08:30 AM"
  dose?: string;
  doseHi?: string;
  foodInstruction: FoodInstruction;
  taken: boolean;
  takenAt?: string;
  escalationStage: EscalationStage;
  snoozedUntil?: number; // timestamp
  caregiverNotified: boolean;
  notes?: string;
}

export type MemoryCategory = 'location' | 'medical' | 'family' | 'keys' | 'general';

export interface MemoryNote {
  id: string;
  category: MemoryCategory;
  title: string;
  titleHi: string;
  text: string;
  textHi: string;
  date: string;
  pinned?: boolean;
}

export interface CheckInStatus {
  date: string;
  checkedIn: boolean;
  time?: string;
  mood?: 'happy' | 'peaceful' | 'okay' | 'tired' | 'low';
  note?: string;
  caregiverNotifiedForMiss: boolean;
}

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  relationshipHi: string;
  phone: string;
  photoUrl: string;
  isEmergency: boolean;
  notes?: string;
}

export interface HealthLog {
  id: string;
  date: string;
  time: string;
  type: 'bp' | 'sugar' | 'weight' | 'walk';
  value: string;
  unit: string;
  status: 'normal' | 'elevated' | 'attention';
  symptoms?: string;
}

export interface CaregiverSettings {
  caregiverName: string;
  caregiverPhone: string;
  relationship: string;
  elderConsentGranted: boolean;
  consentTimestamp: string;
  receiveEscalatedAlarms: boolean;
  receiveSOSAlerts: boolean;
  receiveMissedCheckInAlerts: boolean;
  receiveFallAlerts: boolean;
  emergencyNumber: string; // '112' | '911' | '999'
  checkInCutoffTime: string; // e.g. "10:30 AM"
  fallDetectionSensitivity: 'medium' | 'high';
}

export interface UsabilityParticipant {
  id: string;
  name: string;
  age: number;
  profile: string;
  profileKey: 'independent' | 'cognitive_decline' | 'vision_loss' | 'dexterity_tremor' | 'isolated' | 'caregiver_supported';
  notes: string;
  tasksCompleted: {
    reminderConfirmation: boolean;
    emergencySOS: boolean;
    memoryRetrieval: boolean;
  };
  durationSeconds: {
    reminderConfirmation?: number;
    emergencySOS?: number;
    memoryRetrieval?: number;
  };
  feedback?: string;
}

export interface AlertLogEntry {
  id: string;
  timestamp: string;
  type: 'sos' | 'fall' | 'missed_med' | 'missed_checkin' | 'scam_flagged';
  title: string;
  details: string;
  status: 'sent' | 'acknowledged' | 'resolved';
}
