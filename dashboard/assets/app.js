/* ==========================================================================
   لوحة wbtio — المنطق
   كل شي محلي: localStorage فقط. بلا خادم، بلا شبكة، بلا مكتبات.
   ========================================================================== */
(function () {
'use strict';

const KEY = 'wbtio.korea.v1';
const SCHEMA = 1;

/* ------------------------------ أدوات ------------------------------ */

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

const pad2 = n => String(n).padStart(2, '0');

/** تاريخ محلي بصيغة YYYY-MM-DD — لا نستخدم toISOString لأنه يحوّل لـUTC ويقفز يوماً. */
function ymd(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const x = new Date(y, m - 1, d + n);
  return ymd(x);
}

/** مفتاح الأسبوع — الأحد بداية الأسبوع، لأن مراجعته يوم الأحد. */
function weekKey(iso) {
  const [y, m, d] = (iso || ymd()).split('-').map(Number);
  const x = new Date(y, m - 1, d);
  x.setDate(x.getDate() - x.getDay());
  return ymd(x);
}

function monthKey(iso) { return (iso || ymd()).slice(0, 7); }

function daysBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
}

function uid() { return 'x' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const AR = new Intl.NumberFormat('en-US');
const money = n => '$' + AR.format(Math.round(Number(n) || 0));

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ------------------------------ الحالة ------------------------------ */

const SECTIONS = [
  { id: 'today',      label: 'اليوم' },
  { id: 'tasks',      label: 'المهام' },
  { id: 'week',       label: 'الأسبوع' },
  { id: 'month',      label: 'الشهر' },
  { id: 'income',     label: 'الدخل' },
  { id: 'leads',      label: 'العملاء' },
  { id: 'korea',      label: 'كوريا' },
  { id: 'discipline', label: 'الانضباط' },
  { id: 'settings',   label: 'الإعدادات' }
];

function defaults() {
  const vis = {};
  SECTIONS.forEach(s => { vis[s.id] = true; });
  return {
    v: SCHEMA,
    settings: {
      theme: 'auto', accent: '#FF6A1F', font: 'system', fs: 16,
      density: 'normal', visible: vis, order: SECTIONS.map(s => s.id),
      krw: WBTIO.goal.krwPerUsd, startDate: WBTIO.goal.startDate
    },
    tasks: {},        // id -> { status, estMin, actualMin, notes, deleted }
    customTasks: [],  // مهام أضافها بنفسه، بنفس شكل مهام البذرة
    days: {},         // YYYY-MM-DD -> { core:{}, englishMin, koreanMin, note }
    weeks: {},        // weekKey -> { proposals, messages, ... , note }
    income: [], savings: [], leads: [],
    korea: { points: {}, milestones: {} },
    meta: { createdAt: new Date().toISOString(), lastBackupAt: null }
  };
}

let S = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch (e) {
    console.warn('تعذّرت قراءة البيانات المحفوظة، بدأنا من جديد:', e);
    return defaults();
  }
}

/** يدمج الافتراضيات فوق أي حالة قديمة حتى لا ينكسر شي عند إضافة حقول جديدة. */
function migrate(old) {
  const base = defaults();
  const out = Object.assign({}, base, old, { v: SCHEMA });
  out.settings = Object.assign({}, base.settings, old.settings || {});
  out.settings.visible = Object.assign({}, base.settings.visible, (old.settings || {}).visible || {});
  // أي قسم جديد أُضيف بنسخة أحدث يدخل ترتيب العرض بلا أن يفقد ترتيبه الشخصي
  const order = (out.settings.order || []).filter(id => base.settings.visible.hasOwnProperty(id));
  base.settings.order.forEach(id => { if (order.indexOf(id) === -1) order.push(id); });
  out.settings.order = order;
  out.korea = Object.assign({ points: {}, milestones: {} }, old.korea || {});
  out.meta = Object.assign({}, base.meta, old.meta || {});
  ['tasks', 'days', 'weeks'].forEach(k => { out[k] = old[k] || {}; });
  ['customTasks', 'income', 'savings', 'leads'].forEach(k => { out[k] = Array.isArray(old[k]) ? old[k] : []; });
  return out;
}

let saveTimer = null;

/** الحفظ فوري بشكل افتراضي: أي تغيير قد يتبعه إغلاق الصفحة مباشرة. */
function save() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('تعذّر الحفظ — مساحة المتصفح ممتلئة؟'); console.error(e); }
}

/** للكتابة عالية التكرار فقط (شريط حجم الخط). يُفرَّغ عند مغادرة الصفحة. */
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 200);
}

/** شبكة أمان: أي حفظ مؤجَّل يُنفَّذ قبل ما تختفي الصفحة. */
function flush() { if (saveTimer) save(); }
window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

/* ------------------------------ المهام ------------------------------ */

/** يدمج مهام البذرة مع تعديلاته ومهامه الخاصة، ويحذف ما حذفه. */
function allTasks() {
  const seed = WBTIO.tasks.map(t => Object.assign({}, t, { seed: true }));
  const list = seed.concat(S.customTasks.map(t => Object.assign({}, t, { seed: false })));
  return list
    .map(t => {
      const o = S.tasks[t.id] || {};
      if (o.deleted) return null;
      return Object.assign({}, t, {
        estMin:    o.estMin    != null ? o.estMin    : (t.est || 0),
        actualMin: o.actualMin != null ? o.actualMin : null,
        status:    o.status || 'todo',
        notes:     o.notes || '',
        doneAt:    o.doneAt || null
      });
    })
    .filter(Boolean);
}

function patchTask(id, patch) {
  S.tasks[id] = Object.assign({}, S.tasks[id], patch, { updatedAt: new Date().toISOString() });
  save();
}

/* ------------------------------ اليوم ------------------------------ */

function dayRec(iso) {
  iso = iso || ymd();
  const r = S.days[iso] || (S.days[iso] = {});
  // سجلات قديمة قد تنقصها الحقول — نكملها بدل ما ننكسر عليها
  if (!r.core || typeof r.core !== 'object') r.core = {};
  if (typeof r.englishMin !== 'number') r.englishMin = 0;
  if (typeof r.koreanMin  !== 'number') r.koreanMin = 0;
  if (typeof r.note !== 'string') r.note = '';
  return r;
}

function dayScore(iso) {
  const rec = S.days[iso];
  if (!rec) return 0;
  const done = WBTIO.core.filter(c => rec.core && rec.core[c.id]).length;
  return done / WBTIO.core.length;
}

function disciplineStats(days) {
  const today = ymd();
  const start = S.settings.startDate || WBTIO.goal.startDate;
  // النسبة تُحسب من تاريخ بداية الخطة فقط — الأيام اللي قبلها ما تُحاسَب عليها.
  // لكن الشبكة تعرض النافذة كاملة حتى تشوف الصورة مو شريطاً من خانة وحدة.
  const span = Math.max(1, Math.min(days, daysBetween(start, today) + 1));
  let full = 0, partial = 0;
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = addDays(today, -i);
    const sc = dayScore(iso);
    if (i < span) { if (sc === 1) full++; else if (sc > 0) partial++; }
    cells.push({ iso, sc, counted: i < span });
  }
  // السلسلة: أيام كاملة متتالية تنتهي اليوم أو أمس (حتى لا تنكسر قبل ما يسجّل اليوم)
  let streak = 0;
  let cur = dayScore(today) === 1 ? today : (dayScore(addDays(today, -1)) === 1 ? addDays(today, -1) : null);
  while (cur && dayScore(cur) === 1) { streak++; cur = addDays(cur, -1); }
  return { span, full, partial, pct: Math.round((full / span) * 100), streak, cells };
}

/* ------------------------------ الدخل ------------------------------ */

function incomeForMonth(mk) {
  return S.income.filter(r => (r.date || '').slice(0, 7) === mk)
                 .reduce((a, r) => a + (Number(r.amount) || 0), 0);
}
function savingsTotal() {
  return S.savings.reduce((a, r) => a + (Number(r.amount) || 0), 0);
}
function currentMonthIndex() {
  const start = S.settings.startDate || WBTIO.goal.startDate;
  return Math.max(1, Math.floor(daysBetween(start, ymd()) / 30) + 1);
}

/* ------------------------------ الإعدادات ------------------------------ */

const FONTS = {
  system: 'system-ui, -apple-system, "Segoe UI", Tahoma, Arial, sans-serif',
  tahoma: 'Tahoma, Arial, sans-serif',
  serif:  'Georgia, "Times New Roman", serif',
  mono:   'ui-monospace, "Cascadia Code", Consolas, monospace'
};

const ACCENTS = ['#FF6A1F', '#2E8B57', '#3A6EA5', '#7B4EA8', '#B5761A', '#C1440E', '#0F766E'];

function applySettings() {
  const st = S.settings;
  const root = document.documentElement;
  const dark = st.theme === 'dark' ||
    (st.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-density', st.density);
  root.style.setProperty('--accent', st.accent);
  root.style.setProperty('--font', FONTS[st.font] || FONTS.system);
  root.style.setProperty('--fs', st.fs + 'px');
}

function visibleSections() {
  return S.settings.order
    .filter(id => S.settings.visible[id] || id === 'settings')
    .map(id => SECTIONS.find(s => s.id === id))
    .filter(Boolean);
}

/* ------------------------------ العرض ------------------------------ */

let view = 'today';

function renderTabs() {
  const secs = visibleSections();
  if (!secs.some(s => s.id === view)) view = secs[0].id;
  $('#tabs').innerHTML = secs.map(s =>
    `<button class="tab" role="tab" data-view="${s.id}" aria-selected="${s.id === view}">${esc(s.label)}</button>`
  ).join('');
}

function renderBackupNotice() {
  const last = S.meta.lastBackupAt;
  const stale = !last || daysBetween(last.slice(0, 10), ymd()) >= 7;
  $('#backup-notice').hidden = !stale;
  $('#backup-since').textContent = last
    ? 'آخر نسخة: ' + last.slice(0, 10)
    : 'ما أخذت نسخة احتياطية أبداً';
}

function render() {
  applySettings();
  renderTabs();
  renderBackupNotice();
  $('#stamp').textContent = ymd() + ' · الشهر ' + currentMonthIndex() + ' من 24';
  const host = $('#view');
  host.innerHTML = ({
    today: viewToday, tasks: viewTasks, week: viewWeek, month: viewMonth,
    income: viewIncome, leads: viewLeads, korea: viewKorea,
    discipline: viewDiscipline, settings: viewSettings
  }[view] || viewToday)();
  host.scrollIntoView({ block: 'start' });
}

/* ---------- اليوم ---------- */

function viewToday() {
  const iso = ymd();
  const rec = dayRec(iso);
  const st = disciplineStats(30);
  const isUni = rec.uniDay === true;
  const blocks = isUni ? WBTIO.blocks.uni : WBTIO.blocks.off;
  const doneCount = WBTIO.core.filter(c => rec.core[c.id]).length;

  const next = allTasks()
    .filter(t => t.status !== 'done' && t.ph <= currentMonthIndex() + 1)
    .sort((a, b) => (a.ph - b.ph) || a.id.localeCompare(b.id))
    .slice(0, 5);

  return `
  <h1>اليوم — ${iso}</h1>
  <p class="sub">اليوم الأدنى أربع ساعات. تكتمل = يوم ناجح، مهما صار غيره.</p>

  <div class="grid">
    <div class="stat"><div class="k">اليوم الأدنى</div><div class="v">${doneCount}/${WBTIO.core.length}</div>
      <div class="bar"><i style="width:${(doneCount / WBTIO.core.length) * 100}%"></i></div></div>
    <div class="stat"><div class="k">الانضباط · 30 يوم</div><div class="v">${st.pct}%</div>
      <div class="n">الهدف ${WBTIO.goal.disciplineTarget}%</div></div>
    <div class="stat"><div class="k">السلسلة</div><div class="v">${st.streak}</div><div class="n">يوم متصل</div></div>
    <div class="stat"><div class="k">دخل الشهر</div><div class="v">${money(incomeForMonth(monthKey()))}</div>
      <div class="n">الهدف ${money(WBTIO.goal.incomeFloor)}</div></div>
  </div>

  <div class="card">
    <h2>الأربع ساعات</h2>
    <ul class="core-list">
      ${WBTIO.core.map(c => `
        <li class="${rec.core[c.id] ? 'done' : ''}">
          <input type="checkbox" data-core="${c.id}" ${rec.core[c.id] ? 'checked' : ''} aria-label="${esc(c.title)}">
          <span class="core-title"><b>${esc(c.title)}</b><small>${esc(c.note)}</small></span>
        </li>`).join('')}
    </ul>
    <div class="row" style="margin-top:14px">
      <div class="field"><label>دقائق إنكليزي</label>
        <input type="number" min="0" step="5" data-min="englishMin" value="${rec.englishMin || 0}"></div>
      <div class="field"><label>دقائق كوري</label>
        <input type="number" min="0" step="5" data-min="koreanMin" value="${rec.koreanMin || 0}"></div>
    </div>
    <div style="margin-top:12px"><label>ملاحظة اليوم</label>
      <textarea data-daynote placeholder="شنو صار اليوم؟ شنو عطّلك؟">${esc(rec.note || '')}</textarea></div>
  </div>

  <div class="card">
    <div class="row" style="justify-content:space-between">
      <h2 style="margin:0">${esc(blocks.label)}</h2>
      <button class="btn btn-sm" data-toggle-uni>${isUni ? 'حوّله ليوم عطلة' : 'حوّله ليوم جامعة'}</button>
    </div>
    <ul class="blocks" style="margin-top:12px">
      ${blocks.items.map(b => `<li><span class="t">${esc(b.t)}</span><span>${esc(b.d)}</span></li>`).join('')}
    </ul>
  </div>

  <div class="card">
    <h2>أقرب خمس مهام</h2>
    ${next.length ? next.map(t => `
      <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line-2)">
        <input type="checkbox" data-quickdone="${t.id}" style="width:18px;height:18px;accent-color:var(--accent)">
        <span style="flex:1 1 auto;min-width:0">${esc(t.t)}</span>
        <span class="chip">${esc((WBTIO.pillars[t.p] || {}).label || t.p)}</span>
      </div>`).join('') : '<p class="empty">ما بقت مهام بهذي المرحلة — افتح المهام وأضف.</p>'}
  </div>`;
}

/* ---------- المهام ---------- */

let taskFilter = { p: 'all', status: 'open', q: '' };

function viewTasks() {
  const list = allTasks().filter(t => {
    if (taskFilter.p !== 'all' && t.p !== taskFilter.p) return false;
    if (taskFilter.status === 'open' && t.status === 'done') return false;
    if (taskFilter.status === 'done' && t.status !== 'done') return false;
    if (taskFilter.q) {
      const q = taskFilter.q.toLowerCase();
      if (!(t.t + ' ' + t.why + ' ' + t.id).toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (a.ph - b.ph) || a.id.localeCompare(b.id));

  const total = allTasks().length;
  const done = allTasks().filter(t => t.status === 'done').length;

  return `
  <h1>المهام</h1>
  <p class="sub">${done} من ${total} منجزة · تقدر تضيف مهامك وتعدّل الوقت المقدَّر وتسجّل الوقت الفعلي.</p>

  <div class="card">
    <div class="row">
      <div class="field"><label>العمود</label>
        <select data-filter="p">
          <option value="all">الكل</option>
          ${Object.keys(WBTIO.pillars).map(k =>
            `<option value="${k}" ${taskFilter.p === k ? 'selected' : ''}>${esc(WBTIO.pillars[k].label)}</option>`).join('')}
        </select></div>
      <div class="field"><label>الحالة</label>
        <select data-filter="status">
          <option value="open" ${taskFilter.status === 'open' ? 'selected' : ''}>غير منجزة</option>
          <option value="done" ${taskFilter.status === 'done' ? 'selected' : ''}>منجزة</option>
          <option value="all"  ${taskFilter.status === 'all'  ? 'selected' : ''}>الكل</option>
        </select></div>
      <div class="field"><label>بحث</label>
        <input type="text" data-filter="q" value="${esc(taskFilter.q)}" placeholder="كلمة من العنوان"></div>
      <div style="align-self:flex-end"><button class="btn btn-primary" data-addtask>+ مهمة</button></div>
    </div>
  </div>

  ${list.length ? list.map(taskCard).join('') : '<p class="empty">ماكو مهام بهذا الفلتر.</p>'}`;
}

function taskCard(t) {
  const pil = WBTIO.pillars[t.p] || { label: t.p };
  return `
  <div class="task ${t.status === 'done' ? 'done' : ''}" data-task="${t.id}">
    <div class="task-head">
      <input type="checkbox" data-done="${t.id}" ${t.status === 'done' ? 'checked' : ''} aria-label="منجزة">
      <div class="tt">
        <b>${esc(t.t)}</b>
        <div class="why">${esc(t.why)}</div>
        <div class="chips">
          <span class="chip accent">${esc(pil.label)}</span>
          <span class="chip">الشهر ${t.ph}</span>
          <span class="chip">${t.estMin ? t.estMin + ' د مقدَّرة' : 'بلا تقدير'}</span>
          ${t.actualMin != null ? `<span class="chip">${t.actualMin} د فعلية</span>` : ''}
          ${t.dep && t.dep.length ? `<span class="chip">بعد ${esc(t.dep.join('، '))}</span>` : ''}
          ${!t.seed ? '<span class="chip">مهمتك</span>' : ''}
        </div>
      </div>
      <button class="btn btn-sm" data-expand="${t.id}">تفاصيل</button>
    </div>

    <div class="task-body" hidden>
      ${t.st && t.st.length ? `<h3>الخطوات</h3><ol>${t.st.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      <div class="done-when"><b>تُعتبر منجزة لما:</b> ${esc(t.dw)}</div>
      ${t.lk && t.lk.length ? `<h3>مصادر</h3><ul>${t.lk.map(l =>
        `<li><a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)}</a></li>`).join('')}</ul>` : ''}
      <div class="row" style="margin-top:12px">
        <div class="field"><label>وقت مقدَّر (دقيقة)</label>
          <input type="number" min="0" step="15" data-est="${t.id}" value="${t.estMin || 0}"></div>
        <div class="field"><label>وقت فعلي (دقيقة)</label>
          <input type="number" min="0" step="5" data-actual="${t.id}" value="${t.actualMin != null ? t.actualMin : ''}"
                 placeholder="كم أخذت منك فعلاً"></div>
      </div>
      <div style="margin-top:10px"><label>ملاحظاتك</label>
        <textarea data-notes="${t.id}" placeholder="شنو تعلّمت؟ شنو تسويه غير المرة الجاية؟">${esc(t.notes)}</textarea></div>
      <div class="row" style="margin-top:10px">
        <button class="btn btn-sm btn-danger" data-deltask="${t.id}">حذف من قائمتي</button>
      </div>
    </div>
  </div>`;
}

/* ---------- الأسبوع ---------- */

function viewWeek() {
  const wk = weekKey();
  const w = S.weeks[wk] || {};
  const st = disciplineStats(7);
  return `
  <h1>الأسبوع</h1>
  <p class="sub">يبدأ الأحد. املأ الأرقام كل أحد — 30 دقيقة ثابتة، هذا كل الطقس.</p>

  <div class="grid">
    <div class="stat"><div class="k">أيام كاملة</div><div class="v">${st.full}/7</div></div>
    <div class="stat"><div class="k">انضباط الأسبوع</div><div class="v">${st.pct}%</div>
      <div class="bar"><i style="width:${Math.min(100, st.pct)}%"></i></div></div>
    <div class="stat"><div class="k">أسبوع</div><div class="v" style="font-size:1.1em">${wk}</div></div>
  </div>

  <div class="card">
    <h2>المؤشرات مقابل الأهداف</h2>
    ${WBTIO.weeklyTargets.map(m => {
      const v = Number(w[m.id]) || 0;
      const pct = Math.min(100, Math.round((v / m.target) * 100));
      return `
      <div style="padding:10px 0;border-bottom:1px solid var(--line-2)">
        <div class="row" style="justify-content:space-between;gap:8px">
          <span style="flex:1 1 auto;min-width:0">${esc(m.label)}</span>
          <input type="number" min="0" data-week="${m.id}" value="${v}" style="width:90px;flex:0 0 auto">
          <span class="chip">${v}/${m.target}</span>
        </div>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </div>`;
    }).join('')}
    <div style="margin-top:14px"><label>مراجعة الأسبوع — شنو اشتغل وشنو لا</label>
      <textarea data-weeknote>${esc(w.note || '')}</textarea></div>
  </div>`;
}

/* ---------- الشهر ---------- */

function viewMonth() {
  const idx = currentMonthIndex();
  const sp = WBTIO.sprints.find(s => s.m === idx) || WBTIO.sprints[WBTIO.sprints.length - 1];
  const mk = monthKey();
  const earned = incomeForMonth(mk);
  const st = disciplineStats(30);
  const monthTasks = allTasks().filter(t => t.ph === idx);
  const monthDone = monthTasks.filter(t => t.status === 'done').length;

  return `
  <h1>الشهر ${idx} — ${esc(sp.title)}</h1>
  <p class="sub">هدف واحد بالشهر. الأهداف البعيدة نقاط محورية، والتفصيل هنا وبالأسبوع.</p>

  <div class="card">
    <h2>هدف هذا الشهر</h2>
    <p style="font-size:1.1em;margin:0">${esc(sp.goal)}</p>
  </div>

  <div class="grid">
    <div class="stat"><div class="k">مهام الشهر</div><div class="v">${monthDone}/${monthTasks.length}</div>
      <div class="bar"><i style="width:${monthTasks.length ? (monthDone / monthTasks.length) * 100 : 0}%"></i></div></div>
    <div class="stat"><div class="k">دخل الشهر</div><div class="v">${money(earned)}</div>
      <div class="n">الحد الأدنى ${money(WBTIO.goal.incomeFloor)}</div></div>
    <div class="stat"><div class="k">الانضباط</div><div class="v">${st.pct}%</div>
      <div class="n">الهدف ${WBTIO.goal.disciplineTarget}%</div></div>
  </div>

  <div class="card">
    <h2>الطريق كامل — 24 شهر</h2>
    <div class="table-scroll"><table>
      <tr><th>الشهر</th><th>العنوان</th><th>الهدف</th></tr>
      ${WBTIO.sprints.map(s => `
        <tr style="${s.m === idx ? 'background:var(--line-2)' : ''}">
          <td class="num">${s.m}</td><td><b>${esc(s.title)}</b></td><td>${esc(s.goal)}</td>
        </tr>`).join('')}
    </table></div>
  </div>`;
}

/* ---------- الدخل ---------- */

function viewIncome() {
  const mk = monthKey();
  const earned = incomeForMonth(mk);
  const sav = savingsTotal();
  const assetTargetUsd = WBTIO.goal.f27AssetsKRW / (S.settings.krw || 1380);
  const rows = S.income.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 40);

  const byMonth = {};
  S.income.forEach(r => {
    const k = (r.date || '').slice(0, 7);
    if (k) byMonth[k] = (byMonth[k] || 0) + (Number(r.amount) || 0);
  });
  const months = Object.keys(byMonth).sort().slice(-12);

  return `
  <h1>الدخل والادخار</h1>
  <p class="sub">دخلك ليس هدفاً مالياً فقط — هو شرط بفيزا F-2-7: دخل سنوي ≥ 40 مليون وون وأصول ≥ 20 مليون وون.</p>

  <div class="grid">
    <div class="stat"><div class="k">هذا الشهر</div><div class="v">${money(earned)}</div>
      <div class="bar"><i style="width:${Math.min(100, (earned / WBTIO.goal.incomeFloor) * 100)}%"></i></div>
      <div class="n">من ${money(WBTIO.goal.incomeFloor)}</div></div>
    <div class="stat"><div class="k">الادخار</div><div class="v">${money(sav)}</div>
      <div class="bar"><i style="width:${Math.min(100, (sav / assetTargetUsd) * 100)}%"></i></div>
      <div class="n">شرط الأصول ≈ ${money(assetTargetUsd)}</div></div>
    <div class="stat"><div class="k">إجمالي ما دخل</div>
      <div class="v">${money(S.income.reduce((a, r) => a + (Number(r.amount) || 0), 0))}</div></div>
  </div>

  <div class="card">
    <h2>سجّل دفعة</h2>
    <div class="row">
      <div class="field"><label>التاريخ</label><input type="date" id="i-date" value="${ymd()}"></div>
      <div class="field"><label>العميل / المصدر</label><input type="text" id="i-client" placeholder="اسم العميل"></div>
      <div class="field"><label>المبلغ بالدولار</label><input type="number" id="i-amount" min="0" step="10"></div>
      <div class="field"><label>النوع</label>
        <select id="i-kind"><option value="income">دخل</option><option value="savings">ادخار</option></select></div>
      <div style="align-self:flex-end"><button class="btn btn-primary" data-addincome>أضف</button></div>
    </div>
  </div>

  ${months.length ? `<div class="card"><h2>آخر 12 شهر</h2>
    ${months.map(m => {
      const v = byMonth[m];
      return `<div style="padding:6px 0">
        <div class="row" style="justify-content:space-between"><span>${m}</span><b>${money(v)}</b></div>
        <div class="bar"><i style="width:${Math.min(100, (v / WBTIO.goal.incomeTarget) * 100)}%"></i></div>
      </div>`;
    }).join('')}
    <p class="n" style="color:var(--muted);font-size:.85em">الشريط الممتلئ = ${money(WBTIO.goal.incomeTarget)}</p>
  </div>` : ''}

  <div class="card">
    <h2>آخر الحركات</h2>
    ${rows.length ? `<div class="table-scroll"><table>
      <tr><th>التاريخ</th><th>العميل</th><th>المبلغ</th><th></th></tr>
      ${rows.map(r => `<tr>
        <td class="num">${esc(r.date)}</td><td>${esc(r.client)}</td>
        <td class="num">${money(r.amount)}</td>
        <td><button class="btn btn-sm btn-danger" data-delincome="${r.id}">حذف</button></td>
      </tr>`).join('')}
    </table></div>` : '<p class="empty">ماكو حركات بعد.</p>'}
    ${S.savings.length ? `<h3 style="margin-top:18px">الادخار</h3><div class="table-scroll"><table>
      <tr><th>التاريخ</th><th>ملاحظة</th><th>المبلغ</th><th></th></tr>
      ${S.savings.slice().reverse().map(r => `<tr>
        <td class="num">${esc(r.date)}</td><td>${esc(r.client || '')}</td>
        <td class="num">${money(r.amount)}</td>
        <td><button class="btn btn-sm btn-danger" data-delsaving="${r.id}">حذف</button></td>
      </tr>`).join('')}
    </table></div>` : ''}
  </div>`;
}

/* ---------- العملاء ---------- */

function viewLeads() {
  const today = ymd();
  const rows = S.leads.slice().sort((a, b) => (a.next || '9999').localeCompare(b.next || '9999'));
  const overdue = rows.filter(r => r.next && r.next < today && !/عقد|مرفوض/.test(r.stage)).length;

  return `
  <h1>العملاء</h1>
  <p class="sub">المتابعة هي اللي تقفل الصفقات، مو الرسالة الأولى. ${overdue ? `<b style="color:var(--bad)">${overdue} متابعة متأخرة.</b>` : ''}</p>

  <div class="card">
    <h2>أضف عميلاً محتملاً</h2>
    <div class="row">
      <div class="field"><label>الاسم / الشركة</label><input type="text" id="l-name"></div>
      <div class="field"><label>المصدر</label><input type="text" id="l-source" placeholder="Upwork · إحالة · LinkedIn"></div>
      <div class="field"><label>القيمة المتوقعة $</label><input type="number" id="l-value" min="0" step="50"></div>
      <div class="field"><label>المتابعة القادمة</label><input type="date" id="l-next" value="${addDays(today, 3)}"></div>
      <div style="align-self:flex-end"><button class="btn btn-primary" data-addlead>أضف</button></div>
    </div>
  </div>

  <div class="card">
    ${rows.length ? `<div class="table-scroll"><table>
      <tr><th>الاسم</th><th>المصدر</th><th>المرحلة</th><th>القيمة</th><th>المتابعة</th><th></th></tr>
      ${rows.map(r => `<tr style="${r.next && r.next < today && !/عقد|مرفوض/.test(r.stage) ? 'background:rgba(179,52,31,.08)' : ''}">
        <td>${esc(r.name)}</td>
        <td>${esc(r.source || '')}</td>
        <td><select data-leadstage="${r.id}">${WBTIO.stages.map(s =>
          `<option ${s === r.stage ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></td>
        <td class="num">${money(r.value)}</td>
        <td><input type="date" data-leadnext="${r.id}" value="${esc(r.next || '')}"></td>
        <td><button class="btn btn-sm btn-danger" data-dellead="${r.id}">حذف</button></td>
      </tr>`).join('')}
    </table></div>` : '<p class="empty">ماكو عملاء بعد — ابدأ من مهمة M10: 20 رسالة لشبكتك.</p>'}
  </div>`;
}

/* ---------- كوريا ---------- */

function viewKorea() {
  const pts = S.korea.points || {};
  const total = WBTIO.f27.fields.reduce((a, f) => a + (Number(pts[f.id]) || 0), 0);
  const gap = Math.max(0, WBTIO.f27.passMark - total);

  return `
  <h1>مسار كوريا</h1>
  <p class="sub">كل رقم هنا مصدره موقع وسيط بتاريخ 2026-08-20 — تحقق منه من المصدر الرسمي قبل أي قرار.
     الطريقة كاملة في <code>korea/VERIFY-PROTOCOL.md</code>.</p>

  <div class="card">
    <h2>حاسبة نقاط F-2-7</h2>
    <p class="sub" style="margin-bottom:14px">النجاح ${WBTIO.f27.passMark} نقطة. هذي فيزا الإقامة التي تفتح الإقامة الدائمة F-5.</p>
    ${WBTIO.f27.fields.map(f => `
      <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line-2)">
        <div class="field"><label>${esc(f.label)}</label>
          <select data-pts="${f.id}">
            <option value="">— اختر —</option>
            ${f.options.map(o => `<option value="${o.v}" ${String(pts[f.id]) === String(o.v) ? 'selected' : ''}>${esc(o.t)} (${o.v})</option>`).join('')}
          </select></div>
        <span class="chip" style="align-self:flex-end;margin-bottom:9px">${Number(pts[f.id]) || 0}</span>
      </div>`).join('')}
    <div class="grid" style="margin-top:16px">
      <div class="stat"><div class="k">رصيدك</div><div class="v">${total}</div>
        <div class="bar"><i style="width:${Math.min(100, (total / WBTIO.f27.passMark) * 100)}%"></i></div></div>
      <div class="stat"><div class="k">الفجوة</div><div class="v" style="color:${gap ? 'var(--bad)' : 'var(--ok)'}">${gap}</div>
        <div class="n">${gap ? 'نقطة ناقصة' : 'وصلت العتبة'}</div></div>
    </div>
  </div>

  <div class="card">
    <h2>معالم المسار</h2>
    ${WBTIO.milestones.map(m => {
      const st = S.korea.milestones[m.id] || {};
      return `
      <div class="row" style="padding:10px 0;border-bottom:1px solid var(--line-2);align-items:flex-start">
        <input type="checkbox" data-ms="${m.id}" ${st.done ? 'checked' : ''}
               style="width:18px;height:18px;accent-color:var(--accent);margin-top:5px">
        <div style="flex:1 1 auto;min-width:0">
          <b style="${st.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(m.title)}</b>
          <div class="why" style="color:var(--muted);font-size:.9em">${esc(m.why)}</div>
        </div>
        <span class="chip">${esc(m.when)}</span>
      </div>`;
    }).join('')}
  </div>

  <div class="card">
    <h2>الملفات المرجعية</h2>
    <ul>
      <li><a href="../korea/PATHWAYS.md">المسارات الخمسة بالتفصيل</a></li>
      <li><a href="../korea/VERIFY-PROTOCOL.md">بروتوكول التحقق من المصادر الرسمية</a></li>
      <li><a href="../korea/DOCUMENTS.md">الوثائق والتصديق</a></li>
      <li><a href="../korea/TARGETS.md">الجامعات والشركات المستهدفة</a></li>
    </ul>
  </div>`;
}

/* ---------- الانضباط ---------- */

function viewDiscipline() {
  const d30 = disciplineStats(30), d90 = disciplineStats(90);
  return `
  <h1>الانضباط</h1>
  <p class="sub">هدفك ${WBTIO.goal.disciplineTarget}% من الأيام. اليوم يُحسب كاملاً لما تكتمل الأربع ساعات.</p>

  <div class="grid">
    <div class="stat"><div class="k">آخر 30 يوم</div><div class="v">${d30.pct}%</div>
      <div class="bar"><i style="width:${Math.min(100, d30.pct)}%"></i></div>
      <div class="n">${d30.full} كامل · ${d30.partial} جزئي</div></div>
    <div class="stat"><div class="k">آخر 90 يوم</div><div class="v">${d90.pct}%</div>
      <div class="n">${d90.full} من ${d90.span} يوم منذ البداية</div></div>
    <div class="stat"><div class="k">السلسلة</div><div class="v">${d30.streak}</div><div class="n">يوم متصل</div></div>
  </div>

  <div class="card">
    <h2>آخر 90 يوم</h2>
    <div class="streak-grid">
      ${d90.cells.map(c => `<i class="${c.sc === 1 ? 'on' : (c.sc > 0 ? 'partial' : '')}"
          style="${c.counted ? '' : 'opacity:.35'}" title="${c.iso}${c.counted ? '' : ' — قبل بداية الخطة'}"></i>`).join('')}
    </div>
    <p style="color:var(--muted);font-size:.85em;margin-top:12px">
      برتقالي = يوم كامل · أصفر = جزئي · فارغ = ما انسجّل.
    </p>
  </div>

  <div class="card">
    <h2>قاعدة التعافي</h2>
    <p><b>لا تفوّت يومين متتاليين.</b> يوم واحد ضائع حادث؛ يومان بداية عادة جديدة.
       إذا انكسر اليوم، سجّل نصف يوم — ساعة إنكليزي وساعة كوري فقط — ولا تحاول تعويض ما فات.
       التعويض يولّد إرهاقاً واليوم اللي بعده يضيع هو الثاني.</p>
    <p style="color:var(--muted)">لو نزلت تحت ${WBTIO.goal.disciplineTarget}% لأسبوعين متتاليين:
       قلّل اليوم الأدنى إلى ثلاث ساعات مؤقتاً بدل ما توقف كلياً. النظام اللي ينكسر مرة واحدة أفضل من نظام يُهجَر.</p>
  </div>`;
}

/* ---------- الإعدادات ---------- */

function viewSettings() {
  const st = S.settings;
  return `
  <h1>الإعدادات</h1>
  <p class="sub">اللوحة إلك — غيّر شكلها وقت ما تمل منها. كل شي هنا ينحفظ.</p>

  <div class="card">
    <h2>المظهر</h2>
    <div class="set-row"><span class="lbl">الثيم</span>
      <select data-set="theme">
        <option value="auto"  ${st.theme === 'auto'  ? 'selected' : ''}>تلقائي حسب النظام</option>
        <option value="light" ${st.theme === 'light' ? 'selected' : ''}>فاتح</option>
        <option value="dark"  ${st.theme === 'dark'  ? 'selected' : ''}>غامق</option>
      </select></div>
    <div class="set-row"><span class="lbl">اللون الأساسي</span>
      <div class="swatches">
        ${ACCENTS.map(c => `<button class="swatch" style="background:${c}" data-accent="${c}"
            aria-pressed="${st.accent === c}" aria-label="${c}"></button>`).join('')}
        <input type="color" data-accent-custom value="${esc(st.accent)}" style="width:44px;padding:2px" aria-label="لون مخصص">
      </div></div>
    <div class="set-row"><span class="lbl">الخط</span>
      <select data-set="font">
        <option value="system" ${st.font === 'system' ? 'selected' : ''}>خط النظام</option>
        <option value="tahoma" ${st.font === 'tahoma' ? 'selected' : ''}>Tahoma</option>
        <option value="serif"  ${st.font === 'serif'  ? 'selected' : ''}>مشرَّف (Serif)</option>
        <option value="mono"   ${st.font === 'mono'   ? 'selected' : ''}>ثابت العرض</option>
      </select></div>
    <div class="set-row"><span class="lbl">حجم الخط — ${st.fs}px</span>
      <input type="range" min="13" max="22" step="1" value="${st.fs}" data-set="fs" style="flex:1 1 160px"></div>
    <div class="set-row"><span class="lbl">الكثافة</span>
      <select data-set="density">
        <option value="compact" ${st.density === 'compact' ? 'selected' : ''}>مضغوط</option>
        <option value="normal"  ${st.density === 'normal'  ? 'selected' : ''}>عادي</option>
        <option value="roomy"   ${st.density === 'roomy'   ? 'selected' : ''}>مريح</option>
      </select></div>
  </div>

  <div class="card">
    <h2>الأقسام — أظهر وأخفِ ورتّب</h2>
    ${st.order.map((id, i) => {
      const s = SECTIONS.find(x => x.id === id); if (!s) return '';
      const locked = id === 'settings';
      return `<div class="set-row">
        <span class="lbl">${esc(s.label)}</span>
        <button class="btn btn-sm" data-moveup="${id}" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn btn-sm" data-movedown="${id}" ${i === st.order.length - 1 ? 'disabled' : ''}>▼</button>
        <label style="display:flex;align-items:center;gap:6px;margin:0">
          <input type="checkbox" data-vis="${id}" ${st.visible[id] ? 'checked' : ''} ${locked ? 'disabled' : ''}
                 style="width:18px;height:18px;accent-color:var(--accent)">
          <span>${locked ? 'دائم' : 'ظاهر'}</span>
        </label>
      </div>`;
    }).join('')}
  </div>

  <div class="card">
    <h2>الأرقام الأساسية</h2>
    <div class="set-row"><span class="lbl">تاريخ بداية الخطة</span>
      <input type="date" data-set="startDate" value="${esc(st.startDate)}" style="flex:1 1 160px"></div>
    <div class="set-row"><span class="lbl">سعر الدولار بالوون (للعرض)</span>
      <input type="number" data-set="krw" value="${st.krw}" min="500" step="10" style="flex:1 1 160px"></div>
  </div>

  <div class="card">
    <h2>البيانات</h2>
    <p style="color:var(--muted)">كل شي محفوظ بمتصفحك فقط. مسح بيانات المتصفح يمحوها كلها —
       فخذ نسخة JSON كل أسبوع واحفظها بمكان ثاني. الملف مُصمَّم ليُستورد لاحقاً بقاعدة بيانات.</p>
    <div class="row" style="margin-top:12px">
      <button class="btn btn-primary" data-export>تصدير JSON</button>
      <button class="btn" data-import>استيراد JSON</button>
      <button class="btn btn-danger" data-reset>مسح كل شي</button>
    </div>
    <input type="file" id="importfile" accept="application/json,.json" hidden>
  </div>

  <div class="card">
    <h2>الملفات</h2>
    <ul>
      <li><a href="../AI-BRIEFING.md">AI-BRIEFING.md — الصقه لأي أداة ذكاء اصطناعي تكمل بيها</a></li>
      <li><a href="../system/TASKS.md">قاعدة المهام كاملة كنص</a></li>
      <li><a href="../system/MINIMUM-VIABLE-DAY.md">اليوم الأدنى</a></li>
      <li><a href="../korea/PATHWAYS.md">مسارات كوريا</a></li>
    </ul>
  </div>`;
}

/* ------------------------------ الأحداث ------------------------------ */

document.addEventListener('click', e => {
  const t = e.target;
  const has = a => t.closest('[' + a + ']');
  let el;

  if ((el = t.closest('.tab'))) { view = el.dataset.view; render(); return; }

  if ((el = has('data-expand'))) {
    const body = $('.task-body', el.closest('.task'));
    body.hidden = !body.hidden;
    el.textContent = body.hidden ? 'تفاصيل' : 'إخفاء';
    return;
  }

  if ((el = has('data-toggle-uni'))) {
    const r = dayRec(); r.uniDay = !r.uniDay; save(); render(); return;
  }

  if ((el = has('data-addtask'))) {
    const title = prompt('عنوان المهمة؟'); if (!title) return;
    const why = prompt('ليش هي مهمة؟ (اختياري)') || 'مهمة أضفتها بنفسك.';
    const dw = prompt('متى تعتبرها منجزة؟ (اختياري)') || 'لما تخلص منها.';
    const est = parseInt(prompt('كم دقيقة تتوقعها؟ (اختياري)') || '60', 10) || 60;
    S.customTasks.push({
      id: uid(), p: 'money', ph: currentMonthIndex(), t: title, why: why,
      st: [], dw: dw, est: est, createdAt: new Date().toISOString()
    });
    save(); render(); toast('انضافت'); return;
  }

  if ((el = has('data-deltask'))) {
    const id = el.dataset.deltask;
    if (!confirm('تحذفها من قائمتك؟')) return;
    const i = S.customTasks.findIndex(x => x.id === id);
    if (i > -1) S.customTasks.splice(i, 1); else patchTask(id, { deleted: true });
    save(); render(); toast('انحذفت'); return;
  }

  if ((el = has('data-addincome'))) {
    const amount = Number($('#i-amount').value);
    if (!amount) { toast('اكتب المبلغ'); return; }
    const rec = {
      id: uid(), date: $('#i-date').value || ymd(),
      client: $('#i-client').value.trim(), amount: amount,
      createdAt: new Date().toISOString()
    };
    if ($('#i-kind').value === 'savings') S.savings.push(rec); else S.income.push(rec);
    save(); render(); toast('انسجّلت'); return;
  }

  if ((el = has('data-delincome'))) {
    S.income = S.income.filter(r => r.id !== el.dataset.delincome); save(); render(); return;
  }
  if ((el = has('data-delsaving'))) {
    S.savings = S.savings.filter(r => r.id !== el.dataset.delsaving); save(); render(); return;
  }

  if ((el = has('data-addlead'))) {
    const name = $('#l-name').value.trim();
    if (!name) { toast('اكتب الاسم'); return; }
    S.leads.push({
      id: uid(), name: name, source: $('#l-source').value.trim(),
      value: Number($('#l-value').value) || 0, next: $('#l-next').value,
      stage: WBTIO.stages[0], createdAt: new Date().toISOString()
    });
    save(); render(); toast('انضاف'); return;
  }

  if ((el = has('data-dellead'))) {
    S.leads = S.leads.filter(r => r.id !== el.dataset.dellead); save(); render(); return;
  }

  if ((el = has('data-accent'))) {
    S.settings.accent = el.dataset.accent; save(); render(); return;
  }

  if ((el = has('data-moveup')) || (el = has('data-movedown'))) {
    const id = el.dataset.moveup || el.dataset.movedown;
    const dir = el.dataset.moveup ? -1 : 1;
    const o = S.settings.order, i = o.indexOf(id), j = i + dir;
    if (i > -1 && j >= 0 && j < o.length) { o[i] = o[j]; o[j] = id; save(); render(); }
    return;
  }

  if (has('data-export')) {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wbtio-korea-' + ymd() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    S.meta.lastBackupAt = new Date().toISOString();
    save(); renderBackupNotice(); toast('تنزّل الملف — احفظه بمكان ثاني');
    return;
  }

  if (has('data-import')) { $('#importfile').click(); return; }

  if (has('data-reset')) {
    if (!confirm('راح ينمحي كل شي بلا رجعة. متأكد؟')) return;
    if (!confirm('آخر تأكيد — أخذت نسخة احتياطية؟')) return;
    localStorage.removeItem(KEY); S = defaults(); save(); render(); toast('انمسح كل شي');
    return;
  }

  if (has('data-dobackup')) { $('[data-export]') ? $('[data-export]').click() : (view = 'settings', render()); return; }
});

document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;

  if (d.core !== undefined) {
    const r = dayRec(); r.core[d.core] = t.checked; save(); render(); return;
  }
  if (d.min !== undefined) { dayRec()[d.min] = Number(t.value) || 0; save(); return; }
  if (d.quickdone !== undefined) {
    patchTask(d.quickdone, { status: 'done', doneAt: new Date().toISOString() }); render(); return;
  }
  if (d.done !== undefined) {
    patchTask(d.done, t.checked
      ? { status: 'done', doneAt: new Date().toISOString() }
      : { status: 'todo', doneAt: null });
    render(); return;
  }
  if (d.est    !== undefined) { patchTask(d.est, { estMin: Number(t.value) || 0 }); return; }
  if (d.actual !== undefined) { patchTask(d.actual, { actualMin: t.value === '' ? null : Number(t.value) }); return; }
  if (d.filter !== undefined) { taskFilter[d.filter] = t.value; render(); return; }
  if (d.week   !== undefined) {
    const wk = weekKey(); S.weeks[wk] = S.weeks[wk] || {};
    S.weeks[wk][d.week] = Number(t.value) || 0; save(); render(); return;
  }
  if (d.pts !== undefined) {
    S.korea.points[d.pts] = t.value === '' ? 0 : Number(t.value); save(); render(); return;
  }
  if (d.ms !== undefined) {
    S.korea.milestones[d.ms] = { done: t.checked, at: t.checked ? ymd() : null }; save(); render(); return;
  }
  if (d.leadstage !== undefined) {
    const l = S.leads.find(x => x.id === d.leadstage); if (l) { l.stage = t.value; save(); render(); } return;
  }
  if (d.leadnext !== undefined) {
    const l = S.leads.find(x => x.id === d.leadnext); if (l) { l.next = t.value; save(); render(); } return;
  }
  if (d.vis !== undefined) { S.settings.visible[d.vis] = t.checked; save(); render(); return; }
  if (d.set !== undefined) {
    const v = (d.set === 'fs' || d.set === 'krw') ? Number(t.value) : t.value;
    S.settings[d.set] = v; save(); render(); return;
  }
  if (d.accentCustom !== undefined) { S.settings.accent = t.value; save(); render(); return; }

  if (t.id === 'importfile' && t.files && t.files[0]) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const parsed = JSON.parse(fr.result);
        if (!parsed || typeof parsed !== 'object' || !parsed.settings) throw new Error('ملف غير صالح');
        if (!confirm('راح يستبدل بياناتك الحالية. أكمل؟')) return;
        S = migrate(parsed); save(); render(); toast('انستورد الملف');
      } catch (err) { toast('الملف مو صالح'); console.error(err); }
    };
    fr.readAsText(t.files[0]);
    t.value = '';
  }
});

/* الحقول النصية تُحفظ عند مغادرتها لا مع كل حرف */
document.addEventListener('blur', e => {
  const d = e.target.dataset || {};
  if (d.notes    !== undefined) { patchTask(d.notes, { notes: e.target.value }); return; }
  if (d.daynote  !== undefined) { dayRec().note = e.target.value; save(); return; }
  if (d.weeknote !== undefined) {
    const wk = weekKey(); S.weeks[wk] = S.weeks[wk] || {};
    S.weeks[wk].note = e.target.value; save(); return;
  }
}, true);

/* شريط تمرير حجم الخط يتحدث مباشرة بلا إعادة رسم كاملة */
document.addEventListener('input', e => {
  if (e.target.dataset && e.target.dataset.set === 'fs') {
    S.settings.fs = Number(e.target.value);
    document.documentElement.style.setProperty('--fs', S.settings.fs + 'px');
    const lbl = e.target.closest('.set-row') && e.target.closest('.set-row').querySelector('.lbl');
    if (lbl) lbl.textContent = 'حجم الخط — ' + S.settings.fs + 'px';
    saveSoon();
  }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (S.settings.theme === 'auto') applySettings();
});

/* أول تشغيل: خزّن نسخة حتى لو ما لمس شي */
if (!localStorage.getItem(KEY)) save();
render();

})();
