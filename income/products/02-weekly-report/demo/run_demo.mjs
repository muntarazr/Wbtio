#!/usr/bin/env node
/**
 * Run the weekly report outside n8n — same metric maths, same schema, same email.
 *
 * Purpose: show a real generated report on a sales call in under a minute,
 * with no n8n instance and no client credentials.
 *
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   node demo/run_demo.mjs                       # bundled sample data
 *   node demo/run_demo.mjs client-data.json      # the client's own rows
 *   node demo/run_demo.mjs --metrics-only        # no API call, just the numbers
 *
 * Writes report.html next to the data file. Open it in a browser.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MS_DAY = 86400000;
const MODEL = 'claude-haiku-4-5-20251001';
const COL = { date: 'date', amount: 'amount', category: 'category', customer: 'customer' };

/* ------------------------------------------------------------------ *
 * 1. Metrics — computed in code, never by the model.
 *    Keep this in sync with the "Compute Metrics" node in workflow.json.
 * ------------------------------------------------------------------ */
export function computeMetrics(rows, now = new Date()) {
  const startThis = new Date(now.getTime() - 7 * MS_DAY);
  const startPrev = new Date(now.getTime() - 14 * MS_DAY);

  const clean = rows
    .map(r => {
      const d = new Date(r[COL.date]);
      const amount = Number(String(r[COL.amount] ?? '').replace(/[^0-9.-]/g, ''));
      return { d, amount: Number.isFinite(amount) ? amount : 0, row: r };
    })
    .filter(x => !isNaN(x.d.getTime()));

  const thisWeek = clean.filter(x => x.d >= startThis);
  const prevWeek = clean.filter(x => x.d >= startPrev && x.d < startThis);

  const sum = a => a.reduce((t, x) => t + x.amount, 0);
  const money = n => Math.round(n * 100) / 100;
  // null when the base is zero — an "infinite growth" line in a client report is fatal
  const pct = (a, b) => (b === 0 ? null : Math.round(((a - b) / b) * 1000) / 10);

  const byKey = (arr, key) => {
    const m = {};
    for (const x of arr) {
      const k = String(x.row[key] ?? 'Unspecified').trim() || 'Unspecified';
      m[k] = (m[k] || 0) + x.amount;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, total]) => ({ name, total: money(total) }));
  };

  const revThis = sum(thisWeek), revPrev = sum(prevWeek);

  return {
    period: { from: startThis.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) },
    revenue: { current: money(revThis), previous: money(revPrev), changePct: pct(revThis, revPrev) },
    orders:  { current: thisWeek.length, previous: prevWeek.length,
               changePct: pct(thisWeek.length, prevWeek.length) },
    averageOrder: {
      current:  thisWeek.length ? money(revThis / thisWeek.length) : 0,
      previous: prevWeek.length ? money(revPrev / prevWeek.length) : 0
    },
    topCategories: byKey(thisWeek, COL.category),
    topCustomers:  byKey(thisWeek, COL.customer),
    dataQuality: { totalRows: rows.length, skippedRows: rows.length - clean.length }
  };
}

/* ------------------------------------------------------------------ *
 * 2. Narrative — the model's only job.
 * ------------------------------------------------------------------ */
const SYSTEM = `You write the weekly business report for the owner described below.
They read it on their phone, on a Sunday morning, in under ninety seconds.

<business>
Name: Northline Supply
What they sell: Wholesale coffee equipment and consumables for cafes.
What "a good week" looks like: revenue above 3,000 with a steady order count.
Known seasonality: quieter in midsummer, busiest in December.
What they can act on: pricing, stock levels, outreach to existing accounts.
</business>

Rules:
1. The numbers are already calculated. Never recalculate or estimate any figure.
2. changePct of null means the previous period was zero — say "no comparison
   available", never "infinite growth".
3. Write for an owner, not an analyst.
4. concerns must be visible in the data. Empty array if the week was genuinely fine.
5. actions must be things this owner controls.
6. If skippedRows exceeds 10% of totalRows, say so plainly.
7. tone: good | steady | watch.

Call the write_report tool exactly once.`;

const TOOL = {
  name: 'write_report',
  description: 'Turn the pre-computed weekly metrics into a short business narrative.',
  input_schema: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      summary:  { type: 'string' },
      wins:     { type: 'array', items: { type: 'string' } },
      concerns: { type: 'array', items: { type: 'string' } },
      actions:  { type: 'array', items: { type: 'string' } },
      tone:     { type: 'string', enum: ['good', 'steady', 'watch'] }
    },
    required: ['headline', 'summary', 'wins', 'concerns', 'actions', 'tone']
  }
};

async function narrate(metrics, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1400,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'write_report' },
      messages: [{
        role: 'user',
        content: 'Weekly metrics (already calculated — do not recalculate):\n\n' +
                 JSON.stringify(metrics, null, 2)
      }]
    })
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const payload = await res.json();
  const block = payload.content.find(c => c.type === 'tool_use');
  if (!block) throw new Error('No tool_use block in response');
  return { report: block.input, usage: payload.usage };
}

/* ------------------------------------------------------------------ *
 * 3. Email — numbers read from metrics, never from the model's prose.
 * ------------------------------------------------------------------ */
const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function buildEmail(m, r) {
  const COLORS = { good: '#1C7A52', steady: '#B5761A', watch: '#B3341F' };
  const accent = COLORS[r.tone] || '#B5761A';
  // العملة دائماً بمنزلتين: "$2,871.5" يقرأها صاحب العمل كخطأ تنسيق ويشك بالباقي
  const cash = n => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const fmt  = n => new Intl.NumberFormat('en-US').format(n);
  const plural = (n, w) => `${fmt(n)} ${w}${n === 1 ? '' : 's'}`;
  const delta = p => (p === null ? '—' : (p > 0 ? '▲ ' : p < 0 ? '▼ ' : '') + Math.abs(p) + '%');
  const dColor = p => (p === null ? '#6B7480' : p > 0 ? '#1C7A52' : p < 0 ? '#B3341F' : '#6B7480');

  const list = items => (items && items.length)
    ? `<ul style="margin:6px 0 0;padding-left:20px">${items.map(i => `<li style="margin:4px 0">${esc(i)}</li>`).join('')}</ul>`
    : '<p style="margin:6px 0 0;color:#6B7480">None this week.</p>';

  const rows = [
    ['Revenue',       '$' + cash(m.revenue.current),    m.revenue.changePct],
    ['Orders',        fmt(m.orders.current),            m.orders.changePct],
    ['Average order', '$' + cash(m.averageOrder.current), null]
  ];

  return `<!doctype html><html><body style="margin:0;background:#F4F1EC;padding:24px;
  font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#12161F">
<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #E4DFD6;border-radius:12px;overflow:hidden">
  <div style="border-top:4px solid ${accent};padding:26px 26px 6px">
    <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6B7480">
      Weekly report · ${m.period.from} → ${m.period.to}</p>
    <h1 style="margin:8px 0 0;font-size:21px;line-height:1.35">${esc(r.headline)}</h1>
    <p style="margin:12px 0 0;color:#2A323F;line-height:1.6">${esc(r.summary)}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:22px 0 0">
    ${rows.map(([l, v, p]) => `<tr>
      <td style="padding:12px 26px;border-top:1px solid #EFEBE4;color:#6B7480;font-size:14px">${l}</td>
      <td style="padding:12px 8px;border-top:1px solid #EFEBE4;font-size:18px;font-weight:700;text-align:right">${v}</td>
      <td style="padding:12px 26px;border-top:1px solid #EFEBE4;text-align:right;font-size:14px;font-weight:600;color:${dColor(p)}">${delta(p)}</td>
    </tr>`).join('')}
  </table>
  <div style="padding:22px 26px">
    <h2 style="margin:0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6B7480">What went well</h2>
    ${list(r.wins)}
    <h2 style="margin:20px 0 0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6B7480">Worth attention</h2>
    ${list(r.concerns)}
    <h2 style="margin:20px 0 0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6B7480">Do next week</h2>
    ${list(r.actions)}
  </div>
  ${m.topCategories.length ? `<div style="padding:0 26px 22px">
    <h2 style="margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6B7480">Top categories</h2>
    ${m.topCategories.map(c => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #EFEBE4">
      <span>${esc(c.name)}</span><b>$${cash(c.total)}</b></div>`).join('')}
  </div>` : ''}
  <div style="padding:16px 26px;background:#FAF8F5;border-top:1px solid #EFEBE4;font-size:12px;color:#6B7480">
    Generated automatically from ${plural(m.dataQuality.totalRows, 'row')}${m.dataQuality.skippedRows ? ` · ${plural(m.dataQuality.skippedRows, 'row')} skipped (unreadable date)` : ''}.
    All figures calculated from source data, not estimated.
  </div>
</div></body></html>`;
}

/* ------------------------------------------------------------------ */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const metricsOnly = args.includes('--metrics-only');
  const dataPath = args.find(a => !a.startsWith('--')) || join(HERE, 'sample-data.json');

  const rows = JSON.parse(readFileSync(dataPath, 'utf8'));
  const m = computeMetrics(rows);

  console.log('\n── METRICS (calculated in code, not by the model) ──');
  console.log(JSON.stringify(m, null, 2));

  if (metricsOnly) process.exit(0);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('\nANTHROPIC_API_KEY is not set. Use --metrics-only to see the numbers alone.');
    process.exit(1);
  }

  const { report, usage } = await narrate(m, apiKey);
  console.log('\n── NARRATIVE (the model\'s only job) ──');
  console.log(`  ${report.headline}\n  ${report.summary}`);
  console.log(`  tone: ${report.tone} · tokens in ${usage.input_tokens} / out ${usage.output_tokens}`);

  const out = join(dirname(dataPath), 'report.html');
  writeFileSync(out, buildEmail(m, report));
  console.log(`\n✅ ${out} — open it in a browser to see exactly what the client receives.`);
}
