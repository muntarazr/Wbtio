'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const FX = 1320;
const GROUPS = ['مداخل رخيصة', 'الخدمات', 'الباقات الشهرية', 'أدوات الدفع'];

const CAT_COLORS: Record<string, string> = {
  مدخل: '#2563EB',
  ويب: '#0891B2',
  موبايل: '#D97706',
  أتمتة: '#059669',
  'أتمتة جاهزة': '#059669',
  بيانات: '#7C3AED',
  'ذكاء اصطناعي': '#DB2777',
  اشتراك: '#475569',
  'أداة دفع': '#52525B',
};

type Tier = {
  name: string;
  price: number | null;
  iqd: string;
  market: string;
  hours: number;
  delivery: string;
  rate: number | null;
  label: string;
};

type Item = {
  sku: string;
  name: string;
  desc: string;
  cat: string;
  kind: string;
  group: string;
  tiers: Tier[];
};

type RawProduct = {
  sku: string;
  kind: string;
  cat: string;
  name: string;
  short: string;
  desc: string;
  tiers: Array<{
    name: string;
    price: number | null;
    hours: number | null;
    delivery: string;
    market: string;
  }>;
};

type RawSubscription = {
  sku: string;
  kind: string;
  cat: string;
  name: string;
  short: string;
  desc: string;
  tiers: Array<{
    name: string;
    price: number | null;
    hours: number | null;
    delivery: string;
    market: string;
  }>;
};

type RawPayment = {
  sku: string;
  kind: string;
  name: string;
  price_label: string;
  note: string;
};

type ItemsData = {
  products: RawProduct[];
  subscriptions: RawSubscription[];
  payment_items: RawPayment[];
};

function buildTier(
  name: string,
  price: number | null,
  hours: number | null,
  market: string,
  delivery: string,
  label?: string,
): Tier {
  const safeHours = hours || 0;
  const computedRate =
    price != null && safeHours > 0 ? Number((price / safeHours).toFixed(1)) : null;
  return {
    name,
    price,
    iqd: price != null ? (price * FX).toLocaleString('en-US') + ' د.ع' : '',
    market,
    hours: safeHours,
    delivery,
    rate: computedRate,
    label: label || '',
  };
}

function transformItems(raw: ItemsData): Item[] {
  const items: Item[] = [];

  for (const p of raw.products ?? []) {
    const group = p.cat === 'مدخل' ? 'مداخل رخيصة' : 'الخدمات';
    items.push({
      sku: p.sku,
      name: p.name,
      desc: (p.short || p.desc || '').split('\n')[0],
      cat: p.cat,
      kind: p.kind || 'product',
      group,
      tiers: (p.tiers ?? []).map((t) =>
        buildTier(t.name, t.price, t.hours, t.market, t.delivery),
      ),
    });
  }

  for (const s of raw.subscriptions ?? []) {
    items.push({
      sku: s.sku,
      name: s.name,
      desc: (s.short || '').split('\n')[0],
      cat: s.cat,
      kind: s.kind || 'subscription',
      group: 'الباقات الشهرية',
      tiers: (s.tiers ?? []).map((t) =>
        buildTier(t.name, t.price, t.hours, t.market, t.delivery),
      ),
    });
  }

  for (const p of raw.payment_items ?? []) {
    items.push({
      sku: p.sku,
      name: p.name,
      desc: p.note || '',
      cat: 'أداة دفع',
      kind: p.kind || 'payment_tool',
      group: 'أدوات الدفع',
      tiers: [buildTier(p.price_label || '', null, null, '', '', p.price_label)],
    });
  }

  return items;
}

export default function PickPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const outRef = useRef<HTMLTextAreaElement>(null);

  const tierKey = useCallback((sku: string, name: string) => `${sku}|${name}`, []);

  const flatItems = useMemo(
    () => items.flatMap((i) => i.tiers.map((t) => ({ ...i, tier: t }))),
    [items],
  );

  useEffect(() => {
    fetch('/api/wayl-pick')
      .then((r) => r.json())
      .then((data: ItemsData) => {
        setItems(transformItems(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const sel = new Set<string>();
    flatItems
      .filter((x) => x.kind !== 'payment_tool' && x.tier.market !== 'GC')
      .forEach((x) => sel.add(tierKey(x.sku, x.tier.name)));
    setSelected(sel);
  }, [items, flatItems, tierKey]);

  const updateOutput = useCallback(() => {
    const picked = flatItems.filter((x) => selected.has(tierKey(x.sku, x.tier.name)));
    const countEl = document.getElementById('count');
    if (countEl) {
      countEl.textContent =
        picked.length + ' درجة · ' + new Set(picked.map((x) => x.sku)).size + ' منتج بـWayl';
    }

    const outEl = outRef.current;
    if (!outEl) return;

    if (!picked.length) {
      outEl.value = '';
      return;
    }

    const out = ['الخدمات المختارة للنشر على Wayl:', ''];
    for (const g of GROUPS) {
      const gi = picked.filter((x) => x.group === g);
      if (!gi.length) continue;
      out.push(g + ':');
      for (const sku of [...new Set(gi.map((x) => x.sku))]) {
        const rws = gi.filter((x) => x.sku === sku);
        out.push('  ▸ ' + rws[0].name + ' [' + sku + ']');
        rws.forEach((x) =>
          out.push(
            '      · ' + x.tier.name + ' — ' +
              (x.tier.price != null
                ? '$' + x.tier.price + ' / ' + x.tier.iqd + ' د.ع'
                : x.tier.label),
          ),
        );
      }
      out.push('');
    }

    const monthlyTotal = picked
      .filter((x) => x.kind === 'subscription' && x.tier.price != null)
      .reduce((sum, x) => sum + (x.tier.price as number), 0);

    out.push(
      'عدد المنتجات بـWayl: ' + new Set(picked.map((x) => x.sku)).size +
        ' · عدد الخيارات: ' + picked.length,
    );
    if (monthlyTotal) {
      out.push('مجموع الباقات الشهرية لو اشتراها عميل واحد: $' + monthlyTotal + '/شهر');
    }

    outEl.value = out.join('\n');
  }, [flatItems, selected, tierKey]);

  useEffect(() => {
    updateOutput();
  }, [updateOutput]);

  const setAll = useCallback(
    (on: boolean) => {
      setSelected(() => {
        const sel = new Set<string>();
        if (on) {
          flatItems.forEach((x) => sel.add(tierKey(x.sku, x.tier.name)));
        }
        return sel;
      });
    },
    [flatItems, tierKey],
  );

  const onlyIQ = useCallback(() => {
    setSelected(() => {
      const sel = new Set<string>();
      flatItems
        .filter((x) => x.kind !== 'payment_tool' && x.tier.market !== 'GC')
        .forEach((x) => sel.add(tierKey(x.sku, x.tier.name)));
      return sel;
    });
  }, [flatItems, tierKey]);

  const onlyEntry = useCallback(() => {
    setSelected(() => {
      const sel = new Set<string>();
      items.forEach((item) => {
        if (item.kind === 'payment_tool') return;
        const cheapest = item.tiers.reduce(
          (min, t) => (!min || (t.price ?? Infinity) < (min.price ?? Infinity) ? t : min),
          null as Tier | null,
        );
        if (cheapest) sel.add(tierKey(item.sku, cheapest.name));
      });
      return sel;
    });
  }, [items, tierKey]);

  const copyOut = useCallback(async () => {
    const el = outRef.current;
    if (!el || !el.value) {
      alert('ما محدَّد ولا خدمة.');
      return;
    }
    const btn = document.activeElement as HTMLButtonElement | null;
    try {
      await navigator.clipboard.writeText(el.value);
    } catch {
      el.removeAttribute('readonly');
      el.select();
      document.execCommand('copy');
      el.setAttribute('readonly', '');
    }
    if (btn) {
      const old = btn.textContent;
      btn.textContent = '✓ انتُسخ';
      setTimeout(() => {
        if (btn) btn.textContent = old;
      }, 1600);
    }
  }, []);

  const isSelected = (sku: string, name: string) => selected.has(tierKey(sku, name));

  const handleCheckboxChange = (sku: string, name: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(tierKey(sku, name)) : next.delete(tierKey(sku, name));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-paper font-arabic">
          اختيار الخدمات — متجر Wayl
        </h1>
        <p className="mt-2 text-muted font-arabic">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-paper font-arabic">
        اختيار الخدمات — متجر Wayl
      </h1>
      <p className="mt-2 text-muted font-arabic leading-relaxed">
        علّم <b>كل درجة</b> راح تنشرها. الدرجة هي «خيار المنتج» بـWayl.
        سعر الصرف {FX.toLocaleString('en-US')} د.ع/$ · الحد الأدنى $15/ساعة · 2026-08-24
      </p>

      <div className="sticky top-0 z-10 bg-ink/95 backdrop-blur py-4 border-b border-paper/10 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setAll(true)}
            className="px-4 py-2 rounded-lg border border-paper/10 bg-paper/5 text-paper hover:border-muted text-sm font-arabic transition-colors"
          >
            حدّد الكل
          </button>
          <button
            onClick={() => setAll(false)}
            className="px-4 py-2 rounded-lg border border-paper/10 bg-paper/5 text-paper hover:border-muted text-sm font-arabic transition-colors"
          >
            امسح الكل
          </button>
          <button
            onClick={onlyIQ}
            className="px-4 py-2 rounded-lg border border-paper/10 bg-paper/5 text-paper hover:border-muted text-sm font-arabic transition-colors"
          >
            العراق فقط
          </button>
          <button
            onClick={onlyEntry}
            className="px-4 py-2 rounded-lg border border-paper/10 bg-paper/5 text-paper hover:border-muted text-sm font-arabic transition-colors"
          >
            أرخص درجة فقط
          </button>
          <button
            onClick={copyOut}
            className="px-4 py-2 rounded-lg bg-signal text-white font-semibold text-sm font-arabic hover:opacity-90 transition-opacity"
          >
            📋 انسخ المحدَّد
          </button>
          <span id="count" className="mr-auto text-muted text-sm font-arabic font-mono" />
        </div>
      </div>

      {GROUPS.map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        if (!groupItems.length) return null;
        return (
          <section key={group} className="mb-10">
            <h2 className="text-lg font-semibold text-muted mb-3 font-arabic">{group}</h2>
            {group === 'أدوات الدفع' && (
              <p className="text-muted text-sm mb-3 font-arabic">
                خطوات دفع لا خدمات — انشرها فقط إذا تريد ترسل رابط دفع لكل مرحلة عقد.
              </p>
            )}
            <div className="space-y-3">
              {groupItems.map((item) => (
                <div
                  key={item.sku}
                  className="border border-paper/10 rounded-xl bg-ink overflow-hidden"
                >
                  <div className="p-4 border-b border-paper/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: CAT_COLORS[item.cat] || '#52525B' }}
                      />
                      <span className="font-semibold text-paper font-arabic">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-paper/70 text-sm mt-1 font-arabic line-clamp-2">
                      {item.desc}
                    </p>
                    <p className="text-muted text-xs mt-1 font-mono tracking-wider">
                      {item.sku}
                    </p>
                  </div>
                  <div>
                    {item.tiers.map((tier, idx) => {
                      const key = tierKey(item.sku, tier.name);
                      const checked = isSelected(item.sku, tier.name);
                      return (
                        <label
                          key={idx}
                          data-key={key}
                          className={`flex items-center gap-3 p-3 border-t border-paper/10 cursor-pointer transition-colors ${
                            checked ? 'bg-paper/5' : 'hover:bg-paper/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            data-key={key}
                            checked={checked}
                            onChange={(e) =>
                              handleCheckboxChange(item.sku, tier.name, e.target.checked)
                            }
                            className="w-5 h-5 cursor-pointer accent-signal flex-shrink-0"
                          />
                          <span className="flex-1 text-sm text-paper font-arabic">
                            {tier.name}
                            {tier.market === 'GC' && (
                              <span className="text-xs bg-ink text-paper border border-paper/20 rounded px-1.5 py-0.5 mr-2 inline-block">
                                خليج
                              </span>
                            )}
                            {tier.rate != null && (
                              <span className="text-xs text-muted mr-2">
                                {tier.hours} ساعة · ${tier.rate}/ساعة
                              </span>
                            )}
                          </span>
                          <span className="text-sm font-semibold text-paper whitespace-nowrap font-mono">
                            {tier.price != null ? (
                              <>
                                ${tier.price.toLocaleString('en-US')}
                                <span className="block text-xs text-muted font-normal">
                                  {tier.iqd}
                                </span>
                              </>
                            ) : (
                              tier.label
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <textarea
        id="out"
        ref={outRef}
        readOnly
        placeholder="النص المُولَّد يظهر هنا…"
        className="w-full mt-8 min-h-[170px] bg-ink border border-paper/10 rounded-xl p-4 font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto text-paper"
        dir="rtl"
      />
    </div>
  );
}
