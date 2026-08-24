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
}

process.exit(failed ? 1 : 0);
