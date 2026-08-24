#!/usr/bin/env node
// مولّد صور متجر Wayl — يقرأ items.json ويكتب images/<SKU>.png
// شغّله بعد أي تعديل سعر أو نص:  node income/wayl/render.mjs
// خيارات:  --only=SKU,SKU   لتوليد بطاقات محددة فقط

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { renderCard, toIQD } from './card.html.mjs';

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

// الشعار يُضمَّن كـ data URI — لا مسارات خارجية بالـHTML
const logoDataUri = 'data:image/svg+xml;base64,' +
  fs.readFileSync(path.join(DIR, 'brand', 'logo-solid.svg')).toString('base64');

const items = [...data.products, ...data.subscriptions, ...data.payment_items]
  .filter(i => !only.length || only.includes(i.sku));

fs.mkdirSync(IMAGES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wayl-'));

console.log(`سعر الصرف: ${fx.rate} د.ع/$ · المصدر: ${fx.source}\n`);
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
    rows.push([item.sku, '—', '—', '✗ فشل']);
    console.error(`✗ ${item.sku}: ${err.message.split('\n')[0]}`);
    continue;
  }

  rows.push([
    item.sku,
    item.price != null ? `$${item.price}` : item.price_label,
    item.price != null ? `${toIQD(item.price, fx.rate)} د.ع` : '—',
    fs.existsSync(out) ? '✓' : '✗',
  ]);
}

fs.rmSync(tmp, { recursive: true, force: true });

const w = [10, 22, 18];
console.log(['SKU', 'السعر', 'بالدينار', ''].map((h, i) => h.padEnd(w[i] || 0)).join(''));
console.log('─'.repeat(56));
for (const r of rows) console.log(r.map((c, i) => String(c).padEnd(w[i] || 0)).join(''));

const failed = rows.filter(r => r[3] !== '✓').length;
console.log(`\n${rows.length - failed}/${rows.length} صورة · ${IMAGES}`);

// ── STORE.md يُولَّد من نفس المصدر — لا يُحرَّر يدوياً ──────────────────
if (!only.length) {
  const money = (i) => i.price != null
    ? `**$${i.price.toLocaleString('en-US')}** · ${toIQD(i.price, fx.rate)} د.ع`
    : `**${i.price_label}**`;

  const table = (list, extra) => [
    `| SKU | الاسم | السعر | ${extra} | الصورة |`,
    '|---|---|---|---|---|',
    ...list.map(i => `| \`${i.sku}\` | ${i.name} | ${money(i)} | ${i[extra === 'التسليم' ? 'delivery' : 'unit'] || '—'} | \`images/${i.sku}.png\` |`),
  ].join('\n');

  const block = (i) => [
    `**${i.sku} — ${i.name}** · ${money(i)}`, '',
    i.short || i.note, '',
    ...(i.bullets || []).map(b => `- ${b}`),
    (i.bullets || []).length ? '' : null,
    i.delivery ? (i.kind === 'product'
      ? `*مدة التسليم: ${i.delivery} · الدفع: 50% عربون + 50% عند التسليم*`
      : `*${i.delivery} · تجديد شهري*`) : null,
    '', '---', '',
  ].filter(x => x !== null).join('\n');

  fs.writeFileSync(path.join(DIR, 'STORE.md'), `# متجر Wayl — الكتالوج الجاهز للنشر

> 🔴 **ملف مولَّد — لا تعدّله يدوياً.** عدّل \`items.json\` ثم \`node income/wayl/render.mjs\`
>
> **التاريخ:** ${data._meta.updated} · **الحساب باسم الأخ، والشغل باسم منتظر**
> **عمولة Wayl 3.5% مُضمَّنة بالأسعار** — لا تُخصم من هامشك.
> **سعر الصرف:** ${fx.rate} د.ع/$ — ${fx.source} (${fx.date}). الموازي ~1500.
> الصور بـ\`images/\` مقاس 1200×1200 · الهوية بـ[\`brand/BRAND.md\`](brand/BRAND.md)

---

## أ. باقات المشاريع — منتجات فعلية

${table(data.products, 'التسليم')}

### وصف كل باقة — انسخه لحقل الوصف بـWayl

${data.products.map(block).join('\n')}
## ب. الاشتراكات الشهرية — الدخل المتكرر

${table(data.subscriptions, 'الوحدة')}

${data.subscriptions.map(block).join('\n')}
## ج. أدوات الدفع — ليست منتجات

> هذي **خطوات دفع** لا خدمات تُشترى. تُنشر حتى ترسل رابط دفع لكل مرحلة عقد.
> سبب الفصل: بند «إساءة تمثيل النشاط» بشروط Wayl.

${table(data.payment_items, 'الوحدة')}

${data.payment_items.map(block).join('\n')}
## د. قواعد التسعير

| القاعدة | التفصيل |
|---|---|
| **العملة** | الأسعار بالدولار · الدينار مشتق بسعر ${fx.rate} · **مصدره \`_meta.fx\` بـitems.json** |
| **العمولة** | 3.5% (باقة البداية) مُضمَّنة · نقطة التعادل مع باقة النمو ≈ $45 للمعاملة |
| **العربون** | 50% مقدماً لكل عميل جديد — **بلا استثناء** |
| **تمدد النطاق** | أي طلب خارج العقد → \`PAY-HR\` بـ$35/ساعة |
| **الاستعجال** | +25% عبر \`PAY-RSH\` |
`);
  console.log('✓ STORE.md');

  // ── pick.html — شاشة اختيار الخدمات ──────────────────────────────────
  const all = [
    ...data.products.map(i => ({ ...i, group: 'باقات المشاريع' })),
    ...data.subscriptions.map(i => ({ ...i, group: 'الاشتراكات الشهرية' })),
    ...data.payment_items.map(i => ({ ...i, group: 'أدوات الدفع — ليست خدمات' })),
  ].map(i => ({
    sku: i.sku, name: i.name, group: i.group, kind: i.kind,
    cat: i.kind === 'payment_tool' ? 'أداة دفع' : i.kind === 'subscription' ? 'اشتراك' : i.cat,
    desc: i.short || i.note || '',
    unit: i.unit || '', delivery: i.delivery || '',
    price: i.price ?? null, price_label: i.price_label || '',
    iqd: i.price != null ? toIQD(i.price, fx.rate) : '',
  }));

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
.wrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--card)}
table{width:100%;border-collapse:collapse;font-size:.92rem;min-width:620px}
th{text-align:right;font-size:.78rem;color:var(--dim);font-weight:600;padding:10px 14px;border-bottom:1px solid var(--line)}
td{padding:12px 14px;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:0}
tr.on{background:color-mix(in srgb,var(--ink) 5%,transparent)}
input[type=checkbox]{width:19px;height:19px;cursor:pointer;accent-color:var(--ink)}
.nm{font-weight:600}
.ds{color:var(--dim);font-size:.8rem;margin-top:3px;max-width:46ch}
.sku{font-size:.72rem;color:var(--dim);letter-spacing:1px;font-family:ui-monospace,monospace}
.pr{white-space:nowrap;font-variant-numeric:tabular-nums;text-align:left;font-weight:600}
.iq{display:block;font-weight:400;color:var(--dim);font-size:.78rem;margin-top:2px}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-inline-end:7px;vertical-align:1px}
.note{color:var(--dim);font-size:.82rem;margin-bottom:8px}
#out{width:100%;margin-top:24px;min-height:150px;background:var(--card);color:var(--ink);
  border:1px solid var(--line);border-radius:14px;padding:16px;font-family:ui-monospace,monospace;
  font-size:.82rem;line-height:1.7;white-space:pre;overflow-x:auto;direction:rtl}
.ok{color:#059669;font-weight:600}
</style></head><body>

<h1>اختيار الخدمات — متجر Wayl</h1>
<p class="sub">علّم اللي راح تنشره فعلاً، بعدين اضغط «انسخ المحدَّد» وألصقه بالمحادثة.
سعر الصرف ${fx.rate} د.ع/$ · ${data._meta.updated}</p>

<div class="bar">
  <button onclick="setAll(true)">حدّد الكل</button>
  <button onclick="setAll(false)">امسح الكل</button>
  <button onclick="onlyProducts()">الباقات فقط</button>
  <button class="primary" onclick="copyOut()">📋 انسخ المحدَّد</button>
  <span class="count" id="count"></span>
</div>

<div id="groups"></div>
<textarea id="out" readonly placeholder="النص المُولَّد يظهر هنا…"></textarea>

<script>
const ITEMS = ${JSON.stringify(all)};
const COLOR = {'أتمتة':'#059669','ويب':'#0891B2','بيانات':'#7C3AED','موبايل':'#D97706',
  'ذكاء اصطناعي':'#DB2777','مدخل':'#2563EB','اشتراك':'#475569','أداة دفع':'#52525B'};
const sel = new Set(ITEMS.filter(i => i.kind === 'product').map(i => i.sku));

const groups = [...new Set(ITEMS.map(i => i.group))];
document.getElementById('groups').innerHTML = groups.map(g => {
  const rows = ITEMS.filter(i => i.group === g).map(i => \`
    <tr data-sku="\${i.sku}">
      <td><input type="checkbox" data-sku="\${i.sku}"></td>
      <td>
        <div class="nm"><span class="dot" style="background:\${COLOR[i.cat] || '#52525B'}"></span>\${i.name}</div>
        <div class="ds">\${i.desc}</div>
      </td>
      <td class="sku">\${i.sku}</td>
      <td class="pr">\${i.price != null
        ? '$' + i.price.toLocaleString('en-US') + '<span class="iq">' + i.iqd + ' د.ع</span>'
        : i.price_label}</td>
      <td class="sku">\${i.delivery || i.unit || '—'}</td>
    </tr>\`).join('');
  return \`<h2>\${g}</h2>
    \${g.includes('أدوات') ? '<p class="note">هذي خطوات دفع لا خدمات تُشترى — انشرها فقط إذا تريد ترسل رابط دفع لكل مرحلة عقد.</p>' : ''}
    <div class="wrap"><table>
      <thead><tr><th></th><th>الخدمة</th><th>SKU</th><th>السعر</th><th>المدة / الوحدة</th></tr></thead>
      <tbody>\${rows}</tbody></table></div>\`;
}).join('');

function sync() {
  document.querySelectorAll('input[type=checkbox]').forEach(c => {
    c.checked = sel.has(c.dataset.sku);
    c.closest('tr').classList.toggle('on', c.checked);
  });
  const picked = ITEMS.filter(i => sel.has(i.sku));
  const usd = picked.reduce((s, i) => s + (i.price || 0), 0);
  document.getElementById('count').textContent =
    picked.length + ' محدَّد · مجموع الثابت $' + usd.toLocaleString('en-US');
  render(picked);
}

function render(p) {
  if (!p.length) { document.getElementById('out').value = ''; return; }
  const line = i => '  · ' + i.sku + ' — ' + i.name + ' — ' +
    (i.price != null ? '$' + i.price + ' / ' + i.iqd + ' د.ع' : i.price_label);
  const out = ['الخدمات المختارة للنشر على Wayl (' + p.length + ' بند):', ''];
  for (const g of groups) {
    const gi = p.filter(i => i.group === g);
    if (gi.length) out.push(g + ':', ...gi.map(line), '');
  }
  const usd = p.reduce((s, i) => s + (i.price || 0), 0);
  const mo = p.filter(i => i.kind === 'subscription').reduce((s, i) => s + i.price, 0);
  out.push('مجموع الأسعار الثابتة: $' + usd.toLocaleString('en-US'));
  if (mo) out.push('منها اشتراكات شهرية: $' + mo + '/شهر');
  document.getElementById('out').value = out.join('\\n');
}

document.addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return;
  e.target.checked ? sel.add(e.target.dataset.sku) : sel.delete(e.target.dataset.sku);
  sync();
});

const setAll = on => { sel.clear(); if (on) ITEMS.forEach(i => sel.add(i.sku)); sync(); };
const onlyProducts = () => { sel.clear(); ITEMS.filter(i => i.kind === 'product').forEach(i => sel.add(i.sku)); sync(); };

async function copyOut() {
  const t = document.getElementById('out');
  if (!t.value) return alert('ما محدَّد ولا خدمة.');
  const btn = event.target;
  try { await navigator.clipboard.writeText(t.value); }
  catch { t.removeAttribute('readonly'); t.select(); document.execCommand('copy'); t.setAttribute('readonly',''); }
  const old = btn.textContent;
  btn.textContent = '✓ انتُسخ';
  setTimeout(() => btn.textContent = old, 1600);
}

sync();
</script>
</body></html>`);
  console.log('✓ pick.html');

}

process.exit(failed ? 1 : 0);
