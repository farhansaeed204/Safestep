import { features } from "@/lib/site";
import { Icon, type IconName } from "./Icon";

const tones: Record<string, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Guidance you can hear, feel and trust
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-2">
            Every alert is designed for ears and touch — not just eyes. Three
            feedback channels work together so you never miss what is ahead.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group rounded-[24px] border border-line/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[feature.tone]}`}
              >
                <Icon name={feature.icon as IconName} size={24} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
