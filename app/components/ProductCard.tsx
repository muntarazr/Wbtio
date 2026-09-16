import Link from "next/link";
import type { Product } from "../lib/items";
import { discountRate, discountedPrice } from "../lib/discount";
import { ArrowLeft, Layers, Sparkles } from "lucide-react";

type Props = {
  product: Product;
};

function formatPrice(price: number, market: string): string {
  if (market === "IQ") {
    const iqd = price * 1320;
    return `$${price} · ${iqd.toLocaleString("en-US")} د.ع`;
  }
  return `$${price}`;
}

export default function ProductCard({ product }: Props) {
  const firstTier = product.tiers[0];
  const hasMultipleTiers = product.tiers.length > 1;
  const market = firstTier?.market ?? product.baseMarket;
  const rate = discountRate(product.basePrice);
  const price = discountedPrice(product.basePrice);

  return (
    <Link
      href={`/store/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-signal/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-white/[0.08] dark:bg-ink-2/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:bg-ink-2 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(252,76,1,0.15)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-ink-3">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 dark:from-ink" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {rate > 0 && (
            <span className="flex-none inline-flex items-center gap-1 rounded-full bg-signal px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Sparkles size={10} />
              أول عميل −{Math.round(rate * 100)}%
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-medium text-neutral-500 uppercase tracking-wider dark:text-muted/70">{product.cat}</span>
          {hasMultipleTiers && (
            <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-muted">
              <Layers size={10} className="text-signal" />
              {product.tiers.length} خيارات
            </span>
          )}
        </div>
        <h3 className="mb-2 line-clamp-1 font-arabic text-base font-bold text-neutral-900 transition-colors group-hover:text-signal dark:text-white">
          {product.name}
        </h3>
        <p className="mb-5 line-clamp-2 font-arabic text-xs leading-relaxed text-neutral-600 dark:text-muted">
          {product.short}
        </p>
        <div className="mt-auto flex items-baseline justify-between border-t border-black/[0.06] pt-3.5 dark:border-white/[0.06]">
          <div className="flex items-baseline gap-2 font-mono">
            {rate > 0 && (
              <span className="text-xs text-neutral-400 line-through dark:text-muted/50">
                ${product.basePrice}
              </span>
            )}
            <span className="text-sm font-bold text-signal">
              {formatPrice(price, market)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition-transform group-hover:-translate-x-1 group-hover:text-signal dark:text-muted/60">
            <span>تفاصيل</span>
            <ArrowLeft size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
