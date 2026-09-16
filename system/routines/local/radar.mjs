#!/usr/bin/env node
// R1 · رادار كوريا — يكشف تغيّر صفحات القبول الرسمية بالبصمة، لا بالتخمين.
// حتمي بالكامل: لا ذكاء اصطناعي، لا اختراع، لا هلوسة. يقارن نصاً بنص.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, nowUTC, today, log, gitCommit } from './lib.mjs';

const WATCH = join(ROOT, 'korea/watch/WATCHLIST.json');
const STATE = join(ROOT, 'system/routines/local/state/radar.json');
const LOG   = join(ROOT, 'korea/watch/LOG.md');
const ALERT = join(ROOT, 'korea/watch/ALERT.md');

// الكلمات التي يبحث عنها الرادار داخل النص — ظهورها الجديد = إشارة
const SIGNALS = [
  '2027학년도', '2028학년도', '후기', '전기', '모집요강',
  'Fall 2027', 'Spring 2028', '2027 Fall', '2028 Spring',
  'application guidelines', 'admission guide', 'Admission Guide',
];

const watch = JSON.parse(readFileSync(WATCH, 'utf8'));
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { pages: {} };

const hourUTC = new Date().getUTCHours();
const tiers = hourUTC === 4 ? ['A', 'B'] : ['A'];   // طبقة B مرة واحدة يومياً
const targets = watch.targets.filter((t) => tiers.includes(t.tier));

// يجرّد الوسوم ويطبّع المسافات — حتى لا يتغيّر الهاش بسبب إعلان أو طابع زمني
const toText = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

async function grab(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36',
                 'Accept-Language': 'ko,en;q=0.9' },
    });
    if (!res.ok) return { ok: false, why: `HTTP ${res.status}` };
    return { ok: true, text: toText(await res.text()) };
  } catch (e) {
    return { ok: false, why: e.name === 'AbortError' ? 'مهلة' : e.message.slice(0, 60) };
  } finally { clearTimeout(t); }
}

const findings = [];
const failures = [];

for (const t of targets) {
  for (const url of t.urls) {
    const r = await grab(url);
    if (!r.ok) { failures.push(`${t.id} · ${url} → ${r.why}`); continue; }

    const hash = createHash('sha256').update(r.text).digest('hex').slice(0, 16);
    const prev = state.pages[url];
    const signals = SIGNALS.filter((s) => r.text.includes(s));

    if (!prev) {
      // أول رصد — نسجّل البصمة ولا نصرخ، إلا إذا الصفحة فيها إشارة أصلاً
      state.pages[url] = { hash, signals, seen: nowUTC(), len: r.text.length };
      if (signals.length) findings.push({ t, url, kind: 'أول رصد', signals, newSignals: signals, len: r.text.length, prevLen: null });
      continue;
    }

    if (prev.hash === hash) { state.pages[url].checked = nowUTC(); continue; }

    const newSignals = signals.filter((s) => !(prev.signals || []).includes(s));
    findings.push({ t, url, kind: 'تغيّرت', signals, newSignals, len: r.text.length, prevLen: prev.len });
    state.pages[url] = { hash, signals, seen: nowUTC(), len: r.text.length };
  }
}

mkdirSync(join(ROOT), { recursive: true });
writeFileSync(STATE, JSON.stringify(state, null, 2));

// ── ما يُكتب ─────────────────────────────────────────────────────────
const critical = findings.filter((f) => f.newSignals.length > 0);

if (findings.length) {
  const block = findings.map((f) => {
    const delta = f.prevLen === null ? '' : ` · حجم النص ${f.prevLen} ← ${f.len}`;
    const sig = f.newSignals.length
      ? `\n  🔴 **إشارات جديدة ظهرت:** ${f.newSignals.join(' · ')}`
      : `\n  إشارات موجودة (غير جديدة): ${f.signals.join(' · ') || 'لا شي'}`;
    return `### ${nowUTC()} · ${f.t.id} — ${f.t.name}\n- **${f.kind}**${delta}\n- ${f.url}${sig}\n- بريد الجهة: \`${f.t.email}\``;
  }).join('\n\n');

  const cur = readFileSync(LOG, 'utf8');
  writeFileSync(LOG, cur.replace(
    '<!-- ROUTINE:APPEND-BELOW -->',
    `<!-- ROUTINE:APPEND-BELOW -->\n\n${block}`
  ).replace('\n_لم يبدأ الرادار بعد._', ''));
}

const alertBody = critical.length
  ? critical.map((f) =>
      `### 🔴 ${f.t.id} — ${f.t.name}\n**ظهرت إشارة:** ${f.newSignals.join(' · ')}\n**الصفحة:** ${f.url}\n**البريد:** \`${f.t.email}\`\n**الفعل الواحد:** افتح الصفحة وتأكد إذا هذي نافذة تقديم فعلية — إذا نعم، سجّل تاريخ الإغلاق فوراً بـ\`system/routines/DEADLINES.json\`.`
    ).join('\n\n')
  : '_لا شي._';

writeFileSync(ALERT, `# 🔔 تنبيهات الرادار النشطة

> يكتبه الرادار عند رصد تغيير يستحق فعلاً. **فارغ = لا شي يحتاج انتباهك.**

**آخر فحص:** ${nowUTC()} · فُحصت ${targets.length} جهة (طبقة ${tiers.join('+')})
${failures.length ? `**روابط فشلت (${failures.length}):** ${failures.slice(0, 6).join(' · ')}` : '**كل الروابط استجابت.**'}

## نشط الآن

${alertBody}
`);

log('R1', `فُحص ${targets.length} جهة · تغييرات: ${findings.length} · حرجة: ${critical.length} · فشل: ${failures.length}`);
gitCommit('R1', `رادار — ${findings.length} تغيير · ${critical.length} إشارة حرجة`,
  ['korea/watch/LOG.md', 'korea/watch/ALERT.md', 'korea/watch/WATCHLIST.json']);
