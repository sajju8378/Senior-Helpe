import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  Key,
  Glasses,
  Stethoscope,
  Heart,
  Plus,
  Trash2,
  Bookmark,
  ShieldAlert,
  HelpCircle,
  X,
} from 'lucide-react';
import { MemoryNote, Language, CaregiverSettings } from '../types';
import { playChime, playAlarm } from '../utils/sound';
import { speakText, stopSpeech, isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech';

interface MemoryAssistantProps {
  memories: MemoryNote[];
  onAddMemory: (memory: Omit<MemoryNote, 'id' | 'date'>) => void;
  onDeleteMemory: (id: string) => void;
  language: Language;
  voiceEnabled: boolean;
  caregiverSettings: CaregiverSettings;
  onTriggerSOS: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isEmergency?: boolean;
  isScamWarning?: boolean;
  isMedicalQuery?: boolean;
  savedMemoryBadge?: string;
}

export const MemoryAssistant: React.FC<MemoryAssistantProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  language,
  voiceEnabled,
  caregiverSettings,
  onTriggerSOS,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं आपकी साथी मित्र हूँ। आप मुझसे कुछ भी याद रखने के लिए कह सकते हैं, या पूछ सकते हैं जैसे: "मेरा चश्मा कहाँ है?"'
          : "Hello! I am Mitra, your caring companion. You can ask me where you kept things, what the doctor advised, or ask me to remember something new.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'location' | 'keys' | 'medical' | 'family' | 'general'>('location');

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not available in this browser. Please type your message.');
      return;
    }

    playChime();
    setIsListening(true);

    const recognizer = createSpeechRecognizer(
      language,
      (transcript) => {
        setInput(transcript);
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    setInput('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language,
          savedMemories: memories,
          emergencyNumber: caregiverSettings.emergencyNumber,
        }),
      });

      const data = await response.json();

      const assistantMsg: Message = {
        sender: 'assistant',
        text: data.reply,
        isEmergency: data.isEmergency,
        isScamWarning: data.isScamWarning,
        isMedicalQuery: data.isMedicalQuery,
      };

      // Check if new memory was detected & saved
      if (data.newMemory && data.newMemory.text) {
        onAddMemory({
          category: data.newMemory.category || 'general',
          title: data.newMemory.title || 'Saved Note',
          titleHi: 'याद रखा गया नोट',
          text: data.newMemory.text,
          textHi: data.newMemory.text,
          pinned: true,
        });
        assistantMsg.savedMemoryBadge = data.newMemory.text;
      }

      setMessages((prev) => [...prev, assistantMsg]);

      // Voice output
      if (voiceEnabled && data.reply) {
        speakText(data.reply, language);
      }

      if (data.isEmergency) {
        playAlarm();
      } else {
        playChime();
      }
    } catch (error) {
      console.error('Companion chat error:', error);
      const fallbackReply =
        language === 'hi'
          ? 'मैं आपकी बात समझ रही हूँ। कृपया दोबारा कहें।'
          : "I hear you. Please say it again, I am listening.";
      setMessages((prev) => [...prev, { sender: 'assistant', text: fallbackReply }]);
      if (voiceEnabled) speakText(fallbackReply, language);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    onAddMemory({
      category: newCategory,
      title: newTitle.trim() || 'Custom Note',
      titleHi: newTitle.trim() || 'कस्टम नोट',
      text: newText.trim(),
      textHi: newText.trim(),
      pinned: true,
    });

    playChime();
    if (voiceEnabled) {
      speakText(
        language === 'hi'
          ? 'नया नोट सुरक्षित रूप से सहेज लिया गया है।'
          : 'Your new memory note has been safely saved.',
        language
      );
    }

    setNewTitle('');
    setNewText('');
    setShowAddForm(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'keys':
        return <Key className="w-5 h-5 text-amber-400" />;
      case 'location':
        return <Glasses className="w-5 h-5 text-cyan-400" />;
      case 'medical':
        return <Stethoscope className="w-5 h-5 text-emerald-400" />;
      case 'family':
        return <Heart className="w-5 h-5 text-rose-400" />;
      default:
        return <Bookmark className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-400" />
            <span>{language === 'hi' ? 'याददाश्त सहायक व साथी' : 'Memory Vault & Voice Assistant'}</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-1">
            {language === 'hi'
              ? 'बिना किसी संकोच के कुछ भी पूछें। हम कभी दोबारा पूछने पर बुरा नहीं मानते।'
              : 'Ask anything without hesitation. Repetition is welcomed and never judged.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>{language === 'hi' ? 'नया नोट जोड़ें' : 'Save New Note'}</span>
        </button>
      </div>

      {/* Manual Memory Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleManualAdd}
          className="p-5 bg-stone-900 border-2 border-amber-500 rounded-3xl shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-amber-400">
              {language === 'hi' ? 'नई जानकारी सहेजें' : 'Save A Memory Note'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">
                Category / प्रकार
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-semibold text-sm"
              >
                <option value="location">Glasses / Items Location</option>
                <option value="keys">Keys & Lockers</option>
                <option value="medical">Doctor & Medical Instructions</option>
                <option value="family">Family & Birthdays</option>
                <option value="general">General Memory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">
                Title / शीर्षक
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Spare key or Dr Mehta visit"
                className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-semibold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 mb-1">
              Memory Detail / क्या याद रखना है?
            </label>
            <textarea
              rows={2}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Reading glasses are placed in the top drawer beside the bed..."
              className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm font-medium"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl text-sm shadow-md"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Interactive Conversation Box */}
      <div className="bg-stone-900 border-2 border-stone-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col h-[460px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-base sm:text-lg leading-relaxed font-medium shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-stone-950 font-bold rounded-br-none'
                    : msg.isEmergency
                    ? 'bg-red-950 border-2 border-red-500 text-red-100 rounded-bl-none'
                    : 'bg-stone-950 border-2 border-stone-800 text-stone-100 rounded-bl-none'
                }`}
              >
                {msg.text}

                {/* Emergency Call-out in message */}
                {msg.isEmergency && (
                  <div className="mt-3 pt-3 border-t border-red-700">
                    <button
                      onClick={onTriggerSOS}
                      className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-stone-950 font-black rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      <span>{language === 'hi' ? 'तुरंत SOS दबाएं' : 'PRESS SOS NOW'}</span>
                    </button>
                  </div>
                )}

                {/* Scam warning banner */}
                {msg.isScamWarning && (
                  <div className="mt-2 text-xs sm:text-sm p-2.5 bg-amber-950/80 border border-amber-600 rounded-xl text-amber-200">
                    🛡️ <strong>Safety Notice:</strong> Never share passwords, bank OTPs, or send money under pressure.
                  </div>
                )}

                {/* Saved memory badge */}
                {msg.savedMemoryBadge && (
                  <div className="mt-2 text-xs sm:text-sm p-2 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-300 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 flex-shrink-0" />
                    <span>Saved to your Memory Vault!</span>
                  </div>
                )}
              </div>

              {/* Speaker button to repeat audio aloud */}
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => speakText(msg.text, language)}
                  className="mt-1 text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 px-2 py-0.5"
                  title="Read aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'दोबारा सुनें' : 'Listen again'}</span>
                </button>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-amber-400 font-bold p-3 bg-stone-950 rounded-2xl w-fit">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>{language === 'hi' ? 'मित्र सोच रही है...' : 'Mitra is thinking...'}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick prompt suggestions for seniors */}
        <div className="pt-3 pb-2 border-t border-stone-800 flex flex-wrap gap-2 text-xs sm:text-sm">
          <span className="text-stone-400 font-semibold self-center mr-1">
            {language === 'hi' ? 'सुझाव:' : 'Quick Prompts:'}
          </span>
          <button
            onClick={() =>
              handleSendMessage(
                language === 'hi' ? 'मेरा चश्मा कहाँ रखा है?' : 'Where did I put my reading glasses?'
              )
            }
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-full font-semibold transition-colors"
          >
            👓 {language === 'hi' ? 'चश्मा कहाँ है?' : 'Where are my glasses?'}
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                language === 'hi'
                  ? 'घर की चाबी किसके पास है?'
                  : 'Where is the spare house key?'
              )
            }
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-full font-semibold transition-colors"
          >
            🔑 {language === 'hi' ? 'चाबी किसके पास है?' : 'Where is spare key?'}
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                language === 'hi'
                  ? 'डॉक्टर मेहता ने क्या सलाह दी थी?'
                  : 'What did Dr. Mehta advise about my health?'
              )
            }
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-full font-semibold transition-colors"
          >
            🩺 {language === 'hi' ? 'डॉक्टर की सलाह' : "Doctor's advice"}
          </button>
        </div>

        {/* Speech & Text Input Area */}
        <div className="flex items-center gap-2 pt-2">
          {/* Giant Mic Button */}
          <button
            onClick={toggleListening}
            className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Listening... click to stop' : 'Tap to speak'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              isListening
                ? language === 'hi'
                  ? 'बोलिए, मैं सुन रही हूँ...'
                  : 'Listening... speak clearly...'
                : language === 'hi'
                ? 'यहाँ लिखें या माइक दबाएं...'
                : 'Type here or tap microphone to speak...'
            }
            className="flex-1 p-3.5 sm:p-4 bg-stone-950 border-2 border-stone-700 focus:border-amber-500 rounded-2xl text-stone-100 text-base sm:text-lg font-medium placeholder:text-stone-500 outline-none"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
            className="p-4 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-100 rounded-2xl transition-all disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Currently Saved Memory Cards */}
      <div className="space-y-3">
        <h3 className="text-xl font-extrabold text-stone-100 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-400" />
          <span>
            {language === 'hi' ? 'सहेजी गई यादें और नोट्स' : 'Saved Memory Vault (On Device)'}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold">
            {memories.length} notes
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memories.map((note) => {
            const displayTitle = language === 'hi' ? note.titleHi || note.title : note.title;
            const displayText = language === 'hi' ? note.textHi || note.text : note.text;

            return (
              <div
                key={note.id}
                className="p-4 sm:p-5 bg-stone-900 border-2 border-stone-800 rounded-2xl hover:border-amber-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-stone-950 rounded-xl border border-stone-800">
                        {getCategoryIcon(note.category)}
                      </div>
                      <span className="font-extrabold text-base text-stone-100">
                        {displayTitle}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteMemory(note.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors opacity-70 group-hover:opacity-100"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
                    {displayText}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span>{note.date}</span>
                  <button
                    onClick={() => speakText(displayText, language)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सुनें' : 'Read Out'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
