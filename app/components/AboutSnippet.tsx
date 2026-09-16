"use client";

import { useEffect, useRef, useState } from "react";
import { 
  SiNextdotjs, 
  SiReact, 
  SiSupabase, 
  SiN8n, 
  SiGooglegemini, 
  SiTypescript, 
  SiPostgresql,
  SiApple,
  SiGoogleplay
} from "@icons-pack/react-simple-icons";
import { 
  ShoppingBag, 
  Store, 
  Cpu, 
  Layers3, 
  Sparkles,
  Smartphone,
  ArrowUpRight
} from "lucide-react";
import { FlickeringGrid } from "./FlickeringGrid";

type Work = {
  name: string;
  what: string;
  href: string;
  icon: any;
  tags: string[];
  badgeColor?: string;
};

const WORKS: Work[] = [
  {
    name: "أمل سنتر (iOS)",
    what: "سوبرماركت ومتجر الكتروني متكامل — تطبيق iPhone",
    href: "https://apps.apple.com/in/app/%D8%A7%D9%84%D8%A3%D9%85%D9%84-%D8%B3%D9%86%D8%AA%D8%B1/id6766741045",
    icon: SiApple,
    tags: ["سوبرماركت", "iOS"],
  },
  {
    name: "أمل سنتر (Android)",
    what: "سوبرماركت ومتجر الكتروني — تطبيق Android",
    href: "https://play.google.com/store/apps/details?id=com.alamal.center",
    icon: SiGoogleplay,
    tags: ["سوبرماركت", "Android"],
  },
  {
    name: "أمل سنتر (Web)",
    what: "المنصة والمتجر الإلكتروني على الويب",
    href: "https://www.amalcenter.app/",
    icon: ShoppingBag,
    tags: ["سوبرماركت", "متجر ويب"],
  },
  {
    name: "JAZ",
    what: "منصة ومعارض دولية لتنظيم الفعاليات",
    href: "https://www.jaz.iq/",
    icon: Layers3,
    tags: ["معارض", "منصة"],
  },
  {
    name: "METRIX",
    what: "نظام توليد خطط العمل بالذكاء الاصطناعي",
    href: "https://metrix-ruddy.vercel.app/",
    icon: Cpu,
    tags: ["ذكاء اصطناعي", "AI"],
  },
];

const STACK = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "React Native", icon: SiReact },
  { name: "Supabase", icon: SiSupabase },
  { name: "n8n", icon: SiN8n },
  { name: "Gemini API", icon: SiGooglegemini },
  { name: "TypeScript", icon: SiTypescript },
  { name: "PostgreSQL", icon: SiPostgresql },
];

const SCATTER = [
  "rotate-[1.5deg]",
  "-rotate-[1.25deg] translate-y-2",
  "rotate-[0.75deg] -translate-y-1",
  "-rotate-[2deg] translate-y-1",
  "rotate-[2deg]",
];

export default function AboutSnippet() {
  const fanRef = useRef<HTMLDivElement>(null);
  const [aligned, setAligned] = useState(false);

  useEffect(() => {
    const el = fanRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAligned(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="work" className="scroll-mt-24 border-b border-black/[0.06] bg-neutral-50/50 transition-colors dark:border-white/[0.06] dark:bg-ink-2/30">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <span className="lbl">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              من أنا
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug text-balance dark:text-white">
              شغل حقيقي، مو عرض تقديمي
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed text-neutral-600 md:col-span-2 text-sm sm:text-base dark:text-muted/90">
            <p>
              منتظر أحمد جواد — مهندس أتمتة وذكاء اصطناعي، مطوّر{" "}
              <span dir="ltr" className="font-semibold text-neutral-900 dark:text-white">full-stack</span>،
              طالب سنة رابعة علوم حاسوب بجامعة البصرة. شغلي كله عن بُعد من
              العراق، لعملاء عرب وأجانب.
            </p>
            <p>
              بنيت حتى الآن ثلاث منصات شغالة اليوم فعلاً: نظام كامل لمنظّم
              معارض دولية، متجر إلكتروني تابع له، ومنصة{" "}
              <span dir="ltr" className="font-semibold text-neutral-900 dark:text-white">METRIX</span>{" "}
              اللي تولّد خطط عمل بالذكاء الاصطناعي.
            </p>
            <ul className="flex flex-wrap gap-2.5 pt-2" dir="ltr">
              {STACK.map((tech) => (
                <li
                  key={tech.name}
                  className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 font-mono text-xs text-neutral-700 shadow-sm transition-colors hover:border-signal/40 hover:text-black dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-muted dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:border-signal/30 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <tech.icon size={13} className="text-neutral-900 transition-transform group-hover:scale-110 dark:text-paper" />
                  <span>{tech.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signal" />
              <span>أعمال ومنصات شغالة اليوم فعلاً</span>
            </h3>
            <span className="text-xs font-mono text-neutral-500 dark:text-muted">
              اضغط أي بطاقة للتجربة الحية ↗
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WORKS.map((w) => (
              <a
                key={w.href}
                href={w.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all duration-200 hover:border-black/30 hover:shadow-md dark:border-white/[0.08] dark:bg-ink-2/80 dark:hover:border-white/20 dark:hover:shadow-none"
              >
                {/* Flickering Grid effect at top of card - Orange */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 overflow-hidden rounded-t-2xl opacity-75 dark:opacity-60">
                  <div
                    className="h-full w-full"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
                    }}
                  >
                    <FlickeringGrid
                      color="rgb(252, 76, 1)"
                      squareSize={1.5}
                      gridGap={2.5}
                      flickerChance={0.3}
                      maxOpacity={0.65}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20 transition-all duration-300 group-hover:bg-signal group-hover:text-white group-hover:scale-105 dark:bg-signal/15 dark:text-signal dark:border-signal/30 dark:group-hover:bg-signal dark:group-hover:text-white">
                      <w.icon size={22} />
                    </div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100/80 text-neutral-500 transition-all duration-300 group-hover:bg-signal/10 group-hover:text-signal group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:bg-white/[0.04] dark:text-neutral-400 dark:group-hover:bg-signal/20 dark:group-hover:text-signal">
                      <ArrowUpRight size={13} strokeWidth={2.2} />
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-signal transition-colors">
                    {w.name}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-muted">
                    {w.what}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                  {w.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-white/[0.04] dark:text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
