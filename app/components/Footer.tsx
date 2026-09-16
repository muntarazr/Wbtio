export default function Footer() {
  return (
    <footer className="relative border-t border-black/[0.06] bg-neutral-50/50 transition-colors dark:border-white/[0.06] dark:bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between dark:text-muted/70">
        <div className="flex items-center gap-2 font-medium text-neutral-700 dark:text-muted">
          <span>© {new Date().getFullYear()} wbtio</span>
          <span className="text-neutral-300 dark:text-white/20">·</span>
          <span>منتظر أحمد جواد</span>
        </div>
        <div className="font-mono text-xs text-neutral-400 dark:text-muted/60" dir="ltr">
          wbtio · systems that run themselves
        </div>
      </div>
    </footer>
  );
}
