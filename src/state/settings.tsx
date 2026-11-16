import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { FEEDBACK, MODEL } from '@/config';
import type { Language } from '@/ml/types';

export type Settings = {
  language: Language;
  warningDistanceM: number;
  cameraDetection: boolean;
  haptics: boolean;
  spatialAudio: boolean;
  voiceCommands: boolean;
  centerOnly: boolean;
  maxDistanceM: number;
  confidence: number;
  debugOverlay: boolean;
  torchOn: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  warningDistanceM: FEEDBACK.defaultWarningDistanceM,
  cameraDetection: true,
  haptics: true,
  spatialAudio: true,
  voiceCommands: true,
  centerOnly: false,
  maxDistanceM: MODEL.maxDistanceM,
  confidence: MODEL.displayThreshold,
  debugOverlay: false,
  torchOn: false,
};

type SettingsContextValue = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ settings, update }), [settings, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
