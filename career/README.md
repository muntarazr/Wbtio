# career — ما يُقدَّم لجهة توظيف

> **الفرق عن [`../income/`](../income/):** هنا كل ما **ترسله لمن يوظّفك أو لمنصّة**.
> هناك كل ما يخص **إدارة عملك** — التسعير، والعروض، وتواصل العملاء، والمنتجات.

---

## المحتوى

| المجلد / الملف | شنو هو |
|---|---|
| [`cv/`](./cv/) | **ست نسخ من السيرة الذاتية** + دليل أي نسخة لأي جهة ([`INDEX.html`](./cv/INDEX.html)) |
| [`cv/SOURCE-OF-TRUTH.md`](./cv/SOURCE-OF-TRUTH.md) | **مصدر الحقيقة الوحيد** لكل حقيقة بسيرتك — غيّرها هنا أولاً ثم انشرها |
| [`portfolio/`](./portfolio/) | صفحة البورتفوليو — جاهزة للنشر على Vercel |
| [`profiles.md`](./profiles.md) | نصوص جاهزة: **LinkedIn** · Fiverr · مستقل · (~~Upwork~~ — العراق غير مدعوم) |
| [`job-search/`](./job-search/) | **إطار البحث عن وظيفة** — يقيّم الإعلانات، يخصّص السيرة، يكتب خطابات التقديم، يحضّر للمقابلة |

---

## أي نسخة سيرة لأي مسار

| المسار | النسخة | ليش |
|---|---|---|
| **E-7 — شركات كورية** | [`01-ats-ai-automation-EN.html`](./cv/01-ats-ai-automation-EN.html) | مبنية على الفرز الآلي · والمسمّى يطابق قائمة مهن E-7 |
| ماجستير — لا تُستعمل | — | التقديم الأكاديمي يحتاج **سيرة أكاديمية** لا سيرة وظائف · [`../korea/DOCUMENTS.md`](../korea/DOCUMENTS.md) |
| عملاء أجانب مباشرون | [`04-freelance-onepager-EN.html`](./cv/04-freelance-onepager-EN.html) | صفحة قدرات لا سيرة |
| عملاء عراقيون وخليجيون | [`06-arabic-clients-AR.html`](./cv/06-arabic-clients-AR.html) | بلغة أعمال بسيطة |

---

## 🔧 إطار البحث عن وظيفة

منصَّب من [`MadsLorentzen/ai-job-search`](https://github.com/MadsLorentzen/ai-job-search)
عبر `git subtree`. دليل الاستعمال بالعربي: [`job-search/INSTALL-AR.md`](./job-search/INSTALL-AR.md).

```bash
cd career/job-search
claude          # بعدين شغّل /setup
```

> **مسار الـsubtree تغيّر** من `ai-job-search/` إلى `career/job-search/`.
> أي تحديث من المنبع لاحقاً: `git subtree pull -P career/job-search <remote> <ref> --squash`

### ⚠️ ما يصلح منه لهدفك وما لا يصلح

الإطار مبني أصلاً لسوق **الدنمارك وكندا**. هذا يعني:

| المهارة | تصلح إلك؟ |
|---|---|
| `linkedin-search` | ✅ **نعم** — قناتك الأساسية للشركات الكورية |
| `job-application-assistant` · `job-scraper` · `upskill` | ✅ **نعم** — تقييم، تخصيص سيرة، خطابات، مقابلات |
| `jobindex` · `jobnet` · `jobdanmark` (الدنمارك) · `jobbank` (كندا) · `freehire` | ❌ **لا** — بوابات لا تخدم كوريا ولا المنطقة |

**أُبقيت المهارات غير المفيدة عمداً** — حذفها من `subtree` مستورد يكسر تحديثه من المنبع،
وإبقاؤها لا يكلّف شيئاً. تجاهلها ببساطة.

**البوابة الناقصة لهدفك:** [KOWORK](https://kowork.kr/en/) — مبنية لربط الأجانب بالشركات
الكورية. أضفها بأمر `/add-portal`.

---

## 🔒 الخصوصية

`/setup` يكتب بروفايلك بملفات **متتبَّعة بـgit**، والمستودع عام. الحارس
[`../.githooks/pre-push`](../.githooks/) يوقف أي دفع يحمل بيانات شخصية غير مُصرَّح بنشرها.

**شغّله مرة واحدة بعد كل `clone`:**

```bash
git config core.hooksPath .githooks
```

قائمة ما وافقت على نشره: [`../.githooks/allow-personal`](../.githooks/allow-personal).

---

## ✅ تصحيح مطبَّق 2026-08-21

بروفايل الإطار كان مكتوباً فيه **«remote only · no relocation · no on-site»** بأربعة مواضع.
هذا يجعل الإطار **يرفض تلقائياً كل وظيفة كورية** — وهي بالضبط هدفك.

صُحِّح إلى: **remote-first، مع استثناء صريح لكوريا الجنوبية** حيث العمل الحضوري ورعاية
فيزا E-7 هدف مقصود لا عائق. الملفات: `CLAUDE.md` · `01-candidate-profile.md` · `04-job-evaluation.md`.
