# 🎯 ai-job-search — دليل التنصيب والاستعمال

إطار البحث عن وظيفة المبني على Claude Code، منصَّب جوّا Wbtio بمجلد `ai-job-search/`.

- **المصدر:** [`MadsLorentzen/ai-job-search`](https://github.com/MadsLorentzen/ai-job-search)
- **النسخة:** `v1.6.0` (`ab91c60`)
- **طريقة التنصيب:** `git subtree` — يعني تاريخ الإطار مضغوط بكوميت واحد، والتحديثات تنزل بأمر واحد (شوف [التحديث](#-التحديث)).

> 📄 الملف الأصلي للمشروع: [`README.md`](README.md) · دليل الإعداد الكامل: [`SETUP.md`](SETUP.md)

---

## 🔒 الخصوصية — محلولة بحارس تلقائي

**مستودع Wbtio عام (public).** وأمر `/setup` يكتب بروفايلك بملفات **متتبَّعة بـgit** — يعني نظرياً أي `git push` ينشرها للكل.

**الحل المنصَّب:** حارس `pre-push` بـ[`.githooks/pre-push`](../.githooks/pre-push) **يوقف الدفع تلقائياً** إذا لكى بيانات شخصية بأي ملف من هذول:

| الملف | العنصر النائب اللي يراقبه |
|---|---|
| `CLAUDE.md` | `[YOUR_NAME]` |
| `cv/main_example.tex` | `\name{[First]}{[Last]}` · `\email{[your.email@example.com]}` |
| `cover_letters/cover_example.tex` | `[YOUR NAME]` |
| `01-candidate-profile.md` | `[YOUR_EMAIL]` |
| `02-behavioral-profile.md` | `[PROFILE_TYPE]` |
| `04-job-evaluation.md` | `[YOUR_PRIMARY_SKILLS]` |
| `05-cv-templates.md` | `[YOUR_PRIMARY_ROLE_TYPE]` |
| `07-interview-prep.md` | `[PROJECT_NAME]` |
| `search-queries.md` | `[YOUR_CITY]` |

الفكرة بسيطة: هاي الملفات تجي مليانة عناصر نائبة. لمّا `/setup` يملأها ببياناتك، العنصر النائب يختفي — والحارس يشوف هذا ويوقف الدفع برسالة تشرح الخيارات.

> نفس منطق فحص `placeholder-integrity` بـ`ci.yml` مال المشروع الأصلي، بس منقول لـhook لأن GitHub ما يشغّل `.github/workflows/` من مجلد فرعي.

### التنصيب على جهازك

الـhook **مدفوع بالمستودع**، بس git يحتاج سطر واحد يشغّله (مرّة وحدة بعد كل `clone`):

```bash
git config core.hooksPath .githooks
```

### التجاوز

إذا قرّرت تنشر بروفايلك عن قصد:

```bash
git push --no-verify
```

### الملفات الحسّاسة — محميّة أصلاً

هاي ولا مرّة تدخل git، مستثناة بـ`.gitignore` مال الإطار (تحقّقت منها وحدة وحدة):

`job_search_tracker.csv` · `salary_data.json` · `documents/` · `job_scraper/seen_jobs.json` · `reports/` · `gmail_sync/` · `cv/main_<company>_<role>.tex` · `cover_letters/cover_*.tex` · `node_modules/`

### لو تريد أمان كامل

حوّل Wbtio لمستودع **خاص** من إعدادات GitHub، أو خلّي مجلد `ai-job-search/` محلي بدون `push`. الحارس يحميك من الغلطة، بس ما يحمي من قرار واعي.

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

الأدوات الجاهزة سِتّة، أربعة منهن دنماركية (`jobindex`, `jobnet`, `jobdanmark`, `jobbank`) — ما تنفعك، بس **مطفيّة أصلاً** (`enabled: false` بالـfrontmatter مالتهن)، فـ`/scrape` يتخطّاهن بدون ما تسوي شي. تحقّقت من هذا.

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
