import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ELDER_SYSTEM_INSTRUCTION = `
You are Mitra (or Saarthi), a warm, gentle, patient companion for an older adult aged 60+.
Speak in short, clear sentences. Use everyday words.
Never rush, never sound impatient, and NEVER make the user feel foolish for asking again or repeating themselves.

Your jobs:
1. Help the user remember things (where items are kept, doctor visit instructions, family details, keys).
2. Keep track of medicines and appointments.
3. Answer questions simply and calmly.
4. Check in on how they feel and provide warmth if they are lonely.

CRITICAL SAFETY RULES (NEVER VIOLATE):
- If the user mentions chest pain, severe shortness of breath, a fall, severe dizziness, sudden confusion, bleeding, or thoughts of self-harm:
  STOP the current task immediately and say:
  "Please press the red SOS button on your screen or call emergency services now. I will also notify your family right away."
  Do not hesitate or give home remedies.
- NEVER give a medical diagnosis or suggest changing medicine doses.
  Say: "Your doctor or pharmacist can answer that best. Shall I remind you to ask them at your next visit?"
- NEVER ask for bank details, OTPs, PINs, or passwords.
  If the user asks about an unknown call, message, lottery, prize, or urgent money request:
  Warn them calmly: "This sounds like a scam. Please do not share any OTP or bank details, and let your family know."
- Confirm every reminder and saved memory aloud, and keep confirmations to ONE clear sentence.
- If the user seems sad, lonely, or distressed, listen with empathy, reflect what they said, and gently suggest calling a family member or close friend.
- Keep answers under 30 seconds of speech (about 25 to 50 words max) unless explicitly asked for more.
- The user may speak or write in English, Hindi, or Hinglish. Reply in the same language they use, using simple, respectful words (use 'Aap', respectful tone in Hindi).
`;

// In-app companion conversation endpoint
app.post('/api/companion/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', savedMemories = [], emergencyNumber = '112' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const lower = message.toLowerCase();

    // Fast heuristic pre-check for high-urgency keywords
    const hasEmergencyTrigger =
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('cannot breathe') ||
      lower.includes('cant breathe') ||
      lower.includes("can't breathe") ||
      lower.includes('trouble breathing') ||
      lower.includes('fallen down') ||
      lower.includes('fell down') ||
      lower.includes('bad fall') ||
      lower.includes('severe bleeding') ||
      lower.includes('killing myself') ||
      lower.includes('hurt myself');

    if (hasEmergencyTrigger) {
      const emergencyReply =
        language === 'hi'
          ? `कृपया तुरंत लाल SOS बटन दबाएं या ${emergencyNumber} पर कॉल करें! मैं आपके परिवार को भी संदेश भेज रही हूँ।`
          : `Please press the red SOS button or call ${emergencyNumber} immediately! I will also notify your family right away.`;

      res.json({
        reply: emergencyReply,
        isEmergency: true,
        action: 'trigger_sos_warning',
      });
      return;
    }

    // Build context with saved memories
    const memoriesContext =
      savedMemories.length > 0
        ? `\nHere are the user's currently saved memory notes in their private vault:\n${savedMemories
            .map((m: any, i: number) => `- [${m.category || 'Note'}] ${m.text} (Saved: ${m.date || 'earlier'})`)
            .join('\n')}\nUse these to answer questions like "Where did I put my...?" or "What did doctor say?". If found, answer directly and reassuringly.`
        : '\nNo memory notes have been recorded yet.';

    const prompt = `
Language to use: ${language === 'hi' ? 'Hindi (Devanagari or simple Hindi)' : 'Simple English'}.
Local Emergency Number: ${emergencyNumber}
${memoriesContext}

User message: "${message}"

Respond strictly as Mitra according to your safety guidelines.
If the user is asking to REMEMBER something new (e.g. "remember that I kept...", "my glasses are...", "dr said..."), state warmly that you have saved it, and include a JSON directive at the very end in format:
[SAVE_MEMORY: {"category": "location|medical|family|general", "text": "summary of memory"}]
If no new memory to save, just return the response text.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ELDER_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const fullText = response.text || '';

    // Extract memory directive if present
    let cleanReply = fullText;
    let memoryToSave: any = null;
    const match = fullText.match(/\[SAVE_MEMORY:\s*(\{.*?\})\]/s);
    if (match) {
      try {
        memoryToSave = JSON.parse(match[1]);
        cleanReply = fullText.replace(/\[SAVE_MEMORY:\s*(\{.*?\})\]/s, '').trim();
      } catch (err) {
        console.error('Failed to parse save memory JSON:', err);
      }
    }

    // Check if reply warns about scam or medical consultation
    const isScamWarning =
      lower.includes('otp') ||
      lower.includes('bank details') ||
      lower.includes('lottery') ||
      lower.includes('prize money') ||
      lower.includes('pin code') ||
      cleanReply.toLowerCase().includes('scam') ||
      cleanReply.toLowerCase().includes('धोखा');

    const isMedicalQuery =
      cleanReply.toLowerCase().includes('doctor or pharmacist') ||
      cleanReply.toLowerCase().includes('डॉक्टर या फार्मासिस्ट');

    res.json({
      reply: cleanReply,
      newMemory: memoryToSave,
      isScamWarning,
      isMedicalQuery,
      isEmergency: false,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    // Graceful fallback for offline or API errors
    res.json({
      reply:
        req.body.language === 'hi'
          ? 'नमस्ते! मैं आपकी बात सुन रही हूँ। कृपया दोबारा बताएं, मैं हमेशा आपके साथ हूँ।'
          : "Hello! I am right here with you. Please tell me again, I'm listening calmly.",
      isEmergency: false,
    });
  }
});

// Scam detector endpoint for suspicious calls / messages
app.post('/api/companion/scam-check', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text to analyze is required' });
      return;
    }

    const prompt = `
Analyze this message or phone call script received by an older adult:
"${text}"

Determine if it is a SCAM / FRAUD, SUSPICIOUS, or SAFE.
Explain in 2 very simple, reassuring sentences suitable for an elderly person.
Give clear advice: e.g. "Do not share OTP", "Do not click link", "Ask your daughter/son to check first".

Language: ${language === 'hi' ? 'Hindi' : 'English'}

Format JSON:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "SAFE",
  "riskLevel": "high" | "medium" | "low",
  "explanation": "Short 2 sentence explanation",
  "actionAdvice": "One clear action instruction"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Scam check error:', error);
    res.json({
      verdict: 'SUSPICIOUS',
      riskLevel: 'high',
      explanation: 'Whenever someone asks for money, bank details, or OTP urgently, never share it.',
      actionAdvice: 'Please call your family or caregiver before taking any action.',
    });
  }
});

// Optional high quality TTS endpoint
app.post('/api/companion/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 300) {
      res.status(400).json({ error: 'Text under 300 chars required' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Warm, calm, gentle voice for senior citizen companion',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } else {
      res.status(204).send();
    }
  } catch (err: any) {
    // If TTS unavailable, frontend will seamlessly use browser Web Speech API
    res.status(500).json({ error: 'TTS fallback to client speech synthesis' });
  }
});

// Setup Vite or static serving
async function setupServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const fs = await import('fs');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        if (!fs.existsSync(indexPath)) {
          res.status(404).send('index.html not found');
          return;
        }
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite.ssrFixStacktrace) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const host = '0.0.0.0';
  app.listen(Number(PORT), host, () => {
    console.log(`Elder Companion App Server running on http://${host}:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
