"""
Generate short stereo beep WAVs for Virtual Eye.

Run from the project root:
    python scripts/gen_sounds.py
"""
import math
import os
import struct
import wave

RATE = 44100
DURATION = 0.14
FADE = 0.012
AMPLITUDE = 0.5

SOUNDS = {
    "left.wav": (880.0, (1.0, 0.0)),
    "right.wav": (1320.0, (0.0, 1.0)),
    "center.wav": (1050.0, (0.75, 0.75)),
}

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "sounds")


def generate(path: str, freq: float, channels: tuple[float, float]) -> None:
    frames = int(RATE * DURATION)
    fade_frames = max(1, int(RATE * FADE))
    data = bytearray()

    for i in range(frames):
        t = i / RATE
        envelope = 1.0
        if i < fade_frames:
            envelope = i / fade_frames
        elif i > frames - fade_frames:
            envelope = max(0.0, (frames - i) / fade_frames)

        sample = math.sin(2.0 * math.pi * freq * t) * AMPLITUDE * envelope
        left = int(max(-1.0, min(1.0, sample * channels[0])) * 32767)
        right = int(max(-1.0, min(1.0, sample * channels[1])) * 32767)
        data += struct.pack("<hh", left, right)

    with wave.open(path, "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(bytes(data))


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (freq, channels) in SOUNDS.items():
        path = os.path.join(OUT_DIR, name)
        generate(path, freq, channels)
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
