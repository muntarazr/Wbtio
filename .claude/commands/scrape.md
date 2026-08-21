---
description: (ai-job-search) دوّر على وظائف جديدة تناسب بروفايلك
---

هذا أمر وسيط. المنطق الحقيقي بسكِل `job-scraper` مال إطار ai-job-search،
وهو منصَّب بمجلد فرعي فـClaude Code ما يشوفه.

نفّذ التالي:

1. اقرأ `ai-job-search/.claude/skills/job-scraper/SKILL.md` — هذا هو السكِل الأصلي.
2. اقرأ `ai-job-search/.claude/skills/job-scraper/search-queries.md` — استراتيجية البحث،
   مضبوطة أصلاً للعمل عن بُعد من البصرة.
3. اتبع خطوات السكِل حرفياً، **بس اعتبر `ai-job-search/` هو جذر مجلد العمل**.
   `job_scraper/seen_jobs.json` و`job_search_tracker.csv` وكل مسار نسبي ثاني
   يُقرأ ويُكتب تحت `ai-job-search/`.
4. أوامر bun شغّلها بعد `cd ai-job-search`، مثلاً:
   `bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "AI engineer" -l "Remote" --format table`

الوسائط المُمرَّرة: $ARGUMENTS

**المنصّات الفعّالة:** `linkedin-search` و`freehire-search` بس. الأربعة الدنماركية
(`jobindex`, `jobnet`, `jobdanmark`, `jobbank`) عندها `enabled: false` — تخطّاها.

**قيد الموقع:** البروفايل عن بُعد بالكامل. أي إعلان on-site أو hybrid أو يحتاج
انتقال أو تصريح عمل خارج العراق = مرفوض. راجع "Location Filter" بـ`search-queries.md`.

**لو رجع خطأ 403:** المنصّات محجوبة ببيئات الساندبوكس (جلسات Claude Code على الويب).
ارجع لخطة `WebSearch` الاحتياطية وبيّن للمستخدم إنك استعملتها.
