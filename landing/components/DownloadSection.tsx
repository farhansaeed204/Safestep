import { APK_URL, site, specs } from "@/lib/site";
import { Icon } from "./Icon";
import { LogoMark } from "./Logo";

export function DownloadSection() {
  return (
    <section id="download" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-12 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_85%_0%,rgba(0,122,255,0.45)_0%,transparent_60%),radial-gradient(50%_60%_at_10%_100%,rgba(52,199,89,0.28)_0%,transparent_55%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark size={52} />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
                    {site.platform} · v{site.version}
                  </p>
                  <p className="text-xl font-bold text-white">{site.name}</p>
                </div>
              </div>

              <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Download SafeStep and take your first guided step
              </h2>
              <p className="mt-3 max-w-lg text-pretty text-[17px] leading-relaxed text-white/70">
                A direct APK install for Android. No account, no ads, no
                tracking. {site.privacy}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={APK_URL}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-base font-semibold text-ink shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.99]"
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
                <span className="text-[13px] leading-snug text-white/60">
                  Free · Hackathon build
                  <br className="hidden sm:block" /> Not on the Play Store
                </span>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
              <p className="text-sm font-semibold text-white/60">
                App details
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-[15px] font-semibold text-white">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-black/20 p-3.5">
                <Icon
                  name="shield"
                  size={18}
                  className="mt-0.5 shrink-0 text-success"
                />
                <p className="text-[13px] leading-relaxed text-white/70">
                  All detection happens on your phone using a bundled YOLO11
                  model. Camera frames are never uploaded.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Download the APK",
              body: "Tap a download button above on your Android phone.",
            },
            {
              title: "Allow install",
              body: "If prompted, allow installing apps from your browser.",
            },
            {
              title: "Open and start",
              body: "Grant camera, microphone and vibration, then tap Start.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="flex gap-3 rounded-2xl border border-line/70 bg-card p-4 shadow-soft"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
