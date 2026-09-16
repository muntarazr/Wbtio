#!/usr/bin/env node
// حارس المواعيد — يحسب العدّاد التنازلي ويولّد COUNTDOWN.md
// لا يُعدَّل COUNTDOWN.md يدوياً. عدّل DEADLINES.json وأعد التشغيل.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(readFileSync(join(HERE, 'DEADLINES.json'), 'utf8'));

const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
const days = (d) => Math.round((new Date(d + 'T00:00:00Z') - today) / 86400000);
const THRESHOLDS = [90, 60, 30, 14, 7, 3, 1, 0];

const rows = [];
const alerts = [];

for (const d of src.deadlines) {
  if (d.done) continue;

  if (!d.date) {
    rows.push({ ...d, left: null, state: '🔴 بلا تاريخ', sort: -1e9 });
    alerts.push(`🔴 **${d.id} — ${d.title}**\n   بلا تاريخ وهو حاجز. ${d.why}`);
    continue;
  }

  const left = days(d.date);
  const inWindow = d.window_end && left <= 0 && days(d.window_end) >= 0;

  let state;
  if (inWindow) state = '🟢 النافذة مفتوحة الآن';
  else if (left < 0) state = '⚫️ فات';
  else if (left <= 7) state = '🔴 أقل من أسبوع';
  else if (left <= 30) state = '🟠 أقل من شهر';
  else if (left <= 90) state = '🟡 أقل من ٣ أشهر';
  else state = '⚪️ بعيد';

  rows.push({ ...d, left, state, sort: left });

  if (inWindow) {
    alerts.push(`🟢 **${d.id} — ${d.title}**\n   النافذة مفتوحة الآن وتغلق بعد ${days(d.window_end)} يوم.`);
  } else if (left < 0 && d.blocking) {
    alerts.push(`⚫️ **${d.id} — ${d.title}**\n   فات بـ${-left} يوم وهو حاجز. ${d.why}`);
  } else if (THRESHOLDS.includes(left)) {
    alerts.push(`⏳ **${d.id} — ${d.title}**\n   باقي **${left}** يوم. ${d.why}`);
  }
}

rows.sort((a, b) => a.sort - b.sort);

const fmt = (n) => (n === null ? '—' : n < 0 ? `فات بـ${-n}` : `${n}`);
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

const md = `# العدّاد التنازلي — المواعيد الحرجة

> **ملف مولَّد — لا تعدّله يدوياً.** المصدر: [\`DEADLINES.json\`](./DEADLINES.json)
> **آخر تحديث:** ${stamp} · يولّده حارس المواعيد كل ساعة

## الجدول

| الحالة | باقي (يوم) | التاريخ | الموعد |
|---|---:|---|---|
${rows.map((r) => `| ${r.state} | ${fmt(r.left)} | ${r.date ?? '—'} | **${r.id}** · ${r.title} |`).join('\n')}

## ما يحتاج تحرّكاً الآن

${alerts.length ? alerts.map((a) => `- ${a}`).join('\n\n') : '_لا شي عبر عتبة هذي الساعة._'}

---
**الحواجز المفتوحة:** ${rows.filter((r) => r.blocking).length ? rows.filter((r) => r.blocking).map((r) => r.id).join(' · ') : 'لا شي'}
`;

writeFileSync(join(HERE, 'COUNTDOWN.md'), md);

// خرج للطرفية + إشارة للروتين
console.log(`المواعيد: ${rows.length} مفتوح · تنبيهات هذي الساعة: ${alerts.length}`);
for (const r of rows.slice(0, 5)) console.log(`  ${r.state}  ${String(fmt(r.left)).padStart(5)}  ${r.id} — ${r.title}`);
if (alerts.length) { console.log('\nALERT_TRIGGERED'); process.exitCode = 0; }
