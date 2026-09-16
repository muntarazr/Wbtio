"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck, ArrowLeft, Sparkles } from "lucide-react";

const Dither = dynamic(() => import("./Dither"), { ssr: false });
const SpecularButton = dynamic(() => import("./SpecularButton"), { ssr: false });

export default function Hero() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Initial check
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    // Observe changes to html class (theme toggle)
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-black/[0.06] bg-white transition-colors dark:border-white/[0.06] dark:bg-ink">
      {/* Dither Wave Canvas — Positioned as an ambient visual on the side/top to prevent text interference */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(ellipse at 85% 20%, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 85% 20%, black 25%, transparent 75%)",
        }}
      >
        <div className="h-full w-full opacity-40 dark:opacity-50">
          <Dither
            key={isDark ? "dark" : "light"}
            waveColor={isDark ? [0.99, 0.35, 0.05] : [0.85, 0.3, 0.05]}
            backgroundColor={isDark ? [0.04, 0.04, 0.05] : [0.96, 0.95, 0.93]}
            disableAnimation={false}
            enableMouseInteraction={false}
            mouseRadius={0}
            colorNum={isDark ? 4 : 3}
            pixelSize={2.5}
            waveAmplitude={0.35}
            waveFrequency={2.8}
            waveSpeed={0.045}
          />
        </div>
      </div>

      {/* Rare UI Ambient Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 z-0 h-[420px] w-full max-w-5xl -translate-x-1/2 opacity-60 blur-3xl dark:opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 25%, rgba(252, 76, 1, 0.15), rgba(252, 76, 1, 0.02) 50%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Pill Badge with Sparkles Icon */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-1 text-[12px] font-medium text-neutral-800 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-ink-2/80 dark:text-paper/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Sparkles size={14} className="text-signal" />
          <span className="font-mono text-[11px] tracking-wide text-signal">
            wbtio
          </span>
          <span className="text-neutral-300 dark:text-white/20">|</span>
          <span>أنظمة وأتمتة تمشي لحالها</span>
        </div>

        <h1 className="max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-[1.3] sm:leading-[1.22] text-balance dark:text-white">
          شغلك يقدر يمشي لحاله — <br />
          <span className="bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-600 bg-clip-text text-transparent dark:from-white dark:via-paper dark:to-muted">
            حتى وأنت مو موجود
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-neutral-700 dark:text-muted/95">
          أنا منتظر أحمد جواد، من البصرة. أبني لأصحاب الأعمال مواقع ومتاجر
          وتطبيقات — والشغل اللي يعيد نفسه كل يوم، مثل الرد على الزبائن وتسجيل
          الطلبات، أحوله إلى نظام يمشي لحاله. بنيت ثلاث منصات شغالة اليوم مع ناس
          حقيقيين.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <SpecularButton
            href="#consult"
            size="md"
            radius={14}
            tint="#FC4C01"
            tintOpacity={1}
            textColor="#ffffff"
            lineColor="#ffffff"
            baseColor="#e04300"
            intensity={1.2}
            shineSize={18}
            shineFade={35}
            thickness={1.5}
            followMouse={true}
            proximity={300}
            autoAnimate={false}
            className="font-bold shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_28px_rgba(252,76,1,0.45)]"
          >
            <CalendarCheck size={18} />
            <span>احجز جلسة التشخيص — $20</span>
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          </SpecularButton>

          <SpecularButton
            href="#work"
            size="md"
            radius={14}
            tint={isDark ? "#121212" : "#f5f5f5"}
            tintOpacity={1}
            textColor={isDark ? "#f4f1ec" : "#171717"}
            lineColor={isDark ? "#ffffff" : "#000000"}
            baseColor={isDark ? "#2a2a2a" : "#d4d4d4"}
            intensity={0.65}
            shineSize={12}
            shineFade={45}
            thickness={1}
            followMouse={true}
            proximity={200}
            autoAnimate={false}
            className="border border-black/10 dark:border-white/[0.08]"
          >
            <span>شوف الشغل الحقيقي</span>
          </SpecularButton>
        </div>
      </div>
    </section>
  );
}
