#!/usr/bin/env node
// مولّد متجر Wayl — صور + STORE.md + MARGINS.md + pick.html
// شغّله بعد أي تعديل سعر أو نص:  node income/wayl/render.mjs
// خيارات:  --only=SKU,SKU   صور محددة فقط (يتخطى توليد الملفات)

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { renderCard, toIQD, entryTier } from './card.html.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const IMAGES = path.join(DIR, 'images');
const BROWSER = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

const only = (process.argv.find(a => a.startsWith('--only=')) || '')
  .replace('--only=', '').split(',').filter(Boolean);

if (!fs.existsSync(BROWSER)) {
  console.error(`✗ المتصفح غير موجود: ${BROWSER}`);
  console.error('  عدّل ثابت BROWSER أعلاه إلى متصفح Chromium مثبَّت عندك.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.join(DIR, 'items.json'), 'utf8'));
const fx = data._meta.fx;
const FEE = 0.035;                       // عمولة Wayl — باقة البداية
const FLOOR = 15;                        // $/ساعة — الحد الأدنى المقبول

const logoDataUri = 'data:image/svg+xml;base64,' +
  fs.readFileSync(path.join(DIR, 'brand', 'logo-solid.svg')).toString('base64');

const ALL = [...data.products, ...data.subscriptions, ...data.payment_items];
const items = ALL.filter(i => !only.length || only.includes(i.sku));

// ── الصور ────────────────────────────────────────────────────────────────
fs.mkdirSync(IMAGES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wayl-'));

console.log(`سعر الصرف: ${fx.rate} د.ع/$ · ${fx.source}\n`);
const rows = [];

for (const item of items) {
  const html = path.join(tmp, `${item.sku}.html`);
  const out = path.join(IMAGES, `${item.sku}.png`);
  fs.writeFileSync(html, renderCard(item, fx, logoDataUri));

  try {
    execFileSync(BROWSER, [
      '--headless', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--default-background-color=FFFFFFFF',
      '--window-size=1200,1200',
      `--screenshot=${out}`,
      `file://${html}`,
    ], { stdio: 'pipe', timeout: 60_000 });
  } catch (err) {
    rows.push([item.sku, '—', '✗ فشل']);
    console.error(`✗ ${item.sku}: ${err.message.split('\n')[0]}`);
    continue;
  }

  const e = entryTier(item);
  const label = e ? `من $${e.price}` : item.price != null ? `$${item.price}` : item.price_label;
  rows.push([item.sku, label, fs.existsSync(out) ? '✓' : '✗']);
}

fs.rmSync(tmp, { recursive: true, force: true });

const w = [12, 26];
console.log(['SKU', 'السعر', ''].map((h, i) => h.padEnd(w[i] || 0)).join(''));
console.log('─'.repeat(46));
for (const r of rows) console.log(r.map((c, i) => String(c).padEnd(w[i] || 0)).join(''));

const failed = rows.filter(r => r[2] !== '✓').length;
console.log(`\n${rows.length - failed}/${rows.length} صورة`);

if (only.length) process.exit(failed ? 1 : 0);

// ── الحسابات المشتركة ────────────────────────────────────────────────────
const money = (p) => `**$${p.toLocaleString('en-US')}** · ${toIQD(p, fx.rate)} د.ع`;
const net = (p) => p * (1 - FEE);
const rate = (t) => t.hours ? net(t.price) / t.hours : null;

const priced = ALL.filter(i => i.tiers?.length);

// ── STORE.md ─────────────────────────────────────────────────────────────
const tierTable = (i) => [
  '| الدرجة | السعر | يشمل | التسليم |',
  '|---|---|---|---|',
  ...i.tiers.map(t => `| ${t.name}${t.market === 'GC' ? ' 🌍' : ''} | ${money(t.price)} | ${(t.includes || []).join(' · ')} | ${t.delivery} |`),
].join('\n');

const section = (i) => `### ${i.name}
\`${i.sku}\` · ${i.cat}

${i.short}

${i.tiers?.length ? tierTable(i) : `**${i.price != null ? money(i.price) : i.price_label}**`}

<details><summary><b>الوصف الكامل — انسخه لحقل الوصف بـWayl</b></summary>

${i.desc || i.note}

</details>

---
`;

fs.writeFileSync(path.join(DIR, 'STORE.md'), `# متجر Wayl — الكتالوج الجاهز للنشر

> 🔴 **ملف مولَّد — لا تعدّله يدوياً.** عدّل \`items.json\` ثم \`node income/wayl/render.mjs\`
>
> **التاريخ:** ${data._meta.updated} · **الحساب باسم الأخ، والشغل باسم منتظر**
> **سعر الصرف:** ${fx.rate} د.ع/$ — ${fx.source} (${fx.date})
> **العمولة:** 3.5% مُضمَّنة بالأسعار · **الهوامش:** [\`MARGINS.md\`](MARGINS.md)

## ⚠️ حدود المنصة — اقرأها قبل الإدخال

| الحد | الأثر على الإدخال |
|---|---|
| 🔴 ${data._meta.platform_limits.recurring} | الباقة الشهرية تُدخَل كمنتج عادي · وترسل رابط الدفع كل شهر |
| ✅ ${data._meta.platform_limits.options} | **كل خدمة = منتج واحد**، والدرجات تُدخَل بحقل «خيارات المنتج» |
| ✅ ${data._meta.platform_limits.coupons} | لا تنزّل السعر المعلن بالتفاوض — أعطِ كوبوناً |

*مفحوص ${data._meta.platform_limits.checked}*

---

## أ. مداخل رخيصة — يجرّبك بيها

${data.products.filter(i => i.cat === 'مدخل').map(section).join('\n')}
## ب. المواقع والمتاجر

${data.products.filter(i => i.cat === 'ويب').map(section).join('\n')}
## ج. الموبايل

${data.products.filter(i => i.cat === 'موبايل').map(section).join('\n')}
## د. الأتمتة والبيانات والذكاء الاصطناعي

${data.products.filter(i => ['أتمتة', 'بيانات', 'ذكاء اصطناعي'].includes(i.cat)).map(section).join('\n')}
## هـ. الباقات الشهرية

${data.subscriptions.map(section).join('\n')}
## و. أدوات الدفع — ليست منتجات

> خطوات دفع لا خدمات تُشترى. تُنشر حتى ترسل رابط دفع لكل مرحلة عقد.
> سبب الفصل: بند «إساءة تمثيل النشاط» بشروط Wayl.

| SKU | الاسم | القيمة | الغرض |
|---|---|---|---|
${data.payment_items.map(i => `| \`${i.sku}\` | ${i.name} | ${i.price != null ? money(i.price) : `**${i.price_label}**`} | ${i.note} |`).join('\n')}

---

## ز. قواعد التفاوض والتسعير

| القاعدة | التفصيل |
|---|---|
| **أساس التسعير** | ${data._meta.pricing_basis.rule} |
| **مرجع السوق** | ${data._meta.pricing_basis.market_research} |
| **الثقة** | ${data._meta.pricing_basis.confidence} |
| **العربون** | 50% مقدماً لكل عميل جديد — **بلا استثناء** |
| **التفاوض** | 🔴 **لا تنزّل السعر المعلن.** أعطِ كوبون خصم، أو انزل درجة، أو اشطب بنداً |
| **تمدد النطاق** | أي طلب خارج العقد → \`PAY-HR\` |
| **جلسة التشخيص** | تُخصم من أي مشروع خلال 30 يوم — استعملها كباب دخول لكل صفقة |
`);
console.log('✓ STORE.md');

// ── MARGINS.md ───────────────────────────────────────────────────────────
const all = priced.flatMap(i => i.tiers.map(t => ({ ...t, sku: i.sku, item: i.name })));
const low = all.filter(t => rate(t) !== null && rate(t) < FLOOR);
const iq = all.filter(t => t.market !== 'GC' && rate(t));
const gc = all.filter(t => t.market === 'GC' && rate(t));
const avg = (a) => a.length ? a.reduce((s, t) => s + rate(t), 0) / a.length : 0;

fs.writeFileSync(path.join(DIR, 'MARGINS.md'), `# هوامش الربح — كل درجة بالساعة

> 🔴 **ملف مولَّد** من \`items.json\`. عدّل \`hours\` أو \`price\` هناك وأعد التوليد.
> **التاريخ:** ${data._meta.updated}

## الحساب

\`\`\`
الصافي   = السعر × ${(1 - FEE).toFixed(3)}          (بعد عمولة Wayl ${FEE * 100}%)
بالساعة  = الصافي ÷ الساعات المقدَّرة
\`\`\`

**الكلفة الوحيدة عندك هي وقتك** — الأدوات مجانية والميزانية صفر. فالهامش الحقيقي
ليس ربحاً مقابل تكلفة، بل **سعر ساعتك**.

## الحد الأدنى — من وين جاء

هدفك **$1,500 شهرياً**. الوقت المتاح لشغل العملاء ~**130 ساعة شهرياً**
(من 80 ساعة أسبوعياً، بعد الجامعة والدراسة والبحث).

\`\`\`
1,500 ÷ 130 = $11.5/ساعة  ← نقطة التعادل المطلقة
الحد المعتمد: $${FLOOR}/ساعة   ← بهامش أمان للمراجعات والاجتماعات
\`\`\`

## الجدول

| SKU | الدرجة | السعر | الصافي | ساعات | **$/ساعة** | الحكم |
|---|---|---|---|---|---|---|
${all.slice().sort((a, b) => (rate(b) || 0) - (rate(a) || 0)).map(t =>
  `| \`${t.sku}\` | ${t.name}${t.market === 'GC' ? ' 🌍' : ''} | $${t.price} | $${net(t.price).toFixed(0)} | ${t.hours} | **$${rate(t).toFixed(1)}** | ${rate(t) >= FLOOR ? '✅' : '🔴 تحت الحد'} |`
).join('\n')}

## الخلاصة

| المؤشر | القيمة |
|---|---|
| متوسط الدرجات العراقية | **$${avg(iq).toFixed(1)}/ساعة** |
| متوسط الدرجات الخليجية | **$${avg(gc).toFixed(1)}/ساعة** |
| درجات تحت الحد ($${FLOOR}) | ${low.length ? '🔴 ' + low.map(t => t.sku + '/' + t.name).join(' · ') : '**صفر** ✅'} |

## كم عميل تحتاج للأرضية ($1,500/شهر)

| السيناريو | العدد | الساعات المطلوبة |
|---|---|---|
${(() => {
  const sub = data.subscriptions[0];
  const scen = [
    ['باقة «نمو» الشهرية فقط', sub.tiers[1]],
    ['باقة «أتمتة مستمرة» فقط', sub.tiers[2]],
    ['«طلبات الواتساب» متوسط', data.products.find(p => p.sku === 'WA-01').tiers[1]],
    ['«موقع لشركتك» كامل', data.products.find(p => p.sku === 'SITE-01').tiers[1]],
  ];
  return scen.map(([n, t]) => {
    const c = Math.ceil(1500 / net(t.price));
    return `| ${n} ($${t.price}) | **${c}** | ${c * t.hours} ساعة |`;
  }).join('\n');
})()}

🔴 **اقرأ عمود الساعات.** أي سيناريو يتجاوز 130 ساعة شهرياً **غير قابل للتنفيذ**
مهما بدا الرقم جميلاً. الدخل المتكرر (الباقات الشهرية) هو الوحيد الذي يتراكم
بلا ما يتضاعف وقتك — لأن عميل الشهر الماضي يدفع بلا شغل جديد.
`);
console.log('✓ MARGINS.md');

// ── pick.html ────────────────────────────────────────────────────────────
const pick = priced.map(i => ({
  sku: i.sku, name: i.name, cat: i.kind === 'subscription' ? 'اشتراك' : i.cat,
  kind: i.kind, desc: i.short,
  group: i.kind === 'subscription' ? 'الباقات الشهرية'
       : i.cat === 'مدخل' ? 'مداخل رخيصة' : 'الخدمات',
  tiers: i.tiers.map(t => ({
    name: t.name, price: t.price, iqd: toIQD(t.price, fx.rate),
    market: t.market, hours: t.hours, delivery: t.delivery,
    rate: rate(t) ? +rate(t).toFixed(1) : null, label: '',
  })),
})).concat(data.payment_items.map(i => ({
  sku: i.sku, name: i.name, cat: 'أداة دفع', kind: 'payment_tool',
  desc: i.note, group: 'أدوات الدفع',
  tiers: [{ name: 'البند', price: i.price ?? null, iqd: i.price != null ? toIQD(i.price, fx.rate) : '',
            label: i.price_label || '', hours: null, delivery: '', rate: null }],
})));

fs.writeFileSync(path.join(DIR, 'pick.html'), `<!doctype html>
<html dir="rtl" lang="ar"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>اختيار خدمات متجر Wayl</title>
<style>
:root{--bg:#FAFAFA;--card:#fff;--ink:#0A0A0A;--muted:#3F3F46;--dim:#71717A;--line:#E4E4E7}
@media(prefers-color-scheme:dark){:root{--bg:#0A0A0B;--card:#151517;--ink:#FAFAFA;--muted:#D4D4D8;--dim:#8A8A94;--line:#27272A}}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:"SF Arabic","Geeza Pro",system-ui,sans-serif;
  line-height:1.6;padding:24px;max-width:1100px;margin:0 auto}
h1{font-size:1.6rem;letter-spacing:-.5px}
.sub{color:var(--dim);font-size:.9rem;margin-top:6px}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);padding:16px 0;border-bottom:1px solid var(--line);
  display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:20px}
button{font:inherit;font-size:.9rem;border:1px solid var(--line);background:var(--card);color:var(--ink);
  border-radius:10px;padding:9px 16px;cursor:pointer}
button:hover{border-color:var(--dim)}
button.primary{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:600}
.count{margin-inline-start:auto;color:var(--dim);font-size:.9rem;font-variant-numeric:tabular-nums}
h2{font-size:1rem;color:var(--dim);margin:26px 0 10px;font-weight:600}
.svc{border:1px solid var(--line);border-radius:14px;background:var(--card);margin-bottom:12px;overflow:hidden}
.hd{padding:14px 16px;border-bottom:1px solid var(--line)}
.nm{font-weight:600;font-size:1.02rem}
.ds{color:var(--dim);font-size:.84rem;margin-top:3px}
.sku{font-size:.7rem;color:var(--dim);letter-spacing:1px;font-family:ui-monospace,monospace}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-inline-end:7px;vertical-align:1px}
.tr{display:flex;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid var(--line);cursor:pointer}
.tr:hover{background:color-mix(in srgb,var(--ink) 4%,transparent)}
.tr.on{background:color-mix(in srgb,var(--ink) 7%,transparent)}
input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:var(--ink);flex:none}
.tn{flex:1;font-size:.92rem}
.gc{font-size:.68rem;background:var(--ink);color:var(--bg);border-radius:5px;padding:1px 7px;margin-inline-start:6px}
.hr{font-size:.72rem;color:var(--dim);font-variant-numeric:tabular-nums;margin-inline-start:8px}
.tp{white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600;text-align:left;font-size:.92rem}
.tp span{display:block;font-weight:400;color:var(--dim);font-size:.74rem}
#out{width:100%;margin-top:24px;min-height:170px;background:var(--card);color:var(--ink);
  border:1px solid var(--line);border-radius:14px;padding:16px;font-family:ui-monospace,monospace;
  font-size:.8rem;line-height:1.7;white-space:pre;overflow-x:auto;direction:rtl}
.note{color:var(--dim);font-size:.82rem;margin-bottom:8px}
</style></head><body>

<h1>اختيار الخدمات — متجر Wayl</h1>
<p class="sub">علّم <b>كل درجة</b> راح تنشرها. الدرجة هي «خيار المنتج» بـWayl.
سعر الصرف ${fx.rate} د.ع/$ · الحد الأدنى $${FLOOR}/ساعة · ${data._meta.updated}</p>

<div class="bar">
  <button onclick="setAll(true)">حدّد الكل</button>
  <button onclick="setAll(false)">امسح الكل</button>
  <button onclick="onlyIQ()">العراق فقط</button>
  <button onclick="onlyEntry()">أرخص درجة فقط</button>
  <button class="primary" onclick="copyOut()">📋 انسخ المحدَّد</button>
  <span class="count" id="count"></span>
</div>

<div id="groups"></div>
<textarea id="out" readonly placeholder="النص المُولَّد يظهر هنا…"></textarea>

<script>
const ITEMS = ${JSON.stringify(pick)};
const COLOR = {'أتمتة':'#059669','ويب':'#0891B2','بيانات':'#7C3AED','موبايل':'#D97706',
  'ذكاء اصطناعي':'#DB2777','مدخل':'#2563EB','اشتراك':'#475569','أداة دفع':'#52525B'};
const key = (s, n) => s + '|' + n;
const sel = new Set();
const flat = () => ITEMS.flatMap(i => i.tiers.map(t => ({ ...i, t })));
flat().filter(x => x.kind !== 'payment_tool' && x.t.market !== 'GC')
      .forEach(x => sel.add(key(x.sku, x.t.name)));

const groups = ['مداخل رخيصة', 'الخدمات', 'الباقات الشهرية', 'أدوات الدفع'];
document.getElementById('groups').innerHTML = groups.map(g => {
  const list = ITEMS.filter(i => i.group === g);
  if (!list.length) return '';
  return '<h2>' + g + '</h2>' +
    (g === 'أدوات الدفع' ? '<p class="note">خطوات دفع لا خدمات — انشرها فقط إذا تريد ترسل رابط دفع لكل مرحلة عقد.</p>' : '') +
    list.map(i => \`<div class="svc">
      <div class="hd">
        <div class="nm"><span class="dot" style="background:\${COLOR[i.cat]}"></span>\${i.name}</div>
        <div class="ds">\${i.desc}</div>
        <div class="sku">\${i.sku}</div>
      </div>
      \${i.tiers.map(t => \`<label class="tr" data-k="\${key(i.sku, t.name)}">
        <input type="checkbox" data-k="\${key(i.sku, t.name)}">
        <span class="tn">\${t.name}\${t.market === 'GC' ? '<span class="gc">خليج</span>' : ''}\${
          t.rate ? '<span class="hr">' + t.hours + ' ساعة · $' + t.rate + '/ساعة</span>' : ''}</span>
        <span class="tp">\${t.price != null ? '$' + t.price.toLocaleString('en-US') + '<span>' + t.iqd + ' د.ع</span>' : t.label}</span>
      </label>\`).join('')}
    </div>\`).join('');
}).join('');

function sync() {
  document.querySelectorAll('input[type=checkbox]').forEach(c => {
    c.checked = sel.has(c.dataset.k);
    c.closest('.tr').classList.toggle('on', c.checked);
  });
  const picked = flat().filter(x => sel.has(key(x.sku, x.t.name)));
  document.getElementById('count').textContent =
    picked.length + ' درجة · ' + new Set(picked.map(x => x.sku)).size + ' منتج بـWayl';
  render(picked);
}

function render(p) {
  if (!p.length) { document.getElementById('out').value = ''; return; }
  const out = ['الخدمات المختارة للنشر على Wayl:', ''];
  for (const g of groups) {
    const gi = p.filter(x => x.group === g);
    if (!gi.length) continue;
    out.push(g + ':');
    for (const sku of [...new Set(gi.map(x => x.sku))]) {
      const rws = gi.filter(x => x.sku === sku);
      out.push('  ▸ ' + rws[0].name + ' [' + sku + ']');
      rws.forEach(x => out.push('      · ' + x.t.name + ' — ' +
        (x.t.price != null ? '$' + x.t.price + ' / ' + x.t.iqd + ' د.ع' : x.t.label)));
    }
    out.push('');
  }
  const mo = p.filter(x => x.kind === 'subscription' && x.t.price)
              .reduce((s, x) => s + x.t.price, 0);
  out.push('عدد المنتجات بـWayl: ' + new Set(p.map(x => x.sku)).size +
           ' · عدد الخيارات: ' + p.length);
  if (mo) out.push('مجموع الباقات الشهرية لو اشتراها عميل واحد: $' + mo + '/شهر');
  document.getElementById('out').value = out.join('\\n');
}

document.addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return;
  e.target.checked ? sel.add(e.target.dataset.k) : sel.delete(e.target.dataset.k);
  sync();
});

const setAll = on => { sel.clear(); if (on) flat().forEach(x => sel.add(key(x.sku, x.t.name))); sync(); };
const onlyIQ = () => { sel.clear(); flat().filter(x => x.t.market !== 'GC' && x.kind !== 'payment_tool')
  .forEach(x => sel.add(key(x.sku, x.t.name))); sync(); };
const onlyEntry = () => { sel.clear(); ITEMS.filter(i => i.kind !== 'payment_tool').forEach(i => {
  const e = i.tiers.reduce((m, t) => (!m || t.price < m.price ? t : m), null);
  if (e) sel.add(key(i.sku, e.name)); }); sync(); };

async function copyOut() {
  const t = document.getElementById('out');
  if (!t.value) return alert('ما محدَّد ولا خدمة.');
  const btn = event.target;
  try { await navigator.clipboard.writeText(t.value); }
  catch { t.removeAttribute('readonly'); t.select(); document.execCommand('copy'); t.setAttribute('readonly',''); }
  const old = btn.textContent; btn.textContent = '✓ انتُسخ';
  setTimeout(() => btn.textContent = old, 1600);
}

sync();
</script>
</body></html>`);
console.log('✓ pick.html');

if (low.length) {
  console.log(`\n🔴 ${low.length} درجة تحت $${FLOOR}/ساعة: ${low.map(t => t.sku + '/' + t.name).join(', ')}`);
} else {
  console.log(`\n✅ كل الدرجات فوق $${FLOOR}/ساعة · متوسط العراق $${avg(iq).toFixed(1)} · الخليج $${avg(gc).toFixed(1)}`);
}

process.exit(failed ? 1 : 0);
