"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../lib/items";
import { 
  Sparkles, 
  Rocket, 
  Globe, 
  Smartphone, 
  Cpu, 
  Boxes, 
  Database, 
  BrainCircuit,
  LayoutGrid
} from "lucide-react";

type Props = {
  products: Product[];
};

const CATEGORY_ORDER = [
  "الكل",
  "ابدأ من هنا",
  "ويب",
  "موبايل",
  "أتمتة",
  "أتمتة جاهزة",
  "بيانات",
  "ذكاء اصطناعي",
];

const CAT_ICONS: Record<string, any> = {
  "الكل": LayoutGrid,
  "ابدأ من هنا": Rocket,
  "ويب": Globe,
  "موبايل": Smartphone,
  "أتمتة": Cpu,
  "أتمتة جاهزة": Boxes,
  "بيانات": Database,
  "ذكاء اصطناعي": BrainCircuit,
};

export default function ProductGrid({ products }: Props) {
  const [activeCategory, setActiveCategory] = useState("الكل");

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.cat))];
    return CATEGORY_ORDER.filter((c) => c === "الكل" || cats.includes(c));
  }, [products]);

  const grouped = useMemo(() => {
    if (activeCategory === "الكل") {
      const map: Record<string, Product[]> = {};
      for (const p of products) {
        if (!map[p.cat]) map[p.cat] = [];
        map[p.cat].push(p);
      }
      return map;
    }
    const filtered = products.filter((p) => p.cat === activeCategory);
    const map: Record<string, Product[]> = {};
    if (filtered.length > 0) {
      map[activeCategory] = filtered;
    }
    return map;
  }, [products, activeCategory]);

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-muted font-arabic">
        لا توجد منتجات حالياً.
      </div>
    );
  }

  return (
    <>
      <nav className="flex gap-2 overflow-x-auto pb-4 [scrollbar-width:none]">
        {categories.map((cat) => {
          const Icon = CAT_ICONS[cat] || Sparkles;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 font-arabic ${
                activeCategory === cat
                  ? "bg-signal text-white shadow-[0_1px_3px_rgba(0,0,0,0.2),0_0_16px_rgba(252,76,1,0.3)] border border-signal"
                  : "border border-black/10 bg-white text-neutral-600 hover:border-black/20 hover:text-black dark:border-white/[0.08] dark:bg-ink-2/80 dark:text-muted dark:hover:border-white/[0.2] dark:hover:text-white"
              }`}
            >
              <Icon size={13} className={activeCategory === cat ? "text-white" : "text-signal"} />
              <span>{cat}</span>
              <span className="mr-0.5 text-[11px] opacity-75">
                ({cat === "الكل" ? products.length : products.filter((p) => p.cat === cat).length})
              </span>
            </button>
          );
        })}
      </nav>

      {Object.entries(grouped).map(([cat, items]) => {
        const Icon = CAT_ICONS[cat] || Sparkles;
        return (
          <section key={cat} className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-signal/15 text-signal border border-signal/20">
                <Icon size={12} />
              </div>
              <h2 className="text-sm font-bold tracking-wide text-neutral-900 uppercase font-arabic dark:text-white">
                {cat}
              </h2>
              <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
