// Browser Speech Synthesis (TTS) & Web Speech API Recognition

export function speakText(text: string, lang: 'en' | 'hi' = 'en', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
  utterance.rate = 0.9; // Slightly slower, measured cadence for seniors
  utterance.pitch = 1.0;

  // Try to find a warm, natural voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) =>
    lang === 'hi'
      ? v.lang.startsWith('hi') || v.name.includes('Hindi')
      : (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Check speech recognition capability
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function createSpeechRecognizer(
  lang: 'en' | 'hi',
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd?: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition not supported in this browser');
    return null;
  }

  const SpeechRecClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    const current = finalTranscript || interim;
    if (current) {
      onResult(current);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition event:', event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
