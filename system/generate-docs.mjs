#!/usr/bin/env node
/**
 * يولّد system/TASKS.md و system/MONTHLY-SPRINTS.md من مصدر واحد:
 * dashboard/assets/{data,tasks}.js — حتى لا تنفصل الوثائق عن اللوحة.
 *
 *   node system/generate-docs.mjs
 *
 * شغّله بعد أي تعديل على المهام أو السبرنتات في اللوحة.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'dashboard', 'assets');

globalThis.WBTIO = {};
// data.js يبدأ بـ `const WBTIO = {}` — نحذفه حتى لا يظلّل الكائن العام
eval(readFileSync(join(assets, 'data.js'), 'utf8').replace(/^const WBTIO.*$/m, ''));
eval(readFileSync(join(assets, 'tasks.js'), 'utf8'));

const { pillars: P, tasks: T, sprints, milestones, goal } = WBTIO;
const stamp = new Date().toISOString().slice(0, 10);

/* ---------- TASKS.md ---------- */
let o = `# قاعدة المهام — ${T.length} مهمة

> **مولَّد آلياً** من \`../dashboard/assets/tasks.js\` — لا تعدّله يدوياً، عدّل المصدر أو استخدم اللوحة.
> هذي نسخة للقراءة بلا متصفح. النسخة الحيّة (بالتأشير والملاحظات والوقت الفعلي) في
> [\`../dashboard/index.html\`](../dashboard/index.html).

**آخر توليد:** ${stamp}

---

## التوزيع

| العمود | العدد |
|---|---|
`;
for (const k of Object.keys(P)) o += `| ${P[k].label} | ${T.filter(t => t.p === k).length} |\n`;
o += `| **المجموع** | **${T.length}** |\n\n## أول شهرين — ابدأ من هنا\n\n`;
o += '| المعرّف | العمود | المهمة | الشهر |\n|---|---|---|---|\n';
for (const t of T.filter(t => t.ph <= 2).sort((a, b) => a.ph - b.ph || a.id.localeCompare(b.id)))
  o += `| \`${t.id}\` | ${P[t.p].label} | ${t.t} | ${t.ph} |\n`;
o += '\n---\n\n';

for (const k of Object.keys(P)) {
  const list = T.filter(t => t.p === k).sort((a, b) => a.ph - b.ph || a.id.localeCompare(b.id));
  o += `## ${P[k].label} — ${list.length} مهمة\n\n`;
  for (const t of list) {
    o += `### \`${t.id}\` · ${t.t}\n\n**الشهر ${t.ph}** · ${t.est ? t.est + ' دقيقة' : 'بلا تقدير'}`;
    if (t.dep?.length) o += ' · بعد: ' + t.dep.map(d => '`' + d + '`').join(' ');
    o += `\n\n**ليش:** ${t.why}\n\n`;
    if (t.st?.length) o += '**الخطوات:**\n' + t.st.map(s => `1. ${s}`).join('\n') + '\n\n';
    o += `> **تُعتبر منجزة لما:** ${t.dw}\n\n`;
    if (t.lk?.length) o += '**مصادر:** ' + t.lk.map(l => `[${l.t}](${l.u})`).join(' · ') + '\n\n';
    o += '---\n\n';
  }
}
writeFileSync(join(here, 'TASKS.md'), o);

/* ---------- MONTHLY-SPRINTS.md ---------- */
let m = `# السبرنتات الشهرية — 24 شهراً

> **مولَّد آلياً** من \`../dashboard/assets/data.js\`. عنوان واحد وهدف واحد لكل شهر.
> لا تفاصيل يومية هنا بقصد — أنت قلت إن الأهداف البعيدة نقاط محورية والتفصيل أسبوعي.

**نقطة الصفر:** ${goal.startDate} · **آخر توليد:** ${stamp}

---

## المساران

الجدول أدناه مبني على **المسار السريع** — الوصول إلى كوريا بالشهر 14 (أيلول 2027).

لو أخذت **المسار الآمن** (ربيع 2028)، الشهور 1–14 تُزاح ستة أشهر، والوقت الإضافي
يذهب للدخل والادخار واللغة لا للانتظار — فتصل بملف أقوى. الفرق كاملاً في
[\`../korea/TIMELINE.md\`](../korea/TIMELINE.md).

---

## الشهور

| # | العنوان | الهدف الوحيد |
|---|---|---|
`;
for (const s of sprints) m += `| **${s.m}** | ${s.title} | ${s.goal} |\n`;
m += '\n---\n\n## المعالم الحرجة\n\n| المعلم | ليش | متى |\n|---|---|---|\n';
for (const x of milestones) m += `| ${x.title} | ${x.why} | ${x.when} |\n`;
m += `
---

## قاعدة على السبرنتات

**هدف واحد بالشهر.** من يضع ثلاثة أهداف شهرية لا يحقق ولا واحداً.

لو تحقق هدف الشهر مبكراً، لا تضف هدفاً — **قدّم مهام الشهر الجاي**. اللوحة تعرض
مهام الشهر الحالي والذي يليه لهذا السبب بالذات.

ولو لم يتحقق: لا تُسقطه. انقله للشهر التالي واحذف شيئاً آخر مكانه — التحميل الزائد
هو أشهر سبب لانهيار الخطط، لا ضعف الإرادة.
`;
writeFileSync(join(here, 'MONTHLY-SPRINTS.md'), m);

console.log(`✅ TASKS.md (${T.length} مهمة) · MONTHLY-SPRINTS.md (${sprints.length} شهراً)`);
