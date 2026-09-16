import { Mail, Phone, GitBranch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Channel = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  ltr?: boolean;
  external?: boolean;
};

const channels: Channel[] = [
  {
    label: "واتساب — الرد الأسرع",
    value: "+964 784 629 5574",
    href: "https://wa.me/9647846295574",
    icon: Phone,
    ltr: true,
    external: true,
  },
  {
    label: "الإيميل",
    value: "muntarazr@gmail.com",
    href: "mailto:muntarazr@gmail.com",
    icon: Mail,
    ltr: true,
  },
  {
    label: "GitHub",
    value: "github.com/wbtio",
    href: "https://github.com/wbtio",
    icon: GitBranch,
    ltr: true,
    external: true,
  },
];

export default function Contact() {
  return (
    <section className="border-b border-black/[0.06] bg-white transition-colors dark:border-white/[0.06] dark:bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <span className="lbl">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          تواصل مباشر
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug text-balance dark:text-white">
          عندك سؤال أو فكرة؟ أقصر طريق: واتساب
        </h2>
        <p className="mt-2.5 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-muted/90">
          احكيلي عن شغلك وشنو يضيّع عليك وقت أو فلوس — أرد عليك بسرعة، وبدون
          أي التزام.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group relative flex items-center gap-3.5 rounded-2xl border border-black/10 bg-neutral-50/70 p-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/40 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-white/[0.08] dark:bg-ink-2/70 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:bg-ink-2 dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-black/10 bg-neutral-100 text-neutral-600 transition-all group-hover:border-signal/30 group-hover:bg-signal/10 group-hover:text-signal dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-muted">
                <c.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs text-neutral-500 dark:text-muted/80">{c.label}</span>
                <span
                  className="block truncate font-mono text-sm font-semibold text-neutral-900 transition-colors group-hover:text-signal dark:text-white"
                  dir={c.ltr ? "ltr" : undefined}
                >
                  {c.value}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
