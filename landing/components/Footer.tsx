import { APK_URL, navLinks, site } from "@/lib/site";
import { Icon } from "./Icon";
import { Wordmark } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-card">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <a
              href="#top"
              className="inline-block rounded-xl transition-opacity hover:opacity-80"
              aria-label="Back to top"
            >
              <Wordmark size={38} />
            </a>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
              {site.tagline} An offline accessibility companion for blind and
              low-vision users.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-[13px] font-semibold text-success">
              <Icon name="wifi-off" size={14} />
              {site.privacy}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
              Explore
            </p>
            <ul className="mt-3 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[15px] font-medium text-ink-2 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
              Get the app
            </p>
            <a
              href={APK_URL}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              aria-label="Download the SafeStep APK for Android"
            >
              <Icon name="download" size={17} />
              Download APK
            </a>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
              {site.platform} {site.minAndroid}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-line/70 pt-6">
          <p className="text-[12px] text-ink-3">
            © {new Date().getFullYear()} {site.name}. Built with care for
            accessibility.
          </p>
        </div>
      </div>
    </footer>
  );
}
