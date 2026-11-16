import { APK_URL, site } from "@/lib/site";
import { Icon } from "./Icon";
import { PhoneMockup } from "./PhoneMockup";

const trust = ["Works offline", "No account needed", "Privacy-first"] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_15%_-10%,#e5f0ff_0%,transparent_55%),radial-gradient(60%_50%_at_95%_5%,#e8f9ed_0%,transparent_50%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24">
        <div className="text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-[13px] font-semibold text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              Works offline
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[13px] font-semibold text-ink-2">
              <Icon name="android" size={15} />
              Android APK
            </span>
          </div>

          <h1 className="mt-5 text-balance text-[2.6rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.1rem]">
            {site.name} is your{" "}
            <span className="text-accent">camera</span>, your guide.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-2 lg:mx-0">
            An on-device AI companion for blind and low-vision users. It sees
            people, vehicles, animals and furniture ahead, then warns you with
            voice, vibration and directional beeps — so you can walk with
            confidence.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href={APK_URL}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-10px_rgba(0,122,255,0.9)] transition-all hover:bg-accent-hover active:scale-[0.99] sm:w-auto"
              aria-label="Download the SafeStep APK for Android"
            >
              <Icon name="download" size={20} />
              Download APK
              <Icon
                name="arrow-right"
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-7 py-4 text-base font-semibold text-ink transition-colors hover:border-ink-3 sm:w-auto"
            >
              See how it works
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
            {trust.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2"
              >
                <Icon name="check" size={15} className="text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
