// Web Audio API synthesizer for guaranteed offline accessibility sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Gentle warm two-tone chime for positive confirmations ("Taken", "Memory Saved", "I'm OK")
 */
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(523.25, now); // C5
  osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.4);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.8);

  vibrateDevice([60, 40, 60]);
}

/**
 * Distinct two-tone alarm for due medicine reminders
 */
export function playAlarm() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now); // A4
  osc.frequency.setValueAtTime(554.37, now + 0.2); // C#5
  osc.frequency.setValueAtTime(440, now + 0.4);
  osc.frequency.setValueAtTime(554.37, now + 0.6);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.9);

  vibrateDevice([150, 80, 150]);
}

/**
 * Loud urgent siren pulse for SOS & Fall Detection countdown
 */
export function playSosBeep(urgent = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = urgent ? 'sawtooth' : 'square';
  osc.frequency.setValueAtTime(urgent ? 880 : 700, now);
  osc.frequency.exponentialRampToValueAtTime(urgent ? 1100 : 850, now + 0.25);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);

  vibrateDevice(urgent ? [300, 100, 300] : [200]);
}

/**
 * Haptic tremor feedback
 */
export function vibrateDevice(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration error on unsupported devices
    }
  }
}
