const KEY = "sageuk-watched-v1";
const TAGS = {dup:"مكرر", ask:"تأكيد", note:"ملاحظة"};

/* لوحة ألوان ورمز بصري لكل نوع — تُستخدم للغلاف البديل قبل ما تنزّل الغلاف الحقيقي */
const G = {
  "اكشن":    {a:"#2A1012", b:"#7A241C", ink:"#F6C9A8", m:"blade"},
  "دراما":   {a:"#0E1B29", b:"#22485C", ink:"#CFE6EE", m:"moon"},
  "كوميدي":  {a:"#3A2107", b:"#965013", ink:"#FCE0BC", m:"lantern"},
  "تاريخي":  {a:"#221809", b:"#63481A", ink:"#F0DFB8", m:"roof"},
  "خيالي":   {a:"#171034", b:"#432E76", ink:"#DCD0FA", m:"stars"},
  "رومانسي": {a:"#2B1020", b:"#7A2748", ink:"#FAD0E0", m:"blossom"},
  "جريمة":   {a:"#0C0F11", b:"#2E383E", ink:"#CFDADF", m:"rain"},
  "عائلي":   {a:"#10231A", b:"#2F6242", ink:"#D2EEDC", m:"house"},
  "مغامرة":  {a:"#0B2126", b:"#1F625C", ink:"#CCEFE7", m:"peaks"}
};

/* رسم الزخرفة داخل الغلاف — viewBox 300x450 */
function motif(kind, ink){
  const o = (v) => 'stroke="' + ink + '" fill="none" stroke-opacity="' + v + '"';
  switch (kind){
    case "moon":
      return '<circle cx="205" cy="120" r="62" fill="' + ink + '" fill-opacity=".16"/>' +
             '<circle cx="205" cy="120" r="62" ' + o(.35) + ' stroke-width="1.2"/>' +
             '<path d="M20 210h120M40 232h150M10 254h95" ' + o(.22) + ' stroke-width="1.6"/>';
    case "blade":
      return '<path d="M40 380L250 90M250 380L40 90" ' + o(.30) + ' stroke-width="2.2"/>' +
             '<circle cx="145" cy="235" r="70" ' + o(.22) + ' stroke-width="1.2"/>' +
             '<circle cx="145" cy="235" r="26" fill="' + ink + '" fill-opacity=".14"/>';
    case "lantern":
      return [70,150,230].map((x,i) =>
             '<path d="M' + x + ' 30v' + (52+i*26) + '" ' + o(.28) + ' stroke-width="1.2"/>' +
             '<rect x="' + (x-24) + '" y="' + (82+i*26) + '" width="48" height="62" rx="22" fill="' + ink + '" fill-opacity=".17"/>' +
             '<rect x="' + (x-24) + '" y="' + (82+i*26) + '" width="48" height="62" rx="22" ' + o(.34) + ' stroke-width="1.1"/>').join("");
    case "roof":
      return [0,1,2].map(i =>
             '<path d="M' + (10-i*6) + ' ' + (150+i*72) + 'q140 -' + (46+i*8) + ' ' + (280+i*12) + ' 0" ' + o(.34-i*.07) + ' stroke-width="2.4"/>').join("") +
             '<path d="M150 150v250" ' + o(.14) + ' stroke-width="1.2"/>';
    case "stars":
      return '<path d="M232 92a54 54 0 1 1-46-52 44 44 0 0 0 46 52z" fill="' + ink + '" fill-opacity=".20"/>' +
             [[52,72],[96,156],[240,210],[64,262],[190,318],[120,392],[264,352],[32,178]]
             .map((p,i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (1.6+(i%3)) + '" fill="' + ink + '" fill-opacity="' + (.3+(i%3)*.16) + '"/>').join("");
    case "blossom":
      return [[92,140,30],[210,250,24],[120,330,20]].map(p =>
             [0,1,2,3,4].map(k => {
               const ang = k * 72 * Math.PI/180;
               return '<circle cx="' + (p[0]+Math.cos(ang)*p[2]).toFixed(1) + '" cy="' + (p[1]+Math.sin(ang)*p[2]).toFixed(1) +
                      '" r="' + (p[2]*.62).toFixed(1) + '" fill="' + ink + '" fill-opacity=".14"/>';
             }).join("") + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2]*.26) + '" fill="' + ink + '" fill-opacity=".3"/>').join("");
    case "rain":
      return Array.from({length:26}, (_,i) =>
             '<path d="M' + (-30+i*14) + ' 40l-34 120" ' + o(.10+(i%4)*.045) + ' stroke-width="1.3"/>').join("");
    case "house":
      return '<path d="M42 250h216M60 250v92M240 250v92" ' + o(.30) + ' stroke-width="2"/>' +
             '<path d="M22 250q128 -70 256 0" ' + o(.38) + ' stroke-width="2.6"/>' +
             '<rect x="118" y="286" width="64" height="56" fill="' + ink + '" fill-opacity=".16"/>' +
             '<circle cx="222" cy="112" r="40" fill="' + ink + '" fill-opacity=".13"/>';
    case "peaks":
      return '<path d="M-10 340l92-128 62 84 54-70 112 114z" fill="' + ink + '" fill-opacity=".16"/>' +
             '<path d="M-10 340l92-128 62 84 54-70 112 114" ' + o(.32) + ' stroke-width="1.8"/>' +
             '<circle cx="228" cy="96" r="34" fill="' + ink + '" fill-opacity=".18"/>';
    default: return "";
  }
}

/* شريط دانتشونغ (زخرفة القصور الكورية) بأسفل الغلاف */
function dancheong(ink){
  return '<g opacity=".5">' + Array.from({length:10}, (_,i) =>
    '<path d="M' + (i*32) + ' 450v-20q16 -14 32 0v20z" fill="' + ink + '" fill-opacity="' + (i%2 ? .14 : .26) + '"/>').join("") + '</g>';
}

function artSVG(d){
  const g = G[d.g] || G["دراما"];
  const id = "g" + d.i;
  return '<svg class="art" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0.7" y2="1">' +
      '<stop offset="0" stop-color="' + g.b + '"/><stop offset="1" stop-color="' + g.a + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="300" height="450" fill="url(#' + id + ')"/>' +
    motif(g.m, g.ink) + dancheong(g.ink) +
  '</svg>';
}

/* المسلسلات المعلّمة مسبقاً — تنطبق أول مرة تنفتح الصفحة فقط، بعدها المتصفح يحفظ اختياراتك */
const PRESET = [1, 4, 8, 10, 13, 14, 16, 21, 22, 23, 24, 27, 32, 37, 39, 43, 48, 53, 54, 58, 59, 62, 65, 67, 68, 75, 77];
let seen = new Set(PRESET);
try {
  const saved = localStorage.getItem(KEY);
  if (saved !== null) seen = new Set(JSON.parse(saved));
} catch (e) {}
const state = {q:"", st:"all", genre:"", sort:"orig"};
const $ = (s) => document.querySelector(s);
const gridEl = $("#grid"), emptyEl = $("#empty");
const pad = (n) => String(n).padStart(3, "0");
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...seen])); } catch (e) {} };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));

function toast(msg){
  const t = $("#toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2000);
}

[...new Set(DATA.map(d => d.g))].sort().forEach(g => {
  const o = document.createElement("option");
  o.value = g; o.textContent = g;
  $("#genre").append(o);
});

function visible(){
  const q = state.q.trim().toLowerCase();
  let out = DATA.filter(d => {
    if (state.st === "seen" && !seen.has(d.i)) return false;
    if (state.st === "new" && seen.has(d.i)) return false;
    if (state.genre && d.g !== state.genre) return false;
    if (q && !(d.ar + " " + d.lat + " " + d.s).toLowerCase().includes(q)) return false;
    return true;
  });
  const s = state.sort;
  if (s === "rate") out = out.slice().sort((a, b) => (b.r ?? -1) - (a.r ?? -1));
  else if (s === "new") out = out.slice().sort((a, b) => b.y - a.y);
  else if (s === "old") out = out.slice().sort((a, b) => a.y - b.y);
  else if (s === "az") out = out.slice().sort((a, b) => a.ar.localeCompare(b.ar, "ar"));
  return out;
}

function render(){
  const rows = visible();
  gridEl.innerHTML = rows.map(d => {
    const on = seen.has(d.i);
    const tag = d.f ? '<span class="tag ' + d.f + '">' + TAGS[d.f] + "</span>" : "";
    const rate = d.r === null
      ? '<div class="p-rate none">—</div>'
      : '<div class="p-rate">★ ' + d.r.toFixed(1) + "</div>";
    return '<article class="card' + (on ? " seen" : "") + '" data-id="' + d.i + '">' +
      '<div class="poster">' + artSVG(d) +
        '<img class="real" src="images/' + pad(d.i) + '.jpg" alt="" loading="lazy" onerror="this.remove()">' +
        rate +
        '<button class="seal" aria-pressed="' + on + '" aria-label="' + esc(d.ar) + ' — علّم كمشاهَد">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5.2 5.2L20 7"></path></svg>' +
        "</button>" +
        '<div class="scrim"><div class="p-name">' + esc(d.ar) + "</div>" +
          (d.lat ? '<div class="p-sub">' + esc(d.lat) + "</div>" : "") +
        "</div>" +
      "</div>" +
      '<div class="body">' +
        '<h3 class="t-ar">' + esc(d.ar) + tag + "</h3>" +
        '<div class="meta"><span class="yr">' + d.y + '</span><span class="dot">·</span><span class="gn">' + esc(d.g) + "</span></div>" +
        '<p class="story">' + esc(d.s) + "</p>" +
      "</div>" +
    "</article>";
  }).join("");
  emptyEl.hidden = rows.length > 0;
}

function stats(){
  const mine = DATA.filter(d => seen.has(d.i));
  const n = mine.length;
  $("#pNum").textContent = n;
  $("#pBar").style.width = (n / DATA.length * 100) + "%";
  $("#sSeen").textContent = n;
  $("#sLeft").textContent = DATA.length - n;
  const rated = mine.filter(d => d.r !== null);
  $("#sAvg").textContent = rated.length ? (rated.reduce((a, d) => a + d.r, 0) / rated.length).toFixed(2) : "—";
  if (!n) { $("#sGenre").textContent = "—"; return; }
  const tally = {};
  mine.forEach(d => { tally[d.g] = (tally[d.g] || 0) + 1; });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  $("#sGenre").textContent = top[0] + " (" + top[1] + ")";
}

gridEl.addEventListener("click", (e) => {
  const story = e.target.closest(".story");
  if (story) { story.classList.toggle("open"); return; }
  const btn = e.target.closest(".seal");
  if (!btn) return;
  const card = btn.closest(".card");
  const id = +card.dataset.id;
  if (seen.has(id)) seen.delete(id); else seen.add(id);
  save();
  const on = seen.has(id);
  btn.setAttribute("aria-pressed", on);
  card.classList.toggle("seen", on);
  stats();
  if (state.st !== "all") render();
});

$("#q").addEventListener("input", (e) => { state.q = e.target.value; render(); });
$("#genre").addEventListener("change", (e) => { state.genre = e.target.value; render(); });
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
document.querySelectorAll(".chips button").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".chips button").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    state.st = b.dataset.st;
    render();
  });
});

function exportText(){
  const mine = DATA.filter(d => seen.has(d.i)).sort((a, b) => (b.r ?? -1) - (a.r ?? -1));
  if (!mine.length) return "ما علّمت على أي مسلسل بعد.";
  const lines = ["المسلسلات اللي شاهدتها (" + mine.length + " من " + DATA.length + "):", ""];
  mine.forEach((d, k) => {
    lines.push((k + 1) + ". " + d.ar + (d.lat ? " — " + d.lat : "") +
               " (" + d.y + ") · " + d.g + (d.r === null ? "" : " · ★" + d.r.toFixed(1)));
  });
  lines.push("", "الأرقام بالقائمة الأصلية: " + DATA.filter(d => seen.has(d.i)).map(d => d.i).join("، "));
  return lines.join("\n");
}

$("#btnExport").addEventListener("click", () => { $("#out").value = exportText(); $("#dlg").showModal(); });
$("#btnCopy").addEventListener("click", async () => {
  const ta = $("#out"); ta.focus(); ta.select();
  let ok = false;
  try { await navigator.clipboard.writeText(ta.value); ok = true; }
  catch (e) { try { ok = document.execCommand("copy"); } catch (e2) {} }
  toast(ok ? "اننسخ النص ✓" : "حدّد النص وانسخه يدوياً");
});
$("#btnReset").addEventListener("click", () => {
  if (!seen.size) { toast("السجل فاضي أصلاً"); return; }
  if (!confirm("متأكد تريد تمسح كل العلامات؟")) return;
  seen.clear(); save(); render(); stats(); toast("انمسح السجل");
});

render();
stats();
