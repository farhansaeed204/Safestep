import Constants from 'expo-constants';

type SpeechRecognitionModule = typeof import('expo-speech-recognition');

/**
 * `expo-speech-recognition` is a native module, so importing it in Expo Go
 * throws. Load it lazily and fall back to a no-op in that environment, which
 * keeps demo mode usable without a development build.
 */
let speech: SpeechRecognitionModule | null = null;
if (Constants.executionEnvironment !== 'storeClient') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    speech = require('expo-speech-recognition') as SpeechRecognitionModule;
  } catch {
    speech = null;
  }
}

export const speechRecognition = speech;

const useNoopEvent: SpeechRecognitionModule['useSpeechRecognitionEvent'] = () => {
  // No native speech module (e.g. Expo Go) — nothing to subscribe to.
};

export const useSpeechRecognitionEvent =
  speech?.useSpeechRecognitionEvent ?? useNoopEvent;
