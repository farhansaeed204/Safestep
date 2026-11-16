import * as Speech from 'expo-speech';
import type { Language } from '@/ml/types';

const LANG_CODE: Record<Language, string> = {
  en: 'en-US',
  ur: 'ur-PK',
};

/** Speak a phrase, interrupting anything already being spoken. */
export function speak(text: string, language: Language): void {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: LANG_CODE[language],
      rate: language === 'ur' ? 0.92 : 1.0,
      pitch: 1.0,
    });
  } catch {
    // TTS can be missing on some devices — never crash the app for it.
  }
}

export function stopSpeaking(): void {
  Speech.stop().catch(() => {});
}
