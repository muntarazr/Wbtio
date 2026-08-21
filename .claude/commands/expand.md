---
description: (career/job-search) شغّل /expand مال إطار البحث عن وظيفة
---

هذا أمر وسيط. الأمر الحقيقي مال إطار career/job-search، وهو منصَّب بمجلد فرعي
فـClaude Code ما يشوفه لأنه يدوّر على الأوامر بجذر المستودع بس.

نفّذ التالي:

1. اقرأ `career/job-search/.claude/commands/expand.md` — هذا هو الأمر الأصلي.
2. اتبع تعليماته حرفياً، **بس اعتبر `career/job-search/` هو جذر مجلد العمل**.
   كل مسار نسبي داخل تلك التعليمات (`CLAUDE.md`, `cv/`, `cover_letters/`,
   `documents/`, `.claude/skills/...`, `.agents/skills/...`, `job_scraper/`)
   يُقرأ ويُكتب تحت `career/job-search/` — مو تحت جذر Wbtio.
3. أوامر bash اللي تجي بالتعليمات شغّلها بعد `cd career/job-search`.
4. البروفايل مملوء أصلاً — اقرأ `career/job-search/CLAUDE.md` قبل أي شي.

الوسائط المُمرَّرة: $ARGUMENTS

⚠️ مستودع Wbtio عام. حارس `.githooks/pre-push` يوقف أي دفع يحمل بيانات
شخصية جديدة. لا تتجاوزه بـ`--no-verify` — إذا انحجب دفع، اسأل المستخدم.
