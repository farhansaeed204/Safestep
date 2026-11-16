import { APK_URL, navLinks } from "@/lib/site";
import { Icon } from "./Icon";
import { FullLogo } from "./Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <a
          href="#top"
          className="rounded-xl transition-opacity hover:opacity-80"
          aria-label="SafeStep home"
        >
          <FullLogo height={38} />
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-ink-2 transition-colors hover:bg-card hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={APK_URL}
          className="group inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(0,122,255,0.8)] transition-all hover:bg-accent-hover active:scale-[0.98]"
          aria-label="Download the SafeStep APK for Android"
        >
          <Icon name="download" size={18} />
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>
    </header>
  );
}
