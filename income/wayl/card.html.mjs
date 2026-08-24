// بطاقة منتج متجر Wayl — 1200×1200
// 🔴 قاعدة واحدة تحكم كل شي: **الصورة صورة منتج، لا صفحة بيع.**
//    مثل صورة iPhone بالمتجر: الشكل + الاسم. وبس.
//    ممنوع على الصورة: السعر · الدرجات · قائمة المزايا · الوصف · التسليم.
//    كل ذلك مكانه حقل الوصف بـWayl — جاهز بـ product/<فئة>/<SKU>/wayl.md
//
// ولكل فئة **شكل بصري مختلف** — لا قالب واحد مكرَّر 36 مرة.

export const THEME = {
  'مدخل':          { bg: '#EFF6FF', accent: '#2563EB', art: 'spark' },
  'ويب':           { bg: '#ECFEFF', accent: '#0891B2', art: 'browser' },
  'موبايل':        { bg: '#FFFBEB', accent: '#D97706', art: 'phone' },
  'أتمتة':         { bg: '#ECFDF5', accent: '#059669', art: 'flow' },
  'أتمتة جاهزة':   { bg: '#FFF7ED', accent: '#EA580C', art: 'box' },
  'بيانات':        { bg: '#F5F3FF', accent: '#7C3AED', art: 'chart' },
  'ذكاء اصطناعي':  { bg: '#FDF2F8', accent: '#DB2777', art: 'nodes' },
  'اشتراك':        { bg: '#F1F5F9', accent: '#475569', art: 'calendar' },
  'أداة دفع':      { bg: '#FAFAFA', accent: '#52525B', art: 'receipt' },
};

const INK = '#0A0A0A';
const DIM = '#71717A';

const themeFor = (i) =>
  i.kind === 'payment_tool' ? THEME['أداة دفع']
  : i.kind === 'subscription' ? THEME['اشتراك']
  : THEME[i.cat] || THEME['مدخل'];

export const toIQD = (usd, rate) => {
  const raw = usd * rate;
  const step = raw >= 100_000 ? 1000 : 100;
  return (Math.round(raw / step) * step).toLocaleString('en-US');
};

export const entryTier = (item) =>
  (item.tiers || []).reduce((min, t) => (!min || t.price < min.price ? t : min), null);

// ══ الأشكال — كل واحد 520×520، بلا نص إطلاقاً ═══════════════════════════════
const ART = {

spark: (c) => `<svg viewBox="0 0 520 520">
  <circle cx="260" cy="260" r="200" fill="none" stroke="${c}" stroke-width="3" opacity=".25"/>
  <circle cx="260" cy="260" r="150" fill="#fff" stroke="${c}" stroke-width="3" opacity=".9"/>
  ${[0, 60, 120, 180, 240, 300].map(a => {
    const r = (a * Math.PI) / 180;
    return `<circle cx="${260 + 200 * Math.cos(r)}" cy="${260 + 200 * Math.sin(r)}" r="16" fill="${c}"/>`;
  }).join('')}
  <path d="M260 178 l26 58 62 8 -46 44 12 62 -54 -31 -54 31 12 -62 -46 -44 62 -8z" fill="${c}"/>
</svg>`,

browser: (c) => `<svg viewBox="0 0 520 520">
  <rect x="30" y="90" width="460" height="340" rx="26" fill="#fff" stroke="${INK}" stroke-width="5"/>
  <path d="M30 152 h460" stroke="${INK}" stroke-width="5"/>
  <circle cx="70" cy="121" r="9" fill="#EF4444"/><circle cx="100" cy="121" r="9" fill="#F59E0B"/>
  <circle cx="130" cy="121" r="9" fill="#22C55E"/>
  <rect x="160" y="110" width="300" height="22" rx="11" fill="${c}" opacity=".2"/>
  <rect x="66" y="186" width="180" height="20" rx="10" fill="${c}"/>
  <rect x="66" y="224" width="388" height="14" rx="7" fill="${c}" opacity=".3"/>
  <rect x="66" y="252" width="330" height="14" rx="7" fill="${c}" opacity=".3"/>
  <rect x="66" y="298" width="180" height="98" rx="14" fill="${c}" opacity=".22"/>
  <rect x="274" y="298" width="180" height="98" rx="14" fill="${c}" opacity=".22"/>
</svg>`,

phone: (c) => `<svg viewBox="0 0 520 520">
  <rect x="168" y="34" width="184" height="452" rx="40" fill="#fff" stroke="${INK}" stroke-width="9"/>
  <rect x="228" y="52" width="64" height="9" rx="5" fill="${INK}"/>
  <rect x="192" y="92" width="88" height="16" rx="8" fill="${c}" opacity=".35"/>
  <rect x="192" y="126" width="136" height="96" rx="14" fill="${c}" opacity=".28"/>
  <rect x="192" y="238" width="136" height="16" rx="8" fill="${c}" opacity=".35"/>
  <rect x="192" y="268" width="96" height="16" rx="8" fill="${c}" opacity=".2"/>
  <rect x="192" y="304" width="136" height="96" rx="14" fill="${c}" opacity=".28"/>
  <rect x="204" y="424" width="112" height="38" rx="19" fill="${c}"/>
</svg>`,

flow: (c) => `<svg viewBox="0 0 520 520">
  ${[[70, 140], [70, 380]].map(([x, y]) =>
    `<rect x="${x - 40}" y="${y - 40}" width="80" height="80" rx="20" fill="#fff" stroke="${c}" stroke-width="5"/>`).join('')}
  <rect x="200" y="220" width="120" height="80" rx="22" fill="${c}"/>
  <circle cx="260" cy="260" r="14" fill="#fff"/>
  ${[[70, 140], [70, 380]].map(([x, y]) =>
    `<path d="M${x + 44} ${y} C 140 ${y}, 150 260, 196 260" fill="none" stroke="${c}" stroke-width="5" opacity=".55"/>`).join('')}
  ${[[450, 140], [450, 260], [450, 380]].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="34" fill="#fff" stroke="${c}" stroke-width="5"/>` +
    `<path d="M324 260 C 370 260, 380 ${y}, ${x - 38} ${y}" fill="none" stroke="${c}" stroke-width="5" opacity=".55"/>`).join('')}
</svg>`,

box: (c) => `<svg viewBox="0 0 520 520">
  <path d="M260 60 L470 168 L470 356 L260 464 L50 356 L50 168 Z" fill="#fff" stroke="${INK}" stroke-width="6"/>
  <path d="M50 168 L260 276 L470 168" fill="none" stroke="${INK}" stroke-width="6"/>
  <path d="M260 276 L260 464" stroke="${INK}" stroke-width="6"/>
  <path d="M155 114 L365 222" stroke="${c}" stroke-width="6" opacity=".4"/>
  <circle cx="260" cy="368" r="52" fill="${c}"/>
  <path d="M236 368 l16 18 32 -38" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
</svg>`,

chart: (c) => `<svg viewBox="0 0 520 520">
  <path d="M70 60 V440 H460" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${[[120, 150], [196, 240], [272, 110], [348, 300], [424, 190]].map(([x, h]) =>
    `<rect x="${x - 26}" y="${440 - h}" width="52" height="${h}" rx="10" fill="${c}" opacity=".85"/>`).join('')}
  <path d="M120 246 L196 190 L272 300 L348 128 L424 232" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  ${[[120, 246], [196, 190], [272, 300], [348, 128], [424, 232]].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="${INK}" stroke-width="6"/>`).join('')}
</svg>`,

nodes: (c) => {
  const pts = [[260, 90], [110, 200], [410, 200], [170, 380], [350, 380], [260, 260]];
  const link = [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [0, 1], [0, 2], [3, 4]];
  return `<svg viewBox="0 0 520 520">
  ${link.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="${c}" stroke-width="5" opacity=".4"/>`).join('')}
  ${pts.map((p, k) => k === 5
    ? `<circle cx="${p[0]}" cy="${p[1]}" r="54" fill="${c}"/>
       <circle cx="${p[0]}" cy="${p[1]}" r="20" fill="#fff"/>`
    : `<circle cx="${p[0]}" cy="${p[1]}" r="30" fill="#fff" stroke="${c}" stroke-width="6"/>`).join('')}
</svg>`;
},

calendar: (c) => `<svg viewBox="0 0 520 520">
  <rect x="50" y="90" width="420" height="366" rx="28" fill="#fff" stroke="${INK}" stroke-width="6"/>
  <path d="M50 178 h420" stroke="${INK}" stroke-width="6"/>
  <rect x="132" y="52" width="20" height="74" rx="10" fill="${INK}"/>
  <rect x="368" y="52" width="20" height="74" rx="10" fill="${INK}"/>
  ${[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3, 4].map(k => {
    const x = 96 + k * 76, y = 222 + r * 58;
    const on = (r * 5 + k) % 4 === 0;
    return `<circle cx="${x}" cy="${y}" r="${on ? 21 : 15}" fill="${c}" opacity="${on ? 1 : 0.22}"/>`;
  })).join('')}
</svg>`,

receipt: (c) => `<svg viewBox="0 0 520 520">
  <path d="M120 60 h280 v380 l-28 -22 -28 22 -28 -22 -28 22 -28 -22 -28 22 -28 -22 -28 22 -28 -22 Z"
    fill="#fff" stroke="${INK}" stroke-width="6"/>
  ${[130, 186, 242].map(y => `<rect x="164" y="${y}" width="192" height="16" rx="8" fill="${c}" opacity=".3"/>`).join('')}
  <path d="M164 302 h192" stroke="${c}" stroke-width="5" stroke-dasharray="14 12"/>
  <rect x="164" y="336" width="120" height="24" rx="12" fill="${c}"/>
</svg>`,
};


// ══ أشكال خاصة لكل خدمة — تُرجَّح على شكل الفئة ═════════════════════════════
// نمط ثابت: حدود سوداء 6px + تعبئة بلون الفئة · بلا نص إطلاقاً
const W = 6;
const SKU_ART = {

'START-01': (c) => `<svg viewBox="0 0 520 520">
  <circle cx="228" cy="228" r="140" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M330 330 L446 446" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M172 250 l40 44 76 -96" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>
</svg>`,

'FIX-01': (c) => `<svg viewBox="0 0 520 520">
  <path d="M80 380 A180 180 0 1 1 440 380" fill="none" stroke="${INK}" stroke-width="${W}"/>
  <path d="M80 380 A180 180 0 0 1 140 246" fill="none" stroke="${c}" stroke-width="26" stroke-linecap="round"/>
  <path d="M260 380 L378 214" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
  <circle cx="260" cy="380" r="26" fill="${c}"/>
</svg>`,

'SETUP-01': (c) => `<svg viewBox="0 0 520 520">
  <circle cx="260" cy="260" r="180" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <ellipse cx="260" cy="260" rx="80" ry="180" fill="none" stroke="${c}" stroke-width="${W}"/>
  <path d="M80 260 h360 M112 168 h296 M112 352 h296" stroke="${c}" stroke-width="${W}" opacity=".7"/>
  <circle cx="380" cy="380" r="66" fill="${c}"/>
  <path d="M404 356 a26 26 0 1 0 -8 42 h-30" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
</svg>`,

'LAND-01': (c) => `<svg viewBox="0 0 520 520">
  <path d="M70 70 h380 l-70 150 h-240 z" fill="${c}" opacity=".3" stroke="${INK}" stroke-width="${W}"/>
  <path d="M140 220 h240 l-52 120 h-136 z" fill="${c}" opacity=".6" stroke="${INK}" stroke-width="${W}"/>
  <path d="M192 340 h136 l-40 110 h-56 z" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="260" cy="472" r="26" fill="${INK}"/>
</svg>`,

'SHOP-01': (c) => `<svg viewBox="0 0 520 520">
  <path d="M60 170 L110 80 h300 l50 90 z" fill="${c}" opacity=".35" stroke="${INK}" stroke-width="${W}"/>
  <rect x="70" y="170" width="380" height="270" rx="16" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <rect x="150" y="270" width="220" height="170" rx="12" fill="${c}" opacity=".35" stroke="${INK}" stroke-width="${W}"/>
  <path d="M60 170 h400" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="260" cy="356" r="18" fill="${INK}"/>
</svg>`,

'SALLA-01': (c) => `<svg viewBox="0 0 520 520">
  <path d="M120 160 h280 l30 300 h-340 z" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M196 190 v-30 a64 64 0 0 1 128 0 v30" fill="none" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="260" cy="320" r="62" fill="${c}"/>
  <path d="M234 320 l18 20 36 -44" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
</svg>`,

'WA-01': (c) => `<svg viewBox="0 0 520 520">
  <path d="M60 90 h230 a20 20 0 0 1 20 20 v130 a20 20 0 0 1 -20 20 h-140 l-60 54 v-54 h-30 a20 20 0 0 1 -20 -20 v-130 a20 20 0 0 1 20 -20z"
    fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <rect x="220" y="290" width="240" height="170" rx="16" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M220 344 h240 M280 290 v170 M370 290 v170" stroke="${INK}" stroke-width="4" opacity=".55"/>
  <path d="M180 250 C 220 262, 236 272, 250 286" fill="none" stroke="${INK}" stroke-width="${W}" stroke-dasharray="12 10"/>
</svg>`,

'BOT-01': (c) => `<svg viewBox="0 0 520 520">
  <rect x="90" y="130" width="340" height="230" rx="34" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M180 360 l-14 70 76 -70" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="200" cy="238" r="26" fill="${c}"/><circle cx="320" cy="238" r="26" fill="${c}"/>
  <path d="M260 60 v50" stroke="${INK}" stroke-width="${W}"/><circle cx="260" cy="52" r="20" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <path d="M392 396 l14 34 34 14 -34 14 -14 34 -14 -34 -34 -14 34 -14z" fill="${c}"/>
</svg>`,

'PK-MAPS': (c) => `<svg viewBox="0 0 520 520">
  ${[[170,180,1],[330,140,0],[380,300,0],[210,340,0]].map(([x,y,m])=>
    `<path d="M${x} ${y-70} a70 70 0 0 1 70 70 c0 52 -70 118 -70 118 s-70 -66 -70 -118 a70 70 0 0 1 70 -70z"
      fill="${m?c:'#fff'}" stroke="${INK}" stroke-width="${W}"/>
     <circle cx="${x}" cy="${y}" r="22" fill="${m?'#fff':c}"/>`).join('')}
  <rect x="120" y="420" width="280" height="70" rx="12" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M120 455 h280 M213 420 v70 M306 420 v70" stroke="${INK}" stroke-width="4" opacity=".55"/>
</svg>`,

'PK-WAAI': (c) => `<svg viewBox="0 0 520 520">
  <path d="M70 100 h380 a26 26 0 0 1 26 26 v200 a26 26 0 0 1 -26 26 h-250 l-90 76 v-76 h-40 a26 26 0 0 1 -26 -26 v-200 a26 26 0 0 1 26 -26z"
    fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <rect x="140" y="176" width="34" height="80" rx="17" fill="${c}"/>
  <path d="M116 232 a41 41 0 0 0 82 0" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
  <path d="M157 273 v26" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
  <rect x="240" y="166" width="180" height="130" rx="14" fill="${c}" opacity=".3" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="286" cy="206" r="16" fill="${INK}"/>
  <path d="M248 282 l56 -58 42 40 30 -26 40 44" fill="none" stroke="${INK}" stroke-width="${W}"/>
</svg>`,

'PK-INV': (c) => `<svg viewBox="0 0 520 520">
  <path d="M120 50 h210 l70 70 v340 h-280z" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M330 50 v70 h70" fill="none" stroke="${INK}" stroke-width="${W}"/>
  ${[190,240,290].map(y=>`<path d="M166 ${y} h180" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`).join('')}
  <path d="M166 340 h100" stroke="${c}" stroke-width="12" stroke-linecap="round" opacity=".5"/>
  <circle cx="380" cy="380" r="72" fill="${c}"/>
  <path d="M350 380 l20 24 42 -50" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/>
</svg>`,

'PK-EXP': (c) => `<svg viewBox="0 0 520 520">
  <path d="M130 60 h250 v300 l-25 -20 -25 20 -25 -20 -25 20 -25 -20 -25 20 -25 -20 -25 20 -25 -20z"
    fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  ${[130,182,234].map(y=>`<path d="M176 ${y} h158" stroke="${c}" stroke-width="11" stroke-linecap="round"/>`).join('')}
  <rect x="230" y="330" width="230" height="150" rx="22" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <rect x="290" y="306" width="70" height="30" rx="10" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="345" cy="405" r="46" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
</svg>`,

'PK-CV': (c) => `<svg viewBox="0 0 520 520">
  <rect x="70" y="120" width="290" height="200" rx="18" fill="#fff" stroke="${INK}" stroke-width="${W}" opacity=".55"/>
  <rect x="110" y="170" width="290" height="200" rx="18" fill="#fff" stroke="${INK}" stroke-width="${W}" opacity=".8"/>
  <rect x="150" y="220" width="290" height="230" rx="18" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="218" cy="290" r="34" fill="${c}"/>
  <path d="M180 360 a38 38 0 0 1 76 0" fill="${c}"/>
  ${[290,336,382].map(y=>`<path d="M290 ${y} h116" stroke="${c}" stroke-width="11" stroke-linecap="round" opacity=".7"/>`).join('')}
</svg>`,

'PK-MAIL': (c) => `<svg viewBox="0 0 520 520">
  <rect x="70" y="120" width="380" height="250" rx="20" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M70 148 L260 280 L450 148" fill="none" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="400" cy="360" r="76" fill="${c}" stroke="#fff" stroke-width="8"/>
  <path d="M368 336 h64 M368 360 h44 M368 384 h24" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
</svg>`,

'PK-RPT': (c) => `<svg viewBox="0 0 520 520">
  <rect x="110" y="60" width="300" height="400" rx="20" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M156 120 h180 M156 162 h120" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
  ${[[176,120],[228,180],[280,90],[332,210]].map(([x,h])=>
    `<rect x="${x-20}" y="${400-h}" width="40" height="${h}" rx="8" fill="${c}"/>`).join('')}
  <path d="M156 400 h210" stroke="${INK}" stroke-width="${W}"/>
</svg>`,

'PK-PRICE': (c) => `<svg viewBox="0 0 520 520">
  <path d="M250 70 h180 v180 L250 430 L70 250z" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="366" cy="134" r="26" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <path d="M180 250 v90 M180 340 l-34 -34 M180 340 l34 -34" stroke="${c}" stroke-width="18" stroke-linecap="round"/>
</svg>`,

'PK-REV': (c) => `<svg viewBox="0 0 520 520">
  ${[0,1,2,3,4].map(k=>{const x=88+k*86,f=k<4;
    return `<path d="M${x} 170 l17 38 41 5 -30 29 8 41 -36 -21 -36 21 8 -41 -30 -29 41 -5z"
      transform="scale(1.05) translate(${-x*0.05},-8)" fill="${f?c:'#fff'}" stroke="${INK}" stroke-width="4"/>`}).join('')}
  <rect x="110" y="300" width="300" height="140" rx="18" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M156 350 h208 M156 396 h140" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
</svg>`,

'PK-CART': (c) => `<svg viewBox="0 0 520 520">
  <path d="M70 110 h60 l50 220 h210" fill="none" stroke="${INK}" stroke-width="${W}" stroke-linecap="round"/>
  <path d="M150 170 h300 l-34 130 h-238z" fill="${c}" opacity=".4" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="206" cy="410" r="34" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="374" cy="410" r="34" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M300 96 a70 70 0 1 1 -66 46" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>
  <path d="M240 110 l-8 36 36 -6" fill="${c}"/>
</svg>`,

'PK-FOLLOW': (c) => `<svg viewBox="0 0 520 520">
  <circle cx="260" cy="260" r="170" fill="none" stroke="${INK}" stroke-width="${W}" stroke-dasharray="26 22"/>
  <path d="M260 90 A170 170 0 0 1 430 260" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round"/>
  <path d="M406 236 l26 26 -26 26" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round"/>
  <path d="M260 176 v90 l70 44" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
</svg>`,

'PK-BOOK': (c) => `<svg viewBox="0 0 520 520">
  <rect x="70" y="110" width="380" height="330" rx="26" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M70 190 h380" stroke="${INK}" stroke-width="${W}"/>
  <rect x="146" y="70" width="20" height="70" rx="10" fill="${INK}"/>
  <rect x="354" y="70" width="20" height="70" rx="10" fill="${INK}"/>
  <circle cx="260" cy="320" r="76" fill="${c}"/>
  <path d="M226 320 l24 26 46 -56" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
</svg>`,

'PK-BDAY': (c) => `<svg viewBox="0 0 520 520">
  <rect x="80" y="200" width="360" height="240" rx="18" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <rect x="60" y="150" width="400" height="66" rx="16" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <path d="M260 150 v290" stroke="${INK}" stroke-width="${W}"/>
  <path d="M260 150 c-60 -40 -110 -20 -110 10 s70 20 110 -10z" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <path d="M260 150 c60 -40 110 -20 110 10 s-70 20 -110 -10z" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
</svg>`,

'PK-STOCK': (c) => `<svg viewBox="0 0 520 520">
  <rect x="70" y="270" width="150" height="150" rx="12" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <rect x="240" y="270" width="150" height="150" rx="12" fill="${c}" opacity=".4" stroke="${INK}" stroke-width="${W}"/>
  <rect x="155" y="130" width="150" height="130" rx="12" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M400 100 l86 150 h-172z" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <path d="M400 152 v42" stroke="#fff" stroke-width="13" stroke-linecap="round"/>
  <circle cx="400" cy="220" r="9" fill="#fff"/>
</svg>`,

'PK-DELIV': (c) => `<svg viewBox="0 0 520 520">
  <rect x="60" y="180" width="230" height="160" rx="14" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M290 220 h90 l70 70 v50 h-160z" fill="${c}" opacity=".45" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="150" cy="370" r="40" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <circle cx="374" cy="370" r="40" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M110 240 h130" stroke="${c}" stroke-width="13" stroke-linecap="round"/>
  <path d="M40 130 h120" stroke="${c}" stroke-width="11" stroke-linecap="round" opacity=".6"/>
  <path d="M80 90 h120" stroke="${c}" stroke-width="11" stroke-linecap="round" opacity=".4"/>
</svg>`,

'PK-POST': (c) => `<svg viewBox="0 0 520 520">
  <path d="M90 210 h90 l150 -100 v300 l-150 -100 h-90z" fill="${c}" stroke="${INK}" stroke-width="${W}"/>
  <path d="M370 170 a120 120 0 0 1 0 180" fill="none" stroke="${INK}" stroke-width="${W}" stroke-linecap="round"/>
  <path d="M420 130 a180 180 0 0 1 0 260" fill="none" stroke="${INK}" stroke-width="${W}" stroke-linecap="round" opacity=".5"/>
  <rect x="120" y="330" width="60" height="120" rx="14" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
</svg>`,

'DATA-01': (c) => `<svg viewBox="0 0 520 520">
  <ellipse cx="260" cy="120" rx="160" ry="56" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M100 120 v130 a160 56 0 0 0 320 0 v-130" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M100 250 a160 56 0 0 0 320 0" fill="none" stroke="${INK}" stroke-width="${W}"/>
  <path d="M100 250 v130 a160 56 0 0 0 320 0 v-130" fill="${c}" opacity=".35" stroke="${INK}" stroke-width="${W}"/>
  <path d="M100 380 a160 56 0 0 0 320 0" fill="none" stroke="${INK}" stroke-width="${W}"/>
</svg>`,

'AGT-01': (c) => `<svg viewBox="0 0 520 520">
  <path d="M120 60 h200 l70 70 v300 h-270z" fill="#fff" stroke="${INK}" stroke-width="${W}"/>
  <path d="M320 60 v70 h70" fill="none" stroke="${INK}" stroke-width="${W}"/>
  ${[190,236,282].map(y=>`<path d="M164 ${y} h180" stroke="${c}" stroke-width="11" stroke-linecap="round" opacity=".6"/>`).join('')}
  <circle cx="378" cy="386" r="86" fill="${c}"/>
  <path d="M356 356 h44 M356 386 h44 M356 416 h26" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
  <path d="M430 300 l12 28 28 12 -28 12 -12 28 -12 -28 -28 -12 28 -12z" fill="${c}"/>
</svg>`,
};

/** @param {object} item @param {{rate:number}} fx @param {string} logoDataUri */
export function renderCard(item, fx, logoDataUri) {
  const t = themeFor(item);
  const art = (SKU_ART[item.sku] || ART[t.art])(t.accent);
  const long = item.name.length;

  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<style>
@font-face { font-family:"Jawhara"; src:url("file:///Users/wbtio/Library/Fonts/MSjawhara-Bold.ttf"); font-weight:700; }
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1200px;background:${t.bg};position:relative;overflow:hidden;
  font-family:"SF Arabic","Geeza Pro",system-ui,sans-serif;color:${INK};
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:110px 110px 190px;text-align:center}
.art{width:560px;height:560px}
.art svg{width:100%;height:100%;overflow:visible}
h1{font-family:"Jawhara","SF Arabic",sans-serif;
  font-size:${long > 34 ? 62 : long > 24 ? 70 : 80}px;line-height:1.18;
  letter-spacing:-1px;margin-top:36px;max-width:940px}
.foot{position:absolute;inset:auto 0 74px 0;display:flex;align-items:center;
  justify-content:center;gap:16px}
.foot img{width:56px;height:56px;border-radius:13px}
.foot span{font-size:21px;color:${DIM};letter-spacing:2px}
.bar{position:absolute;inset:auto 0 0 0;height:9px;background:${t.accent}}
</style></head><body>
<div class="art">${art}</div>
<h1>${item.name}</h1>
<div class="foot"><img src="${logoDataUri}" alt="wbtio"><span>${item.sku}</span></div>
<div class="bar"></div>
</body></html>`;
}
