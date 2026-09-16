import type { Metadata } from "next";
import { getProducts } from "../lib/items";
import ProductGrid from "../components/ProductGrid";

export const metadata: Metadata = {
  title: "wbtio — الخدمات",
  description: "خدمات برمجة وأتمتة أعمال — مواقع، متاجر، تطبيقات، أتمتة جاهزة.",
};

export default async function StorePage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-[#fbfbfb] transition-colors dark:bg-ink">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <span className="lbl">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            المتجر والخدمات
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
            حلول أتمتة وتطوير أعمال جاهزة
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-muted">
            اختر الخدمة المناسبة لنشاطك، كل خدمة تتضمن تسليم كامل وتدريب مجاني.
          </p>
        </div>

        <ProductGrid products={products} />

        <footer className="mt-14 border-t border-black/[0.06] py-8 text-center font-mono text-xs text-neutral-500 leading-relaxed dark:border-white/[0.06] dark:text-muted/60">
          {products.length} خدمة متوفرة · سعر الصرف 1,320 د.ع/$ · الأسعار مُضمَّنة عمولة الدفع 3.5%
        </footer>
      </main>
    </div>
  );
}
