export const site = {
  name: "SafeStep",
  tagline: "Your camera, your guide.",
  version: "1.0.0",
  platform: "Android",
  minAndroid: "Android 8.0+ (SDK 26)",
  ram: "3 GB RAM or more",
  description:
    "SafeStep turns your phone camera into a guiding eye for blind and low-vision users. An on-device AI model detects people, vehicles, animals and furniture, then warns you with voice, vibration and directional beeps — completely offline.",
  privacy: "Nothing leaves your phone.",
} as const;

// Replace this single value with your EAS APK download link before deploying.
export const APK_URL = "https://www.mediafire.com/file/huxdxh32gnai2of/Safestep.apk/file";

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "What it sees", href: "#targets" },
  { label: "Download", href: "#download" },
] as const;

export const features = [
  {
    title: "Fully offline AI",
    body: "YOLO11 runs on your phone. No internet, no account, and no data ever leaves the device.",
    icon: "chip",
    tone: "accent",
  },
  {
    title: "Urdu & English voice",
    body: "Spoken warnings in Urdu (ur-PK) or English (en-US), with natural pacing.",
    icon: "voice",
    tone: "success",
  },
  {
    title: "Vibration alerts",
    body: "Haptic patterns speed up as an obstacle gets closer, so you feel the danger rise.",
    icon: "vibrate",
    tone: "warning",
  },
  {
    title: "Directional beeps",
    body: "Left, center and right stereo cues tell you which way to move without looking.",
    icon: "wave",
    tone: "accent",
  },
  {
    title: "Voice commands",
    body: "Say “stop”, “repeat”, “describe”, “help” or “light on/off” — hands free.",
    icon: "mic",
    tone: "success",
  },
  {
    title: "Flashlight & demo mode",
    body: "Light up the path at night, or try the whole pipeline without the camera.",
    icon: "flash",
    tone: "warning",
  },
] as const;

export const steps = [
  {
    step: "01",
    title: "Point the phone forward",
    body: "Hold your phone in portrait as you walk. SafeStep starts the camera with one big button.",
  },
  {
    step: "02",
    title: "On-device AI detects",
    body: "People, vehicles, animals and furniture are tracked, filtered and placed in left, center or right zones.",
  },
  {
    step: "03",
    title: "You get warned",
    body: "Voice, vibration and directional beeps tell you what is ahead and roughly how far — in real time.",
  },
] as const;

export const targets = [
  { label: "People", icon: "person" },
  { label: "Vehicles", icon: "car" },
  { label: "Animals", icon: "paw" },
  { label: "Furniture", icon: "chair" },
] as const;

export const specs = [
  { label: "Version", value: site.version },
  { label: "Platform", value: site.platform },
  { label: "Requires", value: site.minAndroid },
  { label: "Memory", value: site.ram },
] as const;
