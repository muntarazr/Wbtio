"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import ThemeToggle from "./ThemeToggle";

const SpecularButton = dynamic(() => import("./SpecularButton"), { ssr: false });

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl transition-colors dark:border-white/[0.06] dark:bg-ink/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          aria-label="wbtio — الرئيسية"
          className="group flex items-center gap-3 rounded-xl transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          <img
            src="/brand/wbtio-logo-original.png"
            alt="wbtio — وبيتو"
            className="h-10 w-auto object-contain transition-all dark:invert"
          />
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-xs font-semibold text-neutral-600 dark:text-muted md:flex">
            <Link href="/#consult" className="transition-colors hover:text-black dark:hover:text-white">
              استشارة
            </Link>
            <Link href="/#work" className="transition-colors hover:text-black dark:hover:text-white">
              الأعمال الحقيقية
            </Link>
            <Link href="/store" className="transition-colors hover:text-black dark:hover:text-white">
              الخدمات
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SpecularButton
              href="/store"
              size="sm"
              radius={999}
              tint="#FC4C01"
              tintOpacity={1}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#e04300"
              intensity={0.9}
              shineSize={14}
              shineFade={35}
              thickness={1}
              followMouse={true}
              proximity={180}
              className="px-5 py-2 text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(252,76,1,0.45)]"
            >
              <span>تصفح المتجر</span>
              <span className="text-[10px] opacity-80">←</span>
            </SpecularButton>
          </div>
        </div>
      </div>
    </header>
  );
}
