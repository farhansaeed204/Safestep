import { targets } from "@/lib/site";
import { Icon, type IconName } from "./Icon";

export function Targets() {
  return (
    <section id="targets" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent">
              What it sees
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              The obstacles that matter most on your way
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-2">
              SafeStep runs a strict COCO detection pipeline tuned for everyday
              walking: it filters false positives, suppresses duplicates and
              keeps a 4-of-6-frame tracker before it speaks.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {targets.map((target) => (
                <li
                  key={target.label}
                  className="rounded-2xl border border-line/70 bg-card p-4 text-center shadow-soft"
                >
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon name={target.icon as IconName} size={22} />
                  </span>
                  <p className="mt-2.5 text-sm font-semibold text-ink">
                    {target.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-[24px] border border-line/70 bg-card p-6 shadow-card sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1.5 text-[13px] font-semibold text-warning">
                <Icon name="alert" size={15} />
                Honest limits
              </span>
              <h3 className="mt-4 text-xl font-semibold text-ink">
                Built for a Build2Launch, tuned for real use
              </h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-2">
                <li className="flex gap-2.5">
                  <Icon
                    name="check"
                    size={18}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  Detects people, vehicles, animals and furniture only.
                </li>
                <li className="flex gap-2.5">
                  <Icon
                    name="check"
                    size={18}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  Alerts stop beyond a 50 m range to cut noise.
                </li>
                <li className="flex gap-2.5">
                  <Icon
                    name="arrow-right"
                    size={18}
                    className="mt-0.5 shrink-0 text-warning"
                  />
                  Wall, stairs and gate detection is planned for next version.
                </li>
                <li className="flex gap-2.5">
                  <Icon
                    name="alert"
                    size={18}
                    className="mt-0.5 shrink-0 text-warning"
                  />
                  Distances are estimates — not safety-critical measurements.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
