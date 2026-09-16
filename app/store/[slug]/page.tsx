import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProductSlugs, getProductBySlug, getProducts } from "../../lib/items";
import { discountRate, discountedPrice } from "../../lib/discount";
import { ArrowRight, ArrowLeft, Clock, CheckCircle2, Sparkles, Send } from "lucide-react";

type Params = { slug: string };
type SearchParams = { tier?: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "غير موجود · wbtio" };
  }
  return {
    title: `${product.name} · wbtio`,
    description: product.short,
  };
}

function formatPrice(price: number, market: string): string {
  if (market === "IQ") {
    const iqd = price * 1320;
    return `$${price} · ${iqd.toLocaleString("en-US")} د.ع`;
  }
  return `$${price}`;
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const tierIndex = resolvedSearchParams.tier
    ? Math.max(
        0,
        Math.min(
          parseInt(resolvedSearchParams.tier, 10) || 0,
          product.tiers.length - 1
        )
      )
    : 0;
  const selectedTier = product.tiers[tierIndex];

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.cat === product.cat && p.sku !== product.sku)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <Link
        href="/store"
        className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 transition-colors hover:text-black dark:text-muted dark:hover:text-white"
      >
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        <span>العودة للمتجر</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        <div className="md:order-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition-colors dark:border-white/[0.08] dark:bg-ink-2/60 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="md:order-1">
          <div className="mb-2 font-mono text-xs uppercase tracking-wider text-signal">
            {product.cat}
          </div>
          <h1 className="mb-3 text-3xl font-bold text-neutral-900 md:text-4xl font-arabic dark:text-white">
            {product.name}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-neutral-600 font-arabic dark:text-muted">
            {product.short}
          </p>

          <form
            id="tier-form"
            method="GET"
            className="space-y-3 mb-8"
          >
            {product.tiers.map((tier, idx) => (
              <label
                key={idx}
                className={`group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  idx === tierIndex
                    ? "border-signal bg-signal/[0.07] shadow-[0_0_20px_rgba(252,76,1,0.15)]"
                    : "border-black/10 bg-white hover:border-black/20 dark:border-white/[0.08] dark:bg-ink-2/50 dark:hover:border-white/[0.18] dark:hover:bg-ink-2"
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={String(idx)}
                  defaultChecked={idx === tierIndex}
                  className="mt-1 h-4 w-4 accent-signal"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-neutral-900 font-arabic dark:text-white">
                        {tier.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-muted">
                        <Clock size={12} className="text-signal" />
                        <span>{tier.delivery} · {tier.hours} ساعة عمل</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-base font-bold text-signal whitespace-nowrap">
                      {discountRate(tier.price) > 0 && (
                        <span className="block text-xs font-normal text-neutral-400 line-through dark:text-muted/50">
                          ${tier.price}
                        </span>
                      )}
                      {formatPrice(discountedPrice(tier.price), tier.market)}
                    </div>
                  </div>
                  {tier.includes.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-xs text-neutral-600 font-arabic dark:text-muted">
                      {tier.includes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={12} className="flex-none text-signal" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {idx === tierIndex && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-signal font-arabic">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                      الخيار المختار
                    </div>
                  )}
                </div>
              </label>
            ))}
            <button
              type="submit"
              className="w-full rounded-xl border border-black/10 bg-black/[0.03] py-2.5 text-xs font-semibold text-neutral-800 hover:bg-black/[0.06] transition-all font-arabic dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.08]"
            >
              تحديث السعر
            </button>
          </form>

          <a
            href={`mailto:muntarazr@gmail.com?subject=طلب: ${encodeURIComponent(
              product.name
            )} - ${encodeURIComponent(selectedTier.name)}&body=مرحباً، أريد طلب هذه الخدمة بالدرجة: ${selectedTier.name} بسعر ${formatPrice(discountedPrice(selectedTier.price), selectedTier.market)}`}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-8 py-3.5 text-sm font-bold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-200 hover:bg-[#e64500] hover:shadow-[0_0_28px_rgba(252,76,1,0.45)] active:scale-95 font-arabic md:w-auto"
          >
            <Send size={16} />
            <span>طلب الخدمة الآن</span>
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          </a>
        </div>
      </div>

      <section className="mt-16 max-w-3xl border-t border-black/[0.06] pt-10 dark:border-white/[0.06]">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-neutral-900 font-arabic dark:text-white">
          تفاصيل الخدمة
        </h2>
        <div className="text-sm leading-relaxed text-neutral-600 whitespace-pre-line font-arabic dark:text-muted">
          {product.desc}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-black/[0.06] pt-10 dark:border-white/[0.06]">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-neutral-900 font-arabic dark:text-white">
            خدمات ذات صلة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedProducts.map((p) => (
              <Link
                key={p.sku}
                href={`/store/${p.slug}`}
                className="group relative flex flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-md dark:border-white/[0.08] dark:bg-ink-2/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:hover:bg-ink-2"
              >
                <h3 className="font-bold text-neutral-900 transition-colors group-hover:text-signal font-arabic dark:text-white">
                  {p.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs text-neutral-600 font-arabic dark:text-muted">
                  {p.short}
                </p>
                <div className="mt-4 flex items-baseline gap-2 font-mono text-xs font-bold text-signal">
                  {discountRate(p.basePrice) > 0 && (
                    <span className="font-normal text-neutral-400 line-through dark:text-muted/50">
                      ${p.basePrice}{" "}
                    </span>
                  )}
                  {formatPrice(discountedPrice(p.basePrice), p.baseMarket)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
