#!/usr/bin/env node
// R5 · حارس الاتساق — روابط مكسورة + إعادة توليد + تناقضات الحقائق المصحَّحة.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { ROOT, nowUTC, log, gitCommit, ranToday } from './lib.mjs';

if (ranToday('R5')) { log('R5', 'اشتغل اليوم — خروج'); process.exit(0); }

// 1) أعد توليد الملفات المولَّدة
let gen = 'لم يُشغَّل';
try { execSync('node system/generate-docs.mjs', { cwd: ROOT, stdio: 'ignore' }); gen = 'تمّ ✅'; }
catch (e) { gen = `فشل: ${String(e.message).slice(0, 60)}`; }

// 2) روابط داخلية مكسورة
const files = execSync("git ls-files '*.md'", { cwd: ROOT }).toString().trim().split('\n').filter(Boolean);
const broken = [];
for (const f of files) {
  const txt = readFileSync(join(ROOT, f), 'utf8');
  for (const m of txt.matchAll(/\[[^\]]*\]\(([^)#\s]+\.(?:md|json|mjs|html|pdf))(?:#[^)]*)?\)/g)) {
    const href = decodeURIComponent(m[1]);
    if (/^(https?:|mailto:)/.test(href)) continue;
    const target = href.startsWith('/') ? join(ROOT, href.slice(1)) : resolve(ROOT, dirname(f), href);
    if (!existsSync(target)) broken.push(`\`${f}\` → \`${href}\``);
  }
}

// 3) تناقضات مع الحقائق المصحَّحة بـCLAUDE.md §3
const FORBIDDEN = [
  { re: /أبوستيل|[Aa]postille/, say: 'العراق ليس طرفاً في لاهاي — التصديق **قنصلي**' },
  { re: /\bUpwork\b/,           say: 'العراق غير مدعوم على Upwork' },
  { re: /\bWise\b/,             say: 'Wise محجوب على العراق كلياً' },
  { re: /info@jaz\.iq/,         say: 'بريد على نطاق لا يملكه — مشطوب (§3ب)' },
];
const SKIP = ['CLAUDE.md', 'korea/PROBLEMS', 'income/RAILS', 'system/routines/', 'goal/archive/', 'korea/CONTACTS'];
const contradictions = [];
for (const f of files) {
  if (SKIP.some((s) => f.startsWith(s))) continue;
  const txt = readFileSync(join(ROOT, f), 'utf8');
  for (const c of FORBIDDEN) {
    const hit = txt.match(c.re);
    if (hit) contradictions.push(`\`${f}\` — «${hit[0]}» · ${c.say}`);
  }
}

const list = (a, empty) => (a.length ? a.map((x) => `- ${x}`).join('\n') : `_${empty}_`);
writeFileSync(join(ROOT, 'system/routines/CONSISTENCY.md'), `# تقرير الاتساق

> **ملف مولَّد يومياً** بـ\`system/routines/local/consistency.mjs\`. آخر فحص: ${nowUTC()}

| الفحص | النتيجة |
|---|---|
| إعادة توليد \`TASKS.md\` و\`MONTHLY-SPRINTS.md\` | ${gen} |
| ملفات Markdown مفحوصة | ${files.length} |
| **روابط داخلية مكسورة** | ${broken.length ? `🔴 **${broken.length}**` : '✅ صفر'} |
| **تناقضات مع الحقائق المصحَّحة** | ${contradictions.length ? `🟠 **${contradictions.length}**` : '✅ صفر'} |

## الروابط المكسورة

${list(broken, 'صفر روابط مكسورة — الشرط متحقق.')}

## تناقضات مع \`CLAUDE.md\` §3

${list(contradictions, 'لا تناقض. كل الملفات متسقة مع الحقائق المصحَّحة.')}

> **ملاحظة:** بعض النتائج قد تكون ذكراً للقاعدة لا خرقاً لها (مثلاً ملف يشرح لماذا Wise محجوب).
> افحص السياق قبل التعديل — **هذا كشف، لا حكم.**
`);

log('R5', `روابط مكسورة: ${broken.length} · تناقضات: ${contradictions.length} · توليد: ${gen}`);
gitCommit('R5', `اتساق — ${broken.length} رابط مكسور · ${contradictions.length} تناقض`,
  ['system/routines/CONSISTENCY.md', 'system/TASKS.md', 'system/MONTHLY-SPRINTS.md']);
