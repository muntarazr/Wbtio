"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck, X, Clock, FileText, Compass, BadgePercent } from "lucide-react";
import { FlickeringGrid } from "./FlickeringGrid";

const SpecularButton = dynamic(() => import("./SpecularButton"), { ssr: false });

const PERKS = [
  { text: "مكالمة 60 دقيقة معك أنت", icon: Clock },
  { text: "تقرير مكتوب بصفحتين", icon: FileText },
  { text: "أول خطوة واضحة — شنو تسوي", icon: Compass },
  { text: "تنخصم من أي مشروع بيناتنا", icon: BadgePercent },
];

const inputCls =
  "w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/40 transition-all dark:border-white/[0.08] dark:bg-ink dark:text-paper dark:placeholder:text-muted/60";

export default function Consultation() {
  const [open, setOpen] = useState(false);

  return (
    <section id="consult" className="scroll-mt-24 border-b border-black/[0.06] bg-neutral-50/50 transition-colors dark:border-white/[0.06] dark:bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-colors sm:p-10 dark:rare-card dark:border-white/[0.08] dark:bg-ink-2/80">
          {/* Magic UI Flickering Grid effect - subtle top strip with soft downward fade */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 overflow-hidden rounded-t-3xl opacity-70 dark:opacity-70">
            {/* Light mode: crisp black dots */}
            <div
              className="h-full w-full dark:hidden"
              style={{
                maskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
              }}
            >
              <FlickeringGrid
                color="rgb(0, 0, 0)"
                squareSize={1.5}
                gridGap={2.5}
                flickerChance={0.3}
                maxOpacity={0.65}
                className="h-full w-full"
              />
            </div>
            {/* Dark mode: crisp white dots */}
            <div
              className="hidden h-full w-full dark:block"
              style={{
                maskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 100%)",
              }}
            >
              <FlickeringGrid
                color="rgb(255, 255, 255)"
                squareSize={1.5}
                gridGap={2.5}
                flickerChance={0.3}
                maxOpacity={0.65}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="lbl">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                استشارة متخصصة
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug text-balance dark:text-white">
                جلسة تشخيص — وين تضيع فلوسك ووقتك
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-muted/90">
                مكالمة 60 دقيقة أحچي فيها معك عن شغلك: شنو يعيد نفسه كل يوم، وشنو
                يفلت منك. وبعدها يوصلك تقرير مكتوب — شنو ينفع يتأتمت، كم ساعة وفلوس
                يوفر عليك، وشنو أول خطوة بالضبط.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {PERKS.map((perk) => (
                  <li
                    key={perk.text}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1.5 text-xs text-neutral-800 shadow-sm transition-colors dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-paper/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <perk.icon size={13} className="text-signal" />
                    <span>{perk.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-row items-center justify-between gap-6 border-t border-black/10 pt-6 md:flex-col md:border-s md:border-t-0 md:ps-8 md:pt-0 dark:border-white/[0.08]">
              <div className="flex items-baseline gap-2.5" dir="ltr">
                <span className="text-sm font-medium text-neutral-400 line-through dark:text-faint">$35</span>
                <span className="text-4xl font-extrabold tracking-tight text-signal md:text-5xl font-mono">
                  $20
                </span>
              </div>
              <SpecularButton
                onClick={() => setOpen(true)}
                size="md"
                radius={14}
                tint="#FC4C01"
                tintOpacity={1}
                textColor="#ffffff"
                lineColor="#ffffff"
                baseColor="#e04300"
                intensity={1.1}
                shineSize={16}
                shineFade={35}
                thickness={1.5}
                followMouse={true}
                proximity={250}
                className="font-bold shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_24px_rgba(252,76,1,0.45)]"
              >
                <CalendarCheck size={18} />
                <span>احجز الجلسة</span>
              </SpecularButton>
            </div>
          </div>
        </div>
      </div>

      {open && <BookingModal onClose={() => setOpen(false)} />}
    </section>
  );
}

function BookingModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    business: "",
    goal: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = [
      "طلب حجز جلسة تشخيص — $20",
      `الاسم: ${form.name}`,
      `واتساب: ${form.phone}`,
      `الإيميل: ${form.email || "—"}`,
      `نوع النشاط: ${form.business}`,
      `شنو أريد أحسّن: ${form.goal}`,
    ].join("\n");
    window.open(
      `https://wa.me/9647846295574?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener"
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all dark:bg-black/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="حجز جلسة تشخيص"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-2xl transition-colors sm:p-8 dark:border-white/[0.1] dark:bg-ink-2/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full opacity-20 blur-2xl"
          style={{ background: "#FC4C01" }}
        />

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">حجز جلسة التشخيص</h3>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full border border-black/10 bg-black/[0.03] p-2 text-neutral-600 transition-colors hover:bg-black/[0.06] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-muted dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={form.name} onChange={set("name")} placeholder="الاسم" className={inputCls} />
            <input required value={form.phone} onChange={set("phone")} placeholder="رقم واتساب" dir="ltr" className={`${inputCls} text-right`} />
          </div>
          <input type="email" value={form.email} onChange={set("email")} placeholder="الإيميل (اختياري)" dir="ltr" className={`${inputCls} text-right`} />
          <input required value={form.business} onChange={set("business")} placeholder="نوع النشاط (مطعم، متجر، عيادة...)" className={inputCls} />
          <textarea required value={form.goal} onChange={set("goal")} placeholder="شنو تريد تحسّن؟ طلبات، ردود، تقارير..." rows={3} className={inputCls} />
          <button
            type="submit"
            className="mt-2 rounded-xl bg-signal px-6 py-3 text-sm font-bold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:bg-[#e64500] hover:shadow-[0_0_20px_rgba(252,76,1,0.4)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            أرسل الطلب واتساب
          </button>
          <p className="text-center text-xs text-neutral-500 dark:text-muted/70">
            ينفتح واتساب والرسالة معبّاة بكل التفاصيل — بس اضغط إرسال.
          </p>
        </form>
      </div>
    </div>
  );
}
