import { steps } from "@/lib/site";
import { Icon } from "./Icon";

const icons = ["eye", "chip", "wave"] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-card-muted py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Three steps from pocket to pavement
          </h2>
        </div>

        <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-line to-transparent md:block"
          />
          {steps.map((item, index) => (
            <li
              key={item.step}
              className="relative rounded-[24px] border border-line/70 bg-card p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-ink text-white">
                  <Icon name={icons[index]} size={24} />
                </span>
                <span className="text-3xl font-bold tabular-nums text-ink-3">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
