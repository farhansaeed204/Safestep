import Image from "next/image";
import { site } from "@/lib/site";

export function LogoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={497}
      height={512}
      aria-hidden="true"
      className={`w-auto ${className}`}
      style={{ height: size }}
    />
  );
}

export function FullLogo({
  height = 34,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo-full.png"
      alt={site.name}
      width={512}
      height={176}
      priority
      className={`w-auto ${className}`}
      style={{ height }}
    />
  );
}

export function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-[1.35rem] font-bold tracking-tight text-ink">
        {site.name}
      </span>
    </span>
  );
}
