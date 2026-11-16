import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '@/ml/types';
import { speechRecognition, useSpeechRecognitionEvent } from './recognizer';

export type VoiceCommand =
  | 'start'
  | 'stop'
  | 'repeat'
  | 'describe'
  | 'help'
  | 'flashlight-on'
  | 'flashlight-off';

const EN: [RegExp, VoiceCommand][] = [
  [/\b(on|enable|turn on).*(light|flashlight|torch)\b/, 'flashlight-on'],
  [/\b(off|disable|turn off).*(light|flashlight|torch)\b/, 'flashlight-off'],
  [/\b(light|flashlight|torch)\s*(on|chalu|jalao)\b/, 'flashlight-on'],
  [/\b(light|flashlight|torch)\s*(off|band|bujhao|bujha)\b/, 'flashlight-off'],
  [/\b(light|flashlight|torch)\b/, 'flashlight-on'],
  [/\b(stop|halt|cancel|enough)\b/, 'stop'],
  [/\b(repeat|again|say.*again)\b/, 'repeat'],
  [/\b(describe|what.*(ahead|front)|surroundings|scene)\b/, 'describe'],
  [/\b(start|go|begin|continue)\b/, 'start'],
  [/\b(help|commands?)\b/, 'help'],
];

const UR: [RegExp, VoiceCommand][] = [
  [/(on|chalu|jalao).*(light|flashlight|torch|roshni|batti|bati)/, 'flashlight-on'],
  [/(off|band|bujhao|bujha).*(light|flashlight|torch|roshni|batti|bati)/, 'flashlight-off'],
  [/(light|flashlight|torch|roshni|batti|bati).*(off|band|bujhao|bujha)/, 'flashlight-off'],
  [/(light|flashlight|torch|roshni|batti|bati).*(on|chalu|jalao)/, 'flashlight-on'],
  [/(light|flashlight|torch|roshni|batti|bati)/, 'flashlight-on'],
  [/(ruko|ruk|band|bas|stop)/, 'stop'],
  [/(dobara|dobara batao|phir|repeat)/, 'repeat'],
  [/(batao|bata|bataye|batayen|describe|kya aage|aage kya)/, 'describe'],
  [/(shuru|chalo|chalein|start|aage)/, 'start'],
  [/(madad|help|kya bolun)/, 'help'],
];

function matchCommand(text: string, language: Language): VoiceCommand | null {
  const lower = text.toLowerCase();
  const primary = language === 'ur' ? UR : EN;
  const secondary = language === 'ur' ? EN : UR;

  for (const [re, cmd] of primary) if (re.test(lower)) return cmd;
  for (const [re, cmd] of secondary) if (re.test(lower)) return cmd;
  return null;
}

/**
 * Push-to-talk voice commands. Call `start()` when the user presses the
 * voice button; it listens once and reports the matched command.
 */
export function useVoiceCommand(
  enabled: boolean,
  language: Language,
  onCommand: (command: VoiceCommand) => void,
) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCommandRef = useRef(onCommand);
  const languageRef = useRef(language);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const start = useCallback(async () => {
    if (!enabledRef.current) return;
    setError(null);

    try {
      const module = speechRecognition?.ExpoSpeechRecognitionModule;
      if (module == null || !module.isRecognitionAvailable()) {
        setError('not-available');
        return;
      }
      const permission = await module.requestPermissionsAsync();
      if (!permission.granted) {
        setError('permission');
        return;
      }
      setListening(true);
      module.start({
        lang: languageRef.current === 'ur' ? 'ur-PK' : 'en-US',
        interimResults: false,
        continuous: false,
        maxAlternatives: 3,
      });
    } catch (e) {
      setListening(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const stop = useCallback(() => {
    setListening(false);
    try {
      speechRecognition?.ExpoSpeechRecognitionModule.stop();
    } catch {
      // Ignore.
    }
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const results = event.results ?? [];
    for (const result of results) {
      const command = matchCommand(result.transcript ?? '', languageRef.current);
      if (command) {
        onCommandRef.current(command);
        break;
      }
    }
    setListening(false);
  });

  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    setError(event.error);
  });

  return { listening, error, start, stop };
}
