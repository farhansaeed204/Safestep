import type { SVGProps } from "react";

export type IconName =
  | "eye"
  | "download"
  | "chip"
  | "voice"
  | "vibrate"
  | "wave"
  | "mic"
  | "flash"
  | "person"
  | "car"
  | "paw"
  | "chair"
  | "check"
  | "arrow-right"
  | "shield"
  | "android"
  | "alert"
  | "sparkle"
  | "battery"
  | "wifi-off";

const paths: Record<IconName, React.ReactNode> = {
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v11" />
      <path d="m7.5 10 4.5 4.5 4.5-4.5" />
      <path d="M4.5 20h15" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <path d="M9.5 9.5h5v5h-5z" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  voice: (
    <>
      <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  vibrate: (
    <>
      <rect x="8" y="4" width="8" height="16" rx="2" />
      <path d="M3 9v6M5.5 7v10M21 9v6M18.5 7v10" />
    </>
  ),
  wave: (
    <>
      <path d="M4 10.5v3M8 7v10M12 4v16M16 7v10M20 10.5v3" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3M9 21h6" />
    </>
  ),
  flash: (
    <>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </>
  ),
  car: (
    <>
      <path d="m4 12 1.6-4.2A2 2 0 0 1 7.5 6.5h9a2 2 0 0 1 1.9 1.3L20 12" />
      <path d="M3.5 12h17v5h-2.5M3.5 17H3.5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  paw: (
    <>
      <circle cx="6.5" cy="10" r="1.8" />
      <circle cx="10.5" cy="6.5" r="1.8" />
      <circle cx="15" cy="7" r="1.8" />
      <circle cx="18" cy="10.5" r="1.8" />
      <path d="M8 16.5c0-2.5 2-4 4-4s4 1.5 4 4-1.8 3.5-4 3.5-4-1-4-3.5Z" />
    </>
  ),
  chair: (
    <>
      <path d="M7 11V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V11" />
      <path d="M5.5 11h13v4h-13z" />
      <path d="M7 15v5M17 15v5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
  "arrow-right": (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  android: (
    <>
      <path d="M5 10.5a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5Z" />
      <path d="m7.5 5.5-1.5-2M16.5 5.5l1.5-2" />
      <path d="M9 9.5h.01M15 9.5h.01" />
      <path d="M10 17.5v3M14 17.5v3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.5 10.4 12 5 10.6 10.4 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 18.8 21.5 19.5 19.2 20.2 18.5 22.5 17.8 20.2 15.5 19.5 17.8 18.8 18.5 16.5Z" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="8" width="16" height="8" rx="2" />
      <path d="M21 11v2" />
      <path d="M6 11v2M9 11v2" />
    </>
  ),
  "wifi-off": (
    <>
      <path d="M3 3l18 18" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" />
      <path d="M5 12a10 10 0 0 1 3-2" />
      <path d="M16 10a10 10 0 0 1 3 2" />
      <path d="M12 18.5h.01" />
    </>
  ),
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
