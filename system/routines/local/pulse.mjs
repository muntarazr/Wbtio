#!/usr/bin/env node
// R3 · نبضة الانضباط — تقيس ≥70% من الأيام. حتمية بالكامل، ولا تملأ عنه أبداً.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, today, hourBaghdad, nowUTC, log, gitCommit } from './lib.mjs';

const F = join(ROOT, 'system/routines/DAY-LOG.md');
let src = readFileSync(F, 'utf8');
const d = today();
let changed = false;

// 1) سطر اليوم — يُضاف مرة واحدة
if (!src.includes(`| ${d} |`)) {
  src = src.replace('<!-- ROUTINE:APPEND-BELOW -->',
    `<!-- ROUTINE:APPEND-BELOW -->\n| ${d} |  |  |  |  | بانتظار تعليمه |`);
  changed = true;
}

// 2) اقرأ الجدول واحسب
const rows = [...src.matchAll(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/gm)]
  .map((m) => ({ date: m[1], en: m[2].includes('✅'), ko: m[3].includes('✅'), money: m[4].includes('✅') }))
  .sort((a, b) => b.date.localeCompare(a.date));

const last30 = rows.slice(0, 30);
const counted = last30.filter((r) => r.en && r.ko).length;
const pct = last30.length ? Math.round((counted / last30.length) * 100) : null;

// سلسلة متصلة من اليوم رجوعاً
let streak = 0;
for (const r of rows) { if (r.en && r.ko) streak++; else break; }

// 3) اليوم المفقود — يُعلَّم بآخر تشغيل بالليل فقط
if (hourBaghdad() >= 23) {
  const t = rows.find((r) => r.date === d);
  if (t && !(t.en && t.ko)) {
    src = src.replace(new RegExp(`(\\|\\s*${d}\\s*\\|[^\\n]*\\|)\\s*بانتظار تعليمه\\s*\\|`), '$1 ⚠️ يوم مفقود |');
    changed = true;
  }
}

// 4) كتلة الحالة
const status = pct === null
  ? `> **الاستمرارية:** لا بيانات بعد — أول يوم يبدأ من علامتك الأولى · آخر فحص: ${nowUTC()}`
  : `> **الاستمرارية (آخر ${last30.length} يوم):** **${pct}%** · الهدف ≥70% ${pct >= 70 ? '✅' : '🔴 **دون الهدف**'} · سلسلة حالية: **${streak}** يوم · آخر فحص: ${nowUTC()}`;

const marker = '> **القيد الأصعب';
if (src.includes('> **الاستمرارية')) {
  const next = src.replace(/^> \*\*الاستمرارية[^\n]*$/m, status);
  if (next !== src) { src = next; changed = true; }
} else if (src.includes(marker)) {
  src = src.replace(marker, `${status}\n\n${marker}`);
  changed = true;
} else {
  src = src.replace(/^(# [^\n]*\n)/, `$1\n${status}\n`);
  changed = true;
}

if (changed) writeFileSync(F, src);
log('R3', pct === null ? 'لا بيانات بعد · سطر اليوم جاهز' : `${pct}% · سلسلة ${streak} · ${counted}/${last30.length}`);
if (changed) gitCommit('R3', `نبضة — ${pct ?? 0}% · سلسلة ${streak}`, ['system/routines/DAY-LOG.md']);
