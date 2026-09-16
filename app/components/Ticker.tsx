const TEXT =
  "خصم أول طلب: حتى 30% حسب حجم الشغل — كل الأسعار المعروضة بعد الخصم";

export default function Ticker() {
  return (
    <div
      className="relative overflow-hidden border-b border-black/[0.06] bg-neutral-100/90 py-2 backdrop-blur-md transition-colors dark:border-white/[0.06] dark:bg-ink-2/80"
      aria-label={TEXT}
    >
      <div className="ticker flex w-max items-center">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center" aria-hidden={half === 1}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="mx-6 flex items-center gap-2 whitespace-nowrap text-xs text-neutral-600 dark:text-muted">
                <span className="inline-flex items-center rounded-full bg-signal/15 px-2.5 py-0.5 text-[11px] font-bold text-signal border border-signal/25">
                  خصم أول طلب
                </span>
                <span className="text-neutral-800 dark:text-paper/80">
                  حتى 30% حسب حجم الشغل — كل الأسعار المعروضة بعد الخصم
                </span>
                <span className="text-neutral-400 dark:text-white/20 mr-4">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
