import { FEEDBACK } from '@/config';
import type { AnnotatedDetection, Language, Zone } from '@/ml/types';

type Dict = Record<string, string>;

const en: Dict = {
  appName: 'SafeStep',
  tagline: 'Your camera, your guide.',
  offlineBadge: 'Works offline',
  startNavigation: 'Start Navigation',
  stop: 'Stop',
  settings: 'Settings',
  repeat: 'Repeat',
  voiceCommand: 'Voice',
  listening: 'Listening…',
  language: 'Language',
  english: 'English',
  urdu: 'اردو',
  warningDistance: 'Warning distance',
  detection: 'Detection',
  centerOnly: 'Center only',
  centerOnlyHint: 'Ignore objects at the left and right edges',
  detectionRange: 'Detection range',
  confidence: 'Confidence',
  debugOverlay: 'Debug overlay',
  debugOverlayHint: 'Show raw detection scores for testing',
  targets: 'Targets',
  targetsBody:
    'People, vehicles, animals and furniture only. Wall, stairs and gate detection comes in v7.',
  flashlight: 'Flashlight',
  flashlightOn: 'Flashlight on',
  flashlightOff: 'Flashlight off',
  flashlightUnavailable: 'Flashlight is not available on this device.',
  cameraDetection: 'Camera detection',
  cameraDetectionHint: 'Detect obstacles with the on-device AI model',
  haptics: 'Vibration alerts',
  spatialAudio: 'Directional beeps',
  voiceCommands: 'Voice commands',
  demoMode: 'Demo mode',
  cameraMode: 'Camera mode',
  cameraErrorTitle: 'Camera unavailable',
  cameraDisabled:
    'The camera is disabled by Android or another app. Turn on camera access in system settings, close other camera apps, then try again.',
  openSettings: 'Open settings',
  retry: 'Try again',
  modelErrorTitle: 'AI model not loaded',
  home: 'Home',
  modelsMissing: 'AI models not loaded — showing demo mode',
  permissionTitle: 'Camera permission needed',
  permissionBody: 'SafeStep needs the camera to see the road ahead. Nothing leaves your phone.',
  grant: 'Allow camera',
  noCamera: 'No back camera found on this device.',
  loadingModels: 'Loading AI models…',
  startingPipeline: 'Starting camera…',
  checkpointPermission: 'Camera permission granted.',
  checkpointModelLoading: 'Loading the AI model.',
  checkpointModelReady: 'AI model loaded.',
  checkpointCameraReady: 'Camera is running. Detection is active.',
  cpuPipeline: 'CPU pipeline',
  modelError: 'Could not load the AI models.',
  pipelineErrorTitle: 'Camera processing failed',
  pipelineErrorBody: 'Try again, or use demo mode.',
  meters: 'meters',
  ahead: 'ahead',
  onYourLeft: 'on your left',
  onYourRight: 'on your right',
  warning: 'Warning',
  veryClose: 'very close',
  voiceHint: 'Say “stop”, “repeat”, “describe”, “start”, or “light on/off”.',
  notAvailable: 'Not available on this device',
  back: 'Back',
  about: 'About',
  aboutBody:
    'SafeStep detects people, vehicles, animals and furniture, then warns you with voice, vibration and directional beeps. Wall, stairs and gate detection is planned for v7. It works fully offline.',
  demoNote: 'Demo mode simulates people, vehicles and objects so you can test the alerts.',
  detections: 'detections',
  stopSpeaking: 'Stop voice',
  done: 'Done',
  on: 'On',
  off: 'Off',
  hintHome: 'Point the phone forward and tap Start. Use the big buttons to repeat or speak a command.',
  started: 'Navigation started. Point the phone ahead.',
};

const ur: Dict = {
  appName: 'سیف اسٹیپ',
  tagline: 'آپ کا کیمرہ، آپ کا رہنما۔',
  offlineBadge: 'آف لائن کام کرتا ہے',
  startNavigation: 'نیویگیشن شروع کریں',
  stop: 'رکیں',
  settings: 'ترتیبات',
  repeat: 'دوبارہ',
  voiceCommand: 'آواز',
  listening: 'سن رہا ہے…',
  language: 'زبان',
  english: 'English',
  urdu: 'اردو',
  warningDistance: 'انتباہ کا فاصلہ',
  detection: 'ڈیٹیکشن',
  centerOnly: 'صرف درمیان',
  centerOnlyHint: 'بائیں اور دائیں کناروں کی چیزیں نظر انداز کریں',
  detectionRange: 'ڈیٹیکشن کی حد',
  confidence: 'اعتماد',
  debugOverlay: 'ڈیبگ اوورلے',
  debugOverlayHint: 'ٹیسٹ کے لیے خام ڈیٹیکشن اسکور دکھائیں',
  targets: 'ہدف',
  targetsBody: 'صرف لوگ، گاڑیاں، جانور اور فرنیچر۔ دیوار، سیڑھیاں اور گیٹ v7 میں۔',
  flashlight: 'ٹارچ',
  flashlightOn: 'ٹارچ آن',
  flashlightOff: 'ٹارچ آف',
  flashlightUnavailable: 'اس فون میں ٹارچ دستیاب نہیں۔',
  cameraDetection: 'کیمرہ ڈیٹیکشن',
  cameraDetectionHint: 'آن ڈیوائس AI ماڈل سے رکاوٹیں پہچانیں',
  haptics: 'وائبریشن انتباہ',
  spatialAudio: 'سمت کی بیپ',
  voiceCommands: 'آواز کے کمانڈ',
  demoMode: 'ڈیمو موڈ',
  cameraMode: 'کیمرہ موڈ',
  cameraErrorTitle: 'کیمرہ دستیاب نہیں',
  cameraDisabled:
    'کیمرہ اینڈرائیڈ یا کسی دوسری ایپ نے بند کر رکھا ہے۔ سسٹم ترتیبات میں کیمرہ رسائی آن کریں، دوسری کیمرہ ایپس بند کریں، پھر دوبارہ کوشش کریں۔',
  openSettings: 'ترتیبات کھولیں',
  retry: 'دوبارہ کوشش کریں',
  modelErrorTitle: 'AI ماڈل لوڈ نہیں ہوا',
  home: 'ہوم',
  modelsMissing: 'AI ماڈل لوڈ نہیں ہوئے — ڈیمو موڈ',
  permissionTitle: 'کیمرہ کی اجازت درکار ہے',
  permissionBody: 'سیف اسٹیپ کو سڑک دیکھنے کے لیے کیمرہ چاہیے۔ کوئی ڈیٹا فون سے باہر نہیں جاتا۔',
  grant: 'کیمرہ کی اجازت دیں',
  noCamera: 'اس فون میں پچھلا کیمرہ نہیں ملا۔',
  loadingModels: 'AI ماڈل لوڈ ہو رہے ہیں…',
  startingPipeline: 'کیمرہ شروع ہو رہا ہے…',
  checkpointPermission: 'کیمرہ کی اجازت مل گئی۔',
  checkpointModelLoading: 'اے آئی ماڈل لوڈ ہو رہا ہے۔',
  checkpointModelReady: 'اے آئی ماڈل لوڈ ہو گیا۔',
  checkpointCameraReady: 'کیمرہ چل رہا ہے۔ ڈیٹیکشن فعال ہے۔',
  cpuPipeline: 'سی پی یو پائپ لائن',
  modelError: 'AI ماڈل لوڈ نہیں ہو سکے۔',
  pipelineErrorTitle: 'کیمرہ پروسیسنگ ناکام',
  pipelineErrorBody: 'دوبارہ کوشش کریں یا ڈیمو موڈ استعمال کریں۔',
  meters: 'میٹر',
  ahead: 'سامنے',
  onYourLeft: 'بائیں طرف',
  onYourRight: 'دائیں طرف',
  warning: 'خبردار',
  veryClose: 'بہت قریب',
  voiceHint: 'بولیں: “رکیں”، “دوبارہ”، “بتائیں”، “شروع”، یا “ٹارچ آن/آف”۔',
  notAvailable: 'اس فون پر دستیاب نہیں',
  back: 'واپس',
  about: 'تعارف',
  aboutBody:
    'سیف اسٹیپ لوگوں، گاڑیوں، جانوروں اور فرنیچر کو پہچان کر آواز، وائبریشن اور سمت کی بیپ سے خبردار کرتا ہے۔ دیوار، سیڑھیاں اور گیٹ v7 میں آئیں گے۔ یہ مکمل طور پر آف لائن کام کرتا ہے۔',
  demoNote: 'ڈیمو موڈ لوگ، گاڑیاں اور چیزیں دکھاتا ہے تاکہ آپ انتباہ جانچ سکیں۔',
  detections: 'ڈیٹیکشن',
  stopSpeaking: 'آواز بند کریں',
  done: 'مکمل',
  on: 'آن',
  off: 'آف',
  hintHome: 'فون کو سامنے رکھیں اور شروع دبائیں۔ دوبارہ یا آواز کے بٹن استعمال کریں۔',
  started: 'نیویگیشن شروع۔ فون سامنے رکھیں۔',
};

const STRINGS: Record<Language, Dict> = { en, ur };

export function t(language: Language, key: string): string {
  return STRINGS[language][key] ?? STRINGS.en[key] ?? key;
}

export function zonePhrase(language: Language, zone: Zone): string {
  if (language === 'ur') {
    if (zone === 'left') return t('ur', 'onYourLeft');
    if (zone === 'right') return t('ur', 'onYourRight');
    return t('ur', 'ahead');
  }
  if (zone === 'left') return t('en', 'onYourLeft');
  if (zone === 'right') return t('en', 'onYourRight');
  return t('en', 'ahead');
}

/** Build the spoken warning for the most important detection. */
export function buildAnnouncement(language: Language, d: AnnotatedDetection): string {
  const meters = Math.max(1, Math.round(d.distance));
  const zone = zonePhrase(language, d.zone);

  if (language === 'ur') {
    const label = d.labelLocal;
    if (d.distance <= FEEDBACK.criticalDistanceM) {
      return `${t('ur', 'warning')}، ${label} ${t('ur', 'veryClose')} ہے، ${meters} ${t('ur', 'meters')}، ${zone}`;
    }
    return `${label}، ${meters} ${t('ur', 'meters')}، ${zone}`;
  }

  if (d.distance <= FEEDBACK.criticalDistanceM) {
    return `${t('en', 'warning')}, ${d.label} ${t('en', 'veryClose')}, ${meters} ${t('en', 'meters')}, ${zone}`;
  }
  return `${d.label}, ${meters} ${t('en', 'meters')}, ${zone}`;
}

/** Short scene description used by the “describe” voice command. */
export function buildSceneDescription(language: Language, detections: AnnotatedDetection[]): string {
  if (detections.length === 0) {
    return language === 'ur' ? 'سامنے کوئی رکاوٹ نہیں۔' : 'No obstacles ahead.';
  }
  const top = [...detections].sort((a, b) => b.danger - a.danger).slice(0, 3);
  const parts = top.map((d) => {
    const meters = Math.max(1, Math.round(d.distance));
    if (language === 'ur') {
      return `${d.labelLocal} ${meters} ${t('ur', 'meters')} ${zonePhrase('ur', d.zone)}`;
    }
    return `${d.label} ${meters} ${t('en', 'meters')} ${zonePhrase('en', d.zone)}`;
  });
  return language === 'ur' ? `سامنے: ${parts.join('، ')}۔` : `Ahead: ${parts.join(', ')}.`;
}
