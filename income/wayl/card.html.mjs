// بطاقة منتج متجر Wayl — 1200×1200
// خلفية فاتحة بلون الفئة · نص أسود · شعار wbtio
// لا تعدّل الأسعار هنا — مصدرها items.json

export const THEME = {
  'أتمتة':          { bg: '#ECFDF5', accent: '#059669' },
  'ويب':            { bg: '#ECFEFF', accent: '#0891B2' },
  'بيانات':         { bg: '#F5F3FF', accent: '#7C3AED' },
  'موبايل':         { bg: '#FFFBEB', accent: '#D97706' },
  'ذكاء اصطناعي':   { bg: '#FDF2F8', accent: '#DB2777' },
  'مدخل':           { bg: '#EFF6FF', accent: '#2563EB' },
  'اشتراك':         { bg: '#F1F5F9', accent: '#475569' },
  'أداة دفع':       { bg: '#FAFAFA', accent: '#52525B' },
};

const INK = '#0A0A0A';
const MUTED = '#3F3F46';
const DIM = '#71717A';

const themeFor = (item) =>
  item.kind === 'payment_tool' ? THEME['أداة دفع']
  : item.kind === 'subscription' ? THEME['اشتراك']
  : THEME[item.cat] || THEME['مدخل'];

export const toIQD = (usd, rate) => {
  const raw = usd * rate;
  const step = raw >= 100_000 ? 1000 : 100;      // المبالغ الصغيرة تُقرَّب لأقرب 100 لا 1000
  return (Math.round(raw / step) * step).toLocaleString('en-US');
};

/** @param {object} item @param {{rate:number}} fx @param {string} logoDataUri */
export function renderCard(item, fx, logoDataUri) {
  const t = themeFor(item);
  const badge = item.kind === 'payment_tool' ? 'أداة دفع — ليست خدمة'
              : item.kind === 'subscription' ? 'اشتراك شهري'
              : item.cat;

  const priceBlock = item.price != null
    ? `<div class="usd"><span class="cur">$</span>${item.price.toLocaleString('en-US')}</div>
       <div class="iqd">${toIQD(item.price, fx.rate)} د.ع</div>`
    : `<div class="open">${item.price_label}</div>`;

  const meta = [
    item.unit,
    item.delivery && (item.kind === 'product' ? `التسليم ${item.delivery}` : item.delivery),
  ].filter(Boolean).join(' · ');

  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<style>
@font-face { font-family:"Jawhara"; src:url("file:///Users/wbtio/Library/Fonts/MSjawhara-Bold.ttf"); font-weight:700; }
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1200px;background:${t.bg};
  font-family:"SF Arabic","Geeza Pro",system-ui,sans-serif;
  color:${INK};display:flex;flex-direction:column;padding:88px;position:relative;overflow:hidden}
.bar{position:absolute;inset:auto 0 0 0;height:8px;background:${t.accent}}
.badge{align-self:flex-start;font-weight:600;font-size:26px;color:${t.accent};
  background:${t.accent}1A;border:2px solid ${t.accent}33;border-radius:999px;padding:12px 30px}
h1{font-family:"Jawhara","SF Arabic",sans-serif;font-size:${item.name.length > 30 ? 68 : 80}px;line-height:1.22;margin-top:44px;letter-spacing:-1px}
.short{font-size:34px;line-height:1.55;color:${MUTED};margin-top:28px;max-width:900px}
ul{list-style:none;margin-top:44px;display:flex;flex-direction:column;gap:22px}
li{font-size:30px;color:${MUTED};display:flex;align-items:center;gap:18px}
.tick{width:38px;height:38px;flex:none;border-radius:50%;background:${t.accent};
  color:#fff;font-size:21px;display:flex;align-items:center;justify-content:center}
.foot{margin-top:auto;padding-top:44px;border-top:2px solid #00000014;
  display:flex;align-items:flex-end;justify-content:space-between}
.brand{display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.brand img{width:76px;height:76px;border-radius:16px}
.sku{font-size:24px;color:${DIM};letter-spacing:2px}
.price{text-align:right}
.usd{font-family:"Jawhara","SF Arabic",sans-serif;font-size:104px;line-height:1;letter-spacing:-3px}
.cur{font-size:60px;color:${DIM};margin-inline-end:6px}
.open{font-family:"Jawhara","SF Arabic",sans-serif;font-size:52px;line-height:1.2;color:${INK};max-width:520px}
.iqd{font-size:34px;color:${DIM};margin-top:12px}
.meta{font-size:24px;color:${t.accent};margin-top:16px}
</style></head><body>
<div class="badge">${badge}</div>
<h1>${item.name}</h1>
${(item.short || item.note) ? `<p class="short">${item.short || item.note}</p>` : ''}
${(item.bullets || []).length ? `<ul>${item.bullets.map(b => `<li><span class="tick">✓</span>${b}</li>`).join('')}</ul>` : ''}
<div class="foot">
  <div class="price">${priceBlock}${meta ? `<div class="meta">${meta}</div>` : ''}</div>
  <div class="brand"><img src="${logoDataUri}" alt="wbtio"><span class="sku">${item.sku}</span></div>
</div>
<div class="bar"></div>
</body></html>`;
}
