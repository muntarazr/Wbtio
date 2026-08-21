#!/usr/bin/env node
/**
 * محرّك مؤشرات الدخل — يقرأ income/pipeline.json ويطبع حالة الأرضية.
 *   node income/pipeline.mjs
 * لا يحتاج إنترنت ولا تنصيب. المرجع: income/THE-FLOOR.md
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(readFileSync(join(here, 'pipeline.json'), 'utf8'));

const FLOOR = db.floor ?? 1500;
const RECURRING = new Set(['maintenance', 'retainer', 'contract']);
const active = db.contracts.filter((c) => c.status === 'active');
const recurring = active.filter((c) => RECURRING.has(c.type));

const mrr = recurring.reduce((s, c) => s + (c.amount || 0), 0);
const projects = active.filter((c) => c.type === 'project')
  .reduce((s, c) => s + (c.amount || 0), 0);
const total = mrr + projects;
const recurShare = total ? (mrr / total) * 100 : 0;

const byClient = {};
for (const c of recurring) byClient[c.client] = (byClient[c.client] || 0) + (c.amount || 0);
const ranked = Object.entries(byClient).sort((a, b) => b[1] - a[1]);
const topShare = mrr && ranked.length ? (ranked[0][1] / mrr) * 100 : 0;

const months = (d) => d ? Math.floor((Date.now() - new Date(d)) / 2.628e9) : 0;
const oldest = recurring.reduce((m, c) => Math.max(m, months(c.started)), 0);

const bar = (pct) => {
  const n = Math.max(0, Math.min(20, Math.round((pct / 100) * 20)));
  return '█'.repeat(n) + '░'.repeat(20 - n);
};
const money = (n) => `$${n.toLocaleString('en-US')}`;

console.log(`
╔══════════════════════════════════════════════════════╗
║              محرّك الدخل — حالة الأرضية               ║
╚══════════════════════════════════════════════════════╝

  الدخل المتكرر (MRR)   ${money(mrr).padStart(8)}   ${bar((mrr / FLOOR) * 100)} ${Math.round((mrr / FLOOR) * 100)}%
  الأرضية المستهدفة     ${money(FLOOR).padStart(8)}
  الفجوة                ${money(Math.max(0, FLOOR - mrr)).padStart(8)}
`);

const rows = [
  ['الدخل المتكرر', money(mrr), `≥ ${money(FLOOR)}`, mrr >= FLOOR],
  ['نسبة التكرار', `${Math.round(recurShare)}%`, '≥ 70%', recurShare >= 70 || total === 0],
  ['تركيز أكبر عميل', `${Math.round(topShare)}%`, '≤ 40%', topShare <= 40 || mrr === 0],
  ['عمر أقدم عقد', `${oldest} شهر`, '≥ 12 شهر', oldest >= 12],
];
console.log('  المؤشر                القيمة      الهدف        ');
console.log('  ' + '─'.repeat(50));
for (const [k, v, t, ok] of rows) {
  console.log(`  ${ok ? '✅' : '⚠️ '} ${k.padEnd(18)} ${String(v).padEnd(11)} ${t}`);
}

if (ranked.length) {
  console.log('\n  التوزيع:');
  for (const [c, a] of ranked) {
    const p = Math.round((a / mrr) * 100);
    console.log(`    ${p > 40 ? '⚠️ ' : '  '} ${c.padEnd(22)} ${money(a).padStart(7)}  ${String(p).padStart(3)}%`);
  }
}

// خط الأنابيب
const stages = ['prospect', 'pitched', 'negotiating'];
const pipe = db.contracts.filter((c) => stages.includes(c.status));
if (pipe.length) {
  const pot = pipe.reduce((s, c) => s + (c.amount || 0), 0);
  console.log(`\n  خط الأنابيب: ${pipe.length} فرصة · محتمل ${money(pot)} شهرياً`);
  for (const c of pipe) {
    console.log(`    · ${c.client} — ${c.type} ${money(c.amount || 0)} [${c.status}]`);
  }
}

// اختبار التقديمات
const apps = db.applications || [];
if (apps.length || mrr < FLOOR) {
  const replied = apps.filter((a) => a.status !== 'sent' && a.status !== 'rejected').length;
  console.log(`\n  اختبار الـ30 تقديماً: ${apps.length}/30 مُرسل · ${replied} رد`);
  if (apps.length < 30) console.log(`    باقي ${30 - apps.length} — طلب واحد يومياً`);
}

// الحركة التالية
console.log('\n  ➜ الحركة التالية:');
if (!db.contracts.length) {
  console.log('    فعّل قناة استلام (Payoneer + Wayl)، ثم اعرض صيانة على نظام قائم.');
} else if (mrr === 0) {
  console.log('    عرض صيانة على نظام بنيته فعلاً — أسرع دولار متكرر عندك.');
} else if (mrr < 600) {
  console.log('    عرض صيانة إضافي + حوّل أقرب عميل مشروع إلى ريتينر (قبل التسليم).');
} else if (mrr < FLOOR) {
  console.log('    ريتينر متوسط + ابدأ اختبار الـ30 تقديماً بالتوازي.');
} else if (topShare > 40) {
  console.log('    ⚠️ الأرضية بلغت — لكن التركيز خطر. أضف مصدراً صغيراً قبل أي توسّع.');
} else {
  console.log('    ✅ الأرضية ثابتة. ارفع الأسعار على الجدد، وحوّل الفائض للادخار.');
}
console.log('');
