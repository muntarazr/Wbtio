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
  'أتمتة جاهزة':    { bg: '#FFF7ED', accent: '#EA580C' },
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

/** أرخص درجة — هي المعروضة على البطاقة */
export const entryTier = (item) =>
  (item.tiers || []).reduce((min, t) => (!min || t.price < min.price ? t : min), null);

/** @param {object} item @param {{rate:number}} fx @param {string} logoDataUri */
export function renderCard(item, fx, logoDataUri) {
  const t = themeFor(item);
  const badge = item.kind === 'payment_tool' ? 'أداة دفع — ليست خدمة'
              : item.kind === 'subscription' ? 'باقة شهرية'
              : item.cat;

  const tiers = item.tiers || [];
  const entry = entryTier(item);
  const multi = tiers.length > 1;

  let priceBlock;
  if (entry) {
    priceBlock = `
      ${multi ? '<div class="from">يبدأ من</div>' : ''}
      <div class="usd"><span class="cur">$</span>${entry.price.toLocaleString('en-US')}${
        item.kind === 'subscription' ? '<span class="per">/شهر</span>' : ''}</div>
      <div class="iqd">${toIQD(entry.price, fx.rate)} د.ع</div>`;
  } else if (item.price != null) {
    priceBlock = `<div class="usd"><span class="cur">$</span>${item.price.toLocaleString('en-US')}</div>
      <div class="iqd">${toIQD(item.price, fx.rate)} د.ع</div>`;
  } else {
    priceBlock = `<div class="open">${item.price_label}</div>`;
  }

  const body = multi
    ? `<div class="tiers">${tiers.map(tr => `
        <div class="tier">
          <span class="tn">${tr.name}${tr.market === 'GC' ? ' <em>خليج</em>' : ''}</span>
          <span class="tp">$${tr.price.toLocaleString('en-US')}<b>${toIQD(tr.price, fx.rate)} د.ع</b></span>
        </div>`).join('')}</div>`
    : entry
      ? `<ul>${(entry.includes || []).slice(0, 4).map(b => `<li><span class="tick">✓</span>${b}</li>`).join('')}</ul>`
      : '';

  const metaLine = entry && entry.delivery
    ? (item.kind === 'product' ? `التسليم ${entry.delivery}` : entry.delivery)
    : (item.unit || '');

  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<style>
@font-face { font-family:"Jawhara"; src:url("file:///Users/wbtio/Library/Fonts/MSjawhara-Bold.ttf"); font-weight:700; }
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1200px;background:${t.bg};
  font-family:"SF Arabic","Geeza Pro",system-ui,sans-serif;
  color:${INK};display:flex;flex-direction:column;padding:80px;position:relative;overflow:hidden}
.bar{position:absolute;inset:auto 0 0 0;height:8px;background:${t.accent}}
.badge{align-self:flex-start;font-weight:600;font-size:26px;color:${t.accent};
  background:${t.accent}1A;border:2px solid ${t.accent}33;border-radius:999px;padding:12px 30px}
h1{font-family:"Jawhara","SF Arabic",sans-serif;font-size:${item.name.length > 28 ? 66 : 78}px;
  line-height:1.2;margin-top:38px;letter-spacing:-1px}
.short{font-size:32px;line-height:1.5;color:${MUTED};margin-top:24px;max-width:940px}
.tiers{margin-top:40px;display:flex;flex-direction:column;gap:2px}
.tier{display:flex;align-items:baseline;justify-content:space-between;gap:24px;
  padding:18px 0;border-bottom:2px solid #0000000D}
.tier:last-child{border-bottom:0}
.tn{font-size:29px;color:${INK};font-weight:600}
.tn em{font-style:normal;font-size:20px;color:#fff;background:${t.accent};
  border-radius:6px;padding:3px 10px;margin-inline-start:8px;vertical-align:3px}
.tp{font-family:"Jawhara","SF Arabic",sans-serif;font-size:34px;white-space:nowrap;text-align:left}
.tp b{display:block;font-family:"SF Arabic",sans-serif;font-weight:400;font-size:21px;color:${DIM};margin-top:2px}
ul{list-style:none;margin-top:40px;display:flex;flex-direction:column;gap:20px}
li{font-size:29px;color:${MUTED};display:flex;align-items:center;gap:18px}
.tick{width:36px;height:36px;flex:none;border-radius:50%;background:${t.accent};
  color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center}
.foot{margin-top:auto;padding-top:36px;border-top:2px solid #00000014;
  display:flex;align-items:flex-end;justify-content:space-between}
.brand{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.brand img{width:72px;height:72px;border-radius:16px}
.sku{font-size:23px;color:${DIM};letter-spacing:2px}
.price{text-align:right}
.from{font-size:24px;color:${DIM};margin-bottom:2px}
.usd{font-family:"Jawhara","SF Arabic",sans-serif;font-size:96px;line-height:1;letter-spacing:-3px}
.cur{font-size:56px;color:${DIM};margin-inline-end:6px}
.per{font-family:"SF Arabic",sans-serif;font-size:30px;color:${DIM};letter-spacing:0}
.open{font-family:"Jawhara","SF Arabic",sans-serif;font-size:50px;line-height:1.2;max-width:540px}
.iqd{font-size:32px;color:${DIM};margin-top:10px}
.meta{font-size:23px;color:${t.accent};margin-top:14px}
</style></head><body>
<div class="badge">${badge}</div>
<h1>${item.name}</h1>
${(item.short || item.note) ? `<p class="short">${item.short || item.note}</p>` : ''}
${body}
<div class="foot">
  <div class="price">${priceBlock}${metaLine ? `<div class="meta">${metaLine}</div>` : ''}</div>
  <div class="brand"><img src="${logoDataUri}" alt="wbtio"><span class="sku">${item.sku}</span></div>
</div>
<div class="bar"></div>
</body></html>`;
}
