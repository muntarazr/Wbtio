# 🎯 ai-job-search — دليل التنصيب والاستعمال

إطار البحث عن وظيفة المبني على Claude Code، منصَّب جوّا Wbtio بمجلد `ai-job-search/`.

- **المصدر:** [`MadsLorentzen/ai-job-search`](https://github.com/MadsLorentzen/ai-job-search)
- **النسخة:** `v1.6.0` (`ab91c60`)
- **طريقة التنصيب:** `git subtree` — يعني تاريخ الإطار مضغوط بكوميت واحد، والتحديثات تنزل بأمر واحد (شوف [التحديث](#-التحديث)).

> 📄 الملف الأصلي للمشروع: [`README.md`](README.md) · دليل الإعداد الكامل: [`SETUP.md`](SETUP.md)

---

## ⚠️ اقرأ هذا قبل ما تشغّل `/setup`

**مستودع Wbtio عام (public).** أمر `/setup` يكتب بروفايلك الشخصي بملفات **متتبَّعة بـgit**:

`CLAUDE.md` · `01-candidate-profile.md` · `02-behavioral-profile.md` · `04-job-evaluation.md` · `05-cv-templates.md` · `07-interview-prep.md` · `cv/main_example.tex` · `search-queries.md`

يعني بمجرّد ما تسوي `git push`، هاي الملفات تصير **مكشوفة لأي واحد**. البروفايل السلوكي وتحضير المقابلات بالذات أشياء ما تنراد تنشر.

**الملفات الحسّاسة محميّة أصلاً** — تحقّقت منها وكلها مستثناة بـ`.gitignore`:

| الملف | الحالة |
|---|:---:|
| `job_search_tracker.csv` (متتبّع التقديمات) | ✅ مستثنى |
| `salary_data.json` (بيانات الرواتب) | ✅ مستثنى |
| `documents/` (سيرتك، شهاداتك، توصياتك) | ✅ مستثنى |
| `job_scraper/seen_jobs.json` | ✅ مستثنى |
| `node_modules/` | ✅ مستثنى |

**خياراتك:**
1. تشتغل محلياً بدون `git push` لمجلد `ai-job-search/` — أأمن شي.
2. تحوّل Wbtio لمستودع **خاص** من إعدادات GitHub.
3. تكمّل عادي، وتعرف إن بروفايلك منشور — نصف هاي المعلومات موجودة أصلاً بـ`plan-1500/cv/`.

---

## 🚀 التشغيل

الإطار يتوقّع نفسه بجذر مجلد العمل، فشغّل Claude Code **من داخل المجلد**:

```bash
cd ai-job-search
claude
```

بعدين، أول شي:

```
/setup
```

يعطيك ثلاث طرق: تحطّ ملفاتك بـ`documents/`، أو تشارك سيرة ذاتية وحدة، أو مقابلة سؤال–جواب. الثلاثة يوصلون لنفس النتيجة.

### الأوامر الجاهزة

| الأمر | شنو يسوي |
|---|---|
| `/setup` | مقابلة الإعداد — يملأ البروفايل |
| `/scrape` | يدوّر على وظائف جديدة ويحذف المكرّر |
| `/rank` | يرتّب الوظائف حسب ملاءمتها إلك |
| `/apply <رابط أو نص>` | يقيّم الوظيفة، يخصّص السيرة، يكتب خطاب تقديم، يراجعها بوكيل ثاني |
| `/interview` | تحضير للمقابلة |
| `/outcome` | يسجّل نتيجة التقديم |
| `/html-report` | تقرير بصري للتقديمات |
| `/add-portal` | يبني أداة بحث لأي منصّة توظيف محلية |
| `/add-template` | يربط قالب LaTeX خاص بيك |
| `/expand` · `/reset` · `/gmail-sync` · `/notion-sync` | توسعة، تصفير، مزامنة |

### تجميع الملفات بعد `/apply`

```bash
cd cv && lualatex main_<company>_<role>.tex && cd ..
cd cover_letters && xelatex cover_<company>_<role>.tex && cd ..
```

---

## ✅ اللي تحقّقت منه بعد التنصيب

| الفحص | النتيجة |
|---|:---:|
| حزمة الاختبارات (`pytest tests`) | ✅ 300 ناجح + 143 فرعي |
| تنصيب اعتماديات الأدوات الستّة (`bun install`) | ✅ الستّة كلهم |
| تشغيل `linkedin-search` و`freehire-search` | ✅ |
| تجميع السيرة الذاتية (`lualatex`) | ✅ PDF صفحتين |
| تجميع خطاب التقديم (`xelatex`) | ✅ PDF |
| استخراج نص PDF (فحص ATS) | ✅ |
| `.gitignore` المتداخل يحمي الملفات الحسّاسة | ✅ |

---

## 🖥️ شنو تحتاج على جهازك

المتطلبات هذي **مو محفوظة بالمستودع** — لازم تنصّبها على جهازك مرّة وحدة:

| المتطلب | التنصيب |
|---|---|
| Claude Code | `npm install -g @anthropic-ai/claude-code` |
| Python 3.10+ | من [python.org](https://python.org) |
| Bun | `curl -fsSL https://bun.sh/install \| bash` |
| LaTeX | لينكس: `sudo apt install texlive-latex-extra texlive-fonts-extra texlive-luatex texlive-xetex` · ماك: [MacTeX](https://tug.org/mactex/) · ويندوز: [MiKTeX](https://miktex.org/download) |
| `pdftotext` (اختياري) | `sudo apt install poppler-utils` / `brew install poppler` |

---

## 🌍 ملاحظة عن المنصّات

الأدوات الجاهزة سِتّة، أربعة منهن دنماركية (`jobindex`, `jobnet`, `jobdanmark`, `jobbank`) — ما تنفعك.

**اللي ينفعك:**
- **`linkedin-search`** — أي بلد أو منطقة، وكذلك `Remote`
- **`freehire-search`** — مجمّع وظائف تقني بأسواق متعدّدة
- **`/add-portal`** — يبني إلك أداة لأي منصّة عربية أو محلية، ويجرّبها بطلب حيّ قبل ما يسجّلها

> بيئات الساندبوكس (مثل جلسات Claude Code على الويب) تحجب منصّات التوظيف — الطلب يرجع `403`. على جهازك يشتغل عادي. والسكِل عنده خطة احتياطية بـ`WebSearch`.

---

## 🔄 التحديث

الإطار مضاف كـ`subtree`، والمصدر مربوط كـremote اسمه `upstream`:

```bash
# شوف شنو تغيّر بملفات البروفايل المخصّصة
cd ai-job-search && python3 tools/check_upstream_updates.py --remote upstream

# نزّل آخر نسخة
cd /home/user/Wbtio
git fetch upstream --tags
git subtree pull --prefix=ai-job-search upstream master --squash
```

**بدل `master` بوسم نسخة** (مثل `v1.7.0`) لو تريد نسخة مستقرّة موثّقة بـ[`CHANGELOG.md`](CHANGELOG.md) — هذا اللي ينصح بيه المشروع نفسه.

> `tools/upstream_triage.py` يشتغل بس أوامر `git cherry-pick` اللي يطبعها مبنية على مسارات جذر المستودع الأصلي، فما تنطبق مباشرة على مجلد فرعي — استعمله للقراءة بس.
>
> `ai-job-search/.github/workflows/upstream-watch.yml` ما راح يشتغل، لأن GitHub يقرا `.github/workflows/` من جذر المستودع بس. هذا مقصود — ما إله أي تأثير.
