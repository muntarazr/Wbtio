# Search Queries for Job Scraper

<!-- Populated by /setup. Target: fully remote work from Basrah, Iraq — see CLAUDE.md. -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

**Enabled portals for this profile:** `linkedin-search`, `freehire-search`. The four Danish demos (`jobindex`, `jobnet`, `jobdanmark`, `jobbank`) ship `enabled: false` and stay off — they cover a market this candidate cannot work in.

**Location argument:** `linkedin-search` requires `--location`. Use `"Remote"` as the default. Country locations are only useful for employers that hire remotely across a region — otherwise they surface on-site roles that fail the Deal-breakers in CLAUDE.md.

The `site:` query templates below are the **WebSearch fallback** — for boards without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in both English and Arabic (see CLAUDE.md's Languages table). English carries almost all remote/international postings; Arabic matters only for the Gulf and Iraq boards in Priority 4.

## Search Sites

Primary:
- **linkedin.com/jobs** — filter `Remote`; also covered by the `linkedin-search` CLI
- **freehire.me** — tech-focused aggregator across ~50 ATS platforms; covered by the `freehire-search` CLI
- **weworkremotely.com**, **remoteok.com**, **remotive.com** — remote-only boards, no CLI yet (scaffold one with `/add-portal`)
- **wellfound.com** (ex AngelList) — startup roles, many remote

Freelance and contract (a large share of the $1,500/month target — see `plan-1500/offers.md`):
- **upwork.com**, **fiverr.com**, **contra.com**

Gulf and Iraq (Arabic-language, mostly on-site — search only for remote-flagged roles):
- **bayt.com**, **wuzzuf.net**, **tanqeeb.com**

Secondary: direct Google `site:` searches against target company career pages.

## Query Categories

Queries are grouped by priority. Combine with `Remote` rather than a city — this profile is remote-only.

**Organize by function, not job title.** The same work carries different titles across companies: "AI Engineer", "LLM Engineer", "Automation Engineer" and "Forward Deployed Engineer" often describe one job.

### Priority 1: AI & Automation Engineering

The strongest match and the intended career direction.

```
site:linkedin.com/jobs "AI Engineer" remote
site:linkedin.com/jobs "LLM Engineer" remote
site:linkedin.com/jobs "Automation Engineer" n8n remote
site:linkedin.com/jobs "AI Automation" remote
"n8n developer" remote
"workflow automation engineer" remote
"prompt engineer" OR "AI integration" remote
```

CLI form:

```bash
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "AI engineer" -l "Remote" --jobage 14 --format table
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "automation engineer n8n" -l "Remote" --jobage 14 --format table
bun run .agents/skills/freehire-search/cli/src/cli.ts search -q "LLM engineer" --format table
```

### Priority 2: Full-Stack / Product Engineering

Where the deepest shipped experience is: web + admin + mobile, owned end to end.

```
site:linkedin.com/jobs "Full Stack Developer" Next.js remote
site:linkedin.com/jobs "Product Engineer" React remote
site:linkedin.com/jobs "Founding Engineer" remote
"Next.js developer" Supabase remote
"React Native developer" remote
```

CLI form:

```bash
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "full stack Next.js" -l "Remote" --jobage 14 --format table
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "React Native developer" -l "Remote" --jobage 14 --format table
```

### Priority 3: Adjacent — Integrations, Solutions, Internal Tools

Roles that reward the same skills under a different name.

```
site:linkedin.com/jobs "Integration Engineer" API remote
site:linkedin.com/jobs "Solutions Engineer" remote
site:linkedin.com/jobs "Forward Deployed Engineer" remote
"internal tools engineer" remote
"technical consultant" automation remote
```

### Priority 4: Gulf & Iraq (Arabic)

Local market — search only for roles explicitly flagged remote, since relocation and on-site are deal-breakers.

```
site:bayt.com مطور ويب عن بعد
site:bayt.com "مهندس أتمتة" عن بعد
site:wuzzuf.net "مطور Full Stack" عن بعد
site:tanqeeb.com مبرمج عن بعد العراق
"عمل عن بعد" مطور تطبيقات
```

## Location Filter

This profile is **remote-only** — there is no commute radius. Apply this instead:

- ✅ **Accept:** "Remote", "Fully remote", "Work from anywhere", "Remote (EMEA)", "Remote (worldwide)"
- ⚠️ **Flag for judgment:** "Remote (US only)", "Remote (EU only)" and similar region locks — usually a hard no for an Iraq-based contractor, but some employers hire contractors outside the stated region. Worth one check of the employer's careers page before dropping.
- ❌ **Reject:** on-site, hybrid, "remote with occasional travel to <office>", or anything requiring relocation or a work permit outside Iraq.

Also reject anything gated on citizenship, permanent residency, or a security clearance — see the Eligibility Gate in `04-job-evaluation.md`.

## Language Filter

Working languages and levels are in CLAUDE.md's Languages table (Arabic native, English full professional proficiency). Apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language not declared at all is excluded; a higher stated bar in a declared language is flagged, not excluded. A posting merely *written* in another language, for a role that does not require it, is fine.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- `/scrape n8n` → Priority 1 queries + custom n8n/automation queries
- `/scrape mobile` → Priority 2 queries + React Native / cross-platform queries
