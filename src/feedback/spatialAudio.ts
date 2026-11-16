import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { Zone } from '@/ml/types';

let players: Record<Zone, AudioPlayer> | null = null;
let audioModeReady = false;

function getPlayers(): Record<Zone, AudioPlayer> {
  if (players == null) {
    players = {
      left: createAudioPlayer(require('../../assets/sounds/left.wav')),
      center: createAudioPlayer(require('../../assets/sounds/center.wav')),
      right: createAudioPlayer(require('../../assets/sounds/right.wav')),
    };
    players.left.volume = 1;
    players.center.volume = 1;
    players.right.volume = 1;
  }
  return players;
}

/** Prepare the audio session + players. Safe to call many times. */
export async function warmUpAudio(): Promise<void> {
  if (!audioModeReady) {
    audioModeReady = true;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
    } catch {
      // Audio is a nice-to-have; never block navigation on it.
    }
  }
  getPlayers();
}

/** Play a short directional beep on the left, center, or right channel. */
export function playBeep(zone: Zone): void {
  void warmUpAudio();
  const player = getPlayers()[zone];
  player
    .seekTo(0)
    .then(() => player.play())
    .catch(() => {});
}
