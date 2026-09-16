#!/usr/bin/env node
// R2 · حارس المواعيد — يشغّل deadlines.mjs ويصعّد ما عبر عتبة. مرة واحدة فعلياً باليوم.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, today, nowUTC, log, gitCommit } from './lib.mjs';

const out = execSync('node system/routines/deadlines.mjs', { cwd: ROOT }).toString();
const triggered = out.includes('ALERT_TRIGGERED');

const COUNT = join(ROOT, 'system/routines/COUNTDOWN.md');
const ESC = join(ROOT, 'system/routines/ESCALATIONS.md');

if (!triggered) {
  log('R2', 'لا عتبة عبرت');
  gitCommit('R2', 'تحديث العدّاد', ['system/routines/COUNTDOWN.md']);
  process.exit(0);
}

// استخرج كتلة «ما يحتاج تحرّكاً الآن» من COUNTDOWN.md
const md = readFileSync(COUNT, 'utf8');
const body = md.split('## ما يحتاج تحرّكاً الآن')[1]?.split('\n---')[0]?.trim() ?? '';
const items = [...body.matchAll(/- (⏳|🔴|🟢|⚫️) \*\*([A-Za-z0-9]+) — ([^*]+)\*\*\n\s+(.+)/g)]
  .map((m) => ({ icon: m[1], id: m[2], title: m[3].trim(), detail: m[4].trim() }));

if (!items.length) {
  log('R2', 'عتبة عبرت لكن ما انستخرج بند — العدّاد محدَّث');
  gitCommit('R2', 'تحديث العدّاد', ['system/routines/COUNTDOWN.md']);
  process.exit(0);
}

const prev = existsSync(ESC) ? readFileSync(ESC, 'utf8') : `# تصعيدات المواعيد

> **ملف يكتبه حارس المواعيد.** الجديد بالأعلى. لا تحذف — هذا سجلّ ما نُبِّهت عليه ومتى.

<!-- ROUTINE:APPEND-BELOW -->
`;

// لا تكرر بند صُعِّد اليوم
const fresh = items.filter((i) => !prev.includes(`### ${today()} · ${i.id}`));
if (!fresh.length) {
  log('R2', `${items.length} بند نشط — كلها مُصعَّدة اليوم مسبقاً`);
  gitCommit('R2', 'تحديث العدّاد', ['system/routines/COUNTDOWN.md']);
  process.exit(0);
}

const block = fresh.map((i) =>
  `### ${today()} · ${i.id}\n**${i.icon} ${i.title}**\n${i.detail}\n**الفعل الواحد اليوم:** افتح \`system/routines/COUNTDOWN.md\` ونفّذ بند \`${i.id}\` — أو علّمه \`done:true\` بـ\`DEADLINES.json\` إذا خلص.`
).join('\n\n');

writeFileSync(ESC, prev.replace('<!-- ROUTINE:APPEND-BELOW -->', `<!-- ROUTINE:APPEND-BELOW -->\n\n${block}`));

log('R2', `صعّد ${fresh.length} بند: ${fresh.map((i) => i.id).join(' · ')}`);
gitCommit('R2', `تصعيد ${fresh.length} موعد — ${fresh.map((i) => i.id).join(' ')}`,
  ['system/routines/COUNTDOWN.md', 'system/routines/ESCALATIONS.md']);
