#!/usr/bin/env node
// R4 · محرّك الدخل — يشتغل فعلياً مرة واحدة باليوم. يقرأ من pipeline.mjs، لا يخترع رقماً.
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, today, log, gitCommit, ranToday } from './lib.mjs';

if (ranToday('R4')) { log('R4', 'اشتغل اليوم — خروج'); process.exit(0); }

const raw = execSync('node income/pipeline.mjs', { cwd: ROOT }).toString();
// جرّد ألوان ANSI
const txt = raw.replace(/\[[0-9;]*m/g, '');

const pick = (re, d = '—') => (txt.match(re)?.[1] ?? d).trim();
const mrr  = pick(/الدخل المتكرر \(MRR\)\s+(\$[\d,]+)/);
const gap  = pick(/الفجوة\s+(\$[\d,]+)/);
const apps = pick(/اختبار الـ30 تقديماً:\s*([^\n]+)/);
const move = pick(/➜ الحركة التالية:\s*\n\s*([^\n]+)/, 'شغّل `node income/pipeline.mjs` — تعذّر استخراجها');

// الموعد الحرج يتقدّم على المال دائماً
const escF = join(ROOT, 'system/routines/ESCALATIONS.md');
const esc = existsSync(escF) ? readFileSync(escF, 'utf8').match(/^### (\d{4}-\d{2}-\d{2}) · (.+)$/m) : null;
const escLine = esc && esc[1] === today()
  ? `\n> ⏰ **موعد حرج نشط اليوم: ${esc[2]}** — هذا يتقدّم على حركة الدخل. اقرأ [\`ESCALATIONS.md\`](../system/routines/ESCALATIONS.md) أولاً.\n`
  : '';

writeFileSync(join(ROOT, 'income/DAILY-MOVE.md'), `# حركة اليوم — ${today()}

> **ملف مولَّد يومياً** بـ\`system/routines/local/income.mjs\`. الأمس ما يُحفظ.
> كل رقم هنا مقروء من \`income/pipeline.json\` عبر \`income/pipeline.mjs\` — **لا رقم مخترع**.
${escLine}
## الحالة

| المتكرر | الفجوة إلى الأرضية | اختبار الـ30 |
|---|---|---|
| **${mrr}** | **${gap}** | ${apps} |

## الحركة الواحدة اليوم

**${move}**

## القنوات المقطوعة — لا تضيّع دقيقة عليها

🚫 JAZ · مركز الأمل — لا صيانة ولا إحالة ولا توصية · ولا بريد \`@jaz.iq\`
🚫 Upwork (العراق غير مدعوم) · Wise (محجوب) · PayPal (يجمّد الرصيد) · USDT (حظر مؤسسي)

---
**تريد الحركة مشروحة ومفصّلة؟** افتح Claude Code واكتب \`/money\` —
الروتين يعطيك الحالة، والمهارة تعطيك التنفيذ.
`);

log('R4', `${mrr} · فجوة ${gap} · ${apps}`);
gitCommit('R4', `حركة اليوم — ${mrr}`, ['income/DAILY-MOVE.md']);
