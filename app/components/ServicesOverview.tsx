import Link from "next/link";
import { getTopServices } from "../lib/catalog";
import type { Service } from "../lib/catalog";
import { 
  MessageSquare, 
  Bot, 
  Mail, 
  BarChart3, 
  Database, 
  Receipt, 
  ArrowLeft,
  Sparkles
} from "lucide-react";

const SERVICE_META: Record<string, { img: string; slug: string; icon: any }> = {
  A01: { img: "/wayl-images/WA-01.png", slug: "wa-01", icon: MessageSquare },
  A02: { img: "/wayl-images/BOT-01.png", slug: "bot-01", icon: Bot },
  A03: { img: "/wayl-images/PK-MAIL.png", slug: "pk-mail", icon: Mail },
  A04: { img: "/wayl-images/PK-RPT.png", slug: "pk-rpt", icon: BarChart3 },
  A05: { img: "/wayl-images/AUTO-01.png", slug: "auto-01", icon: Database },
  A06: { img: "/wayl-images/PK-INV.png", slug: "pk-inv", icon: Receipt },
};

const DISPLAY: Record<string, { title: string; why: string }> = {
  A01: { title: "طلبات الواتساب تنسجل لحالها", why: "ما يضيع طلب ولا ينسى بعد اليوم" },
  A02: { title: "رد آلي يجاوب زبائنك 24 ساعة", why: "حتى بنص الليل، الزبون ياخذ جواب" },
  A03: { title: "رسائلك تنفرز لحالها", why: "المهم يوصلك أول شي، والباقي بترتيب" },
  A04: { title: "تقرير شغلك يوصلك كل أسبوع", why: "أرقامك قدامك، بدون حساب بالإيد" },
  A05: { title: "تعبئة أي زبون تنحفظ بجدول لحالها", why: "بدل ما تنسخ البيانات بالإيد رسالة رسالة" },
  A06: { title: "النظام يتابع الفواتير واللي ما خلصوا الدفع", why: "تذكيرات تلقائية تحفظ حقك بدون إحراج" },
};

function formatPrice(pr: [number, number]): string {
  return `$${pr[0]} – $${pr[1]}`;
}

export default async function ServicesOverview() {
  const services: Service[] = await getTopServices(6);

  return (
    <section className="border-b border-black/[0.06] bg-white transition-colors dark:border-white/[0.06] dark:bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10">
          <span className="lbl">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            الخدمات الأكثر طلباً
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug text-balance dark:text-white">
            من الفكرة إلى نظام يمشي لحاله
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-muted/90">
            أمثلة على الشغل اللي نسويه لأصحاب الأعمال. كل خدمة وياها سعر واضح،
            والرقم النهائي نتفق عليه قبل ما نبدأ — ماكو مفاجآت.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((s) => {
            const meta = SERVICE_META[s.id];
            const display = DISPLAY[s.id];
            return (
              <Link
                key={s.id}
                href={meta ? `/store/${meta.slug}` : "/store"}
                className="group relative flex items-center gap-4 rounded-2xl border border-black/10 bg-neutral-50/70 p-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/40 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-white/[0.08] dark:bg-ink-2/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:bg-ink-2 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              >
                {meta && (
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl border border-black/10 bg-neutral-100 dark:border-white/[0.08] dark:bg-ink">
                    <img
                      src={meta.img}
                      alt={display?.title ?? s.n}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm sm:text-base font-bold text-neutral-900 transition-colors group-hover:text-signal dark:text-white">
                    {display?.title ?? s.n}
                  </h3>
                  {display && (
                    <p className="mt-1 truncate text-xs text-neutral-600 dark:text-muted">
                      {display.why}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-signal" dir="ltr">
                      {formatPrice(s.pr.IQ)}
                    </span>
                  </div>
                </div>
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-neutral-600 transition-colors group-hover:border-signal/30 group-hover:text-signal dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-muted">
                  <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/store"
            className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-100 px-5 py-2.5 text-xs font-bold text-neutral-900 shadow-sm transition-all hover:border-signal/50 hover:bg-neutral-200 hover:text-signal dark:border-white/[0.08] dark:bg-ink-2/80 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-ink-3"
          >
            <span>كل الخدمات والأسعار في المتجر</span>
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
