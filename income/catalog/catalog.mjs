#!/usr/bin/env node
/**
 * كتالوج الخدمات والمنتجات — أداة استعلام.
 *   node income/catalog/catalog.mjs                 كل شي، ملخّصاً
 *   node income/catalog/catalog.mjs --recurring     المتكرر فقط
 *   node income/catalog/catalog.mjs --market GC     حسب السوق: IQ | GC | INTL
 *   node income/catalog/catalog.mjs --type product  خدمة أو منتج
 *   node income/catalog/catalog.mjs --max 500       سقف السعر بالدولار
 *   node income/catalog/catalog.mjs --find عيادة    بحث نصّي
 *   node income/catalog/catalog.mjs --id A01        بطاقة كاملة
 *   node income/catalog/catalog.mjs --md            يولّد CATALOG.md
 * تُدمج الفلاتر. المرجع: income/catalog/README.md
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DB = JSON.parse(readFileSync(join(here, 'catalog.json'), 'utf8'));
const MK = { IQ: 'العراق', GC: 'الخليج', INTL: 'دولي' };
const GROUPS = {
  A: 'أتمتة وذكاء اصطناعي', B: 'ويب ومتاجر', C: 'موبايل', D: 'بيانات وتقارير',
  E: 'اشتراكات وصيانة متكررة', P: 'منتجات رقمية', W: 'خدمات للوكالات', V: 'أنظمة قطاعية',
};

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > -1 ? (process.argv[i + 1] ?? true) : d; };
const has = (k) => process.argv.includes(k);

let rows = DB;
if (has('--recurring')) rows = rows.filter((x) => x.r || x.rec);
const mkt = arg('--market'); if (mkt) rows = rows.filter((x) => x.mk.includes(mkt));
const typ = arg('--type'); if (typ) rows = rows.filter((x) => x.t === typ);
const max = arg('--max'); if (max) rows = rows.filter((x) => Math.min(...Object.values(x.pr).map((p) => p[0]).filter((n) => n > 0)) <= +max);
const find = arg('--find'); if (find) rows = rows.filter((x) => (x.n + x.p + x.seg + x.ch).includes(find));
const id = arg('--id'); if (id) rows = rows.filter((x) => x.id === id);

const money = (p) => (p[0] === 0 && p[1] === 0) ? 'مجاني' : `$${p[0]}–${p[1]}`;

function card(x) {
  const lines = [
    `\n  ${x.id} · ${x.n}   ${x.r ? '🔁 متكرر' : ''}`,
    `  ${'─'.repeat(52)}`,
    `  المشكلة   ${x.p}`,
    `  الفئة     ${x.seg}`,
    `  التسليم   ${x.d}`,
    `  الأدوات   ${x.st.join(' · ')}`,
    `  القناة    ${x.ch}`,
    `  السعر     ${x.mk.map((m) => `${MK[m]} ${money(x.pr[m])}`).join('  |  ')}`,
  ];
  if (x.rec) lines.push(`  🔁 متكرر  ${x.rec.n}: ${x.mk.map((m) => `${MK[m]} ${money(x.rec.pr[m])}/شهر`).join('  |  ')}`);
  return lines.join('\n');
}

if (id || rows.length <= 6) { rows.forEach((x) => console.log(card(x))); console.log(''); }
else {
  const by = {};
  for (const x of rows) (by[x.id[0]] ??= []).push(x);
  console.log(`\n╔══════════════════════════════════════════════════════╗\n║   كتالوج الخدمات والمنتجات — ${String(rows.length).padStart(3)} من ${DB.length}            ║\n╚══════════════════════════════════════════════════════╝`);
  for (const [g, list] of Object.entries(by)) {
    console.log(`\n▌ ${GROUPS[g]} (${list.length})`);
    for (const x of list) {
      const p = x.pr[x.mk[0]];
      console.log(`  ${x.r ? '🔁' : '  '} ${x.id}  ${x.n.padEnd(38)} ${money(p).padStart(11)}  ${x.mk.join('/')}`);
    }
  }
  const r = rows.filter((x) => x.r || x.rec).length;
  console.log(`\n  ${r} من ${rows.length} فيها دخل متكرر (${Math.round(r * 100 / rows.length)}%)`);
  console.log(`  بطاقة كاملة:  node income/catalog/catalog.mjs --id ${rows[0].id}\n`);
}

if (has('--md')) {
  let o = `# الكتالوج — ${DB.length} خدمة ومنتج\n\n> **مولَّد آلياً** من \`catalog.json\` — لا تعدّله يدوياً.\n> \`node income/catalog/catalog.mjs --md\`\n> الأسعار بالدولار · نطاقات إرشادية تُعدَّل بالتفاوض · [كيف تُقرأ](./README.md)\n\n`;
  for (const [g, name] of Object.entries(GROUPS)) {
    const list = DB.filter((x) => x.id[0] === g);
    if (!list.length) continue;
    o += `\n## ${name} (${list.length})\n\n| # | الخدمة | المشكلة | الفئة | العراق | الخليج | دولي | 🔁 المتكرر |\n|---|---|---|---|---|---|---|---|\n`;
    for (const x of list) {
      const c = (m) => x.mk.includes(m) ? money(x.pr[m]) : '—';
      const rr = x.rec ? `${x.rec.n} ${money(x.rec.pr[x.mk[0]])}/ش` : (x.r ? '**متكرر**' : '—');
      o += `| ${x.id} | **${x.n}** | ${x.p} | ${x.seg} | ${c('IQ')} | ${c('GC')} | ${c('INTL')} | ${rr} |\n`;
    }
  }
  writeFileSync(join(here, 'CATALOG.md'), o);
  console.log('✅ CATALOG.md');
}
