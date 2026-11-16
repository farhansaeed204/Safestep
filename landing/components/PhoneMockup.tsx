import { Icon } from "./Icon";

function BoundingBox({
  label,
  confidence,
  className,
  tone,
}: {
  label: string;
  confidence: string;
  className: string;
  tone: "success" | "accent";
}) {
  const border = tone === "success" ? "border-success" : "border-accent";
  const chip =
    tone === "success" ? "bg-success text-[#04240d]" : "bg-accent text-white";
  return (
    <div className={`absolute rounded-lg border-2 ${border} ${className}`}>
      <span
        className={`absolute -top-6 left-0 flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${chip}`}
      >
        {label}
        <span className="font-semibold opacity-80">{confidence}</span>
      </span>
    </div>
  );
}

export function PhoneMockup() {
  return (
    <div aria-hidden="true" className="relative select-none">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-accent/10 blur-3xl" />

      <div className="animate-float relative mx-auto w-[280px] rounded-[46px] bg-[#1c1c1e] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10 sm:w-[310px]">
        <div className="absolute left-1/2 top-3.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

        <div className="relative aspect-[9/19] overflow-hidden rounded-[36px] bg-[#05070a]">
          {/* Camera scene */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#20313f_0%,#0c151c_45%,#05070a_100%)]" />
          <div className="absolute inset-x-0 top-[46%] h-px bg-white/10" />
          <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_35%)]" />
          <div className="absolute bottom-0 left-1/2 h-[55%] w-[70%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_35%,rgba(255,255,255,0.07)_50%,transparent_65%)]" />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:33.33%_33.33%]" />

          {/* Top overlay */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Camera mode
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md">
              <Icon name="flash" size={13} />
            </span>
          </div>

          {/* Detections */}
          <BoundingBox
            label="Person"
            confidence="0.82"
            tone="accent"
            className="left-[12%] top-[34%] h-[30%] w-[26%]"
          />
          <div className="absolute left-[46%] top-[40%] h-[36%] w-[42%]">
            <div className="absolute inset-0 rounded-lg border-2 border-success" />
            <div className="animate-pulse-ring absolute inset-0 rounded-lg border-2 border-success" />
            <span className="absolute -top-6 left-0 flex items-center gap-1.5 rounded-md bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#04240d]">
              Car <span className="font-semibold opacity-80">0.91</span>
            </span>
          </div>

          {/* Bottom alert card */}
          <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success text-[#04240d]">
                <Icon name="car" size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold leading-tight text-white">
                  Car ahead
                </p>
                <p className="text-[11px] leading-tight text-white/70">
                  8 m · center
                </p>
              </div>
              <span className="rounded-full bg-danger px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Close
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-center gap-2">
              {(["L", "C", "R"] as const).map((zone) => {
                const active = zone === "C";
                return (
                  <div key={zone} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-4 items-end gap-[3px]">
                      {[3, 4, 2].map((h, i) => (
                        <span
                          key={i}
                          className={`w-[3px] rounded-full ${
                            active ? "bg-white" : "bg-white/25"
                          }`}
                          style={{ height: `${h * (active ? 1.6 : 1)}px` }}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[9px] font-bold ${
                        active ? "text-white" : "text-white/35"
                      }`}
                    >
                      {zone}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating cue chips */}
      <div className="absolute -left-3 top-[26%] hidden rounded-2xl border border-line bg-card px-3 py-2 shadow-card sm:-left-8 sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent">
            <Icon name="voice" size={16} />
          </span>
          <div>
            <p className="text-[11px] font-bold text-ink">Urdu / English</p>
            <p className="text-[10px] text-ink-2">spoken warnings</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-3 bottom-[24%] hidden rounded-2xl border border-line bg-card px-3 py-2 shadow-card sm:-right-8 sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-success-soft text-success">
            <Icon name="wifi-off" size={16} />
          </span>
          <div>
            <p className="text-[11px] font-bold text-ink">100% offline</p>
            <p className="text-[10px] text-ink-2">on-device AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
