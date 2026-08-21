# Automated Weekly Business Report — Setup Guide

An automated weekly report on your business, delivered by email every Sunday morning.
Runs on n8n; the writing is done by Claude, the arithmetic is not.

---

## What arrives in your inbox

One email, readable in ninety seconds:

- **A headline** — the single most important thing about the week
- **A short summary** — what happened, in plain language
- **The numbers** — revenue, orders, average order value, each against last week
- **What went well · Worth attention · Do next week** — three short lists
- **Top categories and customers**

Nothing to log into. Nothing to configure weekly. It simply arrives.

---

## How the numbers are produced

This matters, so it is stated plainly:

**Every figure is calculated in code from your source data. The language model never
performs arithmetic.** It receives the finished numbers and writes the commentary
around them, and the email template reads the figures back from the calculation step
rather than from the model's text.

Language models are unreliable at arithmetic. This design removes that risk entirely
rather than reducing it — which is why the report can be trusted week after week.

Two further details:
- A percentage change is only shown when the previous period was non-zero. You will
  never see "infinite growth".
- Rows with unreadable dates are counted and disclosed at the foot of the report,
  never silently dropped.

---

## Requirements

| | |
|---|---|
| n8n | 1.40 or newer (self-hosted or Cloud) |
| Anthropic API key | from console.anthropic.com |
| Your data | a Google Sheet with one row per sale, order, or lead |
| Email | Gmail / Google Workspace, or SMTP |

### Your data sheet

One row per transaction, with at least these columns:

| Column | Example |
|---|---|
| `date` | `2026-08-19` |
| `amount` | `420.00` |
| `category` | `Espresso machines` |
| `customer` | `Cafe Noor` |

Column names can differ — they are mapped in one place (the `COL` object at the top
of the *Compute Metrics* node). Extra columns are ignored.

---

## Installation

**1. Import the workflow**
n8n → *Workflows* → *Import from File* → `workflow.json`

**2. Add the Anthropic credential**
*Credentials* → *New* → **Header Auth** · header name `x-api-key` · value: your key

**3. Set the system prompt**
*Settings* → *Variables* → `WEEKLY_REPORT_SYSTEM_PROMPT`
Paste from `prompts/report-writer.md` and fill in the `<business>` block: what you
sell, what a good week looks like to you, your seasonality, and what you can act on.

**That block is the entire customisation surface.** Everything else stays as it is.

**4. Connect your accounts**
Open each node marked `REPLACE_ME`: *Read Business Data* and *Log Report* (Sheets),
*Send Report* (Gmail). Set the recipient address in *Send Report*.

**5. Prepare the log sheet**
Add a second tab named `report_log` with these headers in row 1:

```
period_from | period_to | revenue | orders | change_pct | tone | headline
```

Every report is logged here, so you build a history of your own weeks automatically.

**6. Set the schedule**
The trigger is set to Sunday 07:00. Change the day and hour in *Every Sunday 07:00*
to suit your week — the report always covers the preceding seven days.

---

## Before going live

Run the workflow manually once and read the output carefully:

1. Do the figures match your own records? If not, check the column mapping.
2. Is the commentary accurate and useful, or generic? If generic, the `<business>`
   block needs more detail — that is almost always the cause.
3. Are rows being skipped? The footer will say so. Fix the source data format.

Only enable the schedule once a manual run produces a report you would be happy to
receive.

---

## Trying it without n8n

```bash
node demo/run_demo.mjs --metrics-only    # numbers only, no API call
export ANTHROPIC_API_KEY=sk-ant-...
node demo/run_demo.mjs                   # full report → report.html
node demo/run_demo.mjs your-data.json    # your own rows
```

Node 18 or newer. No packages to install.

---

## Operating notes

- **Cost.** One API call per week on a small payload. Even with a long report, spend
  is a few cents per month.
- **Failures.** The Claude call retries three times. If it still fails, the run errors
  rather than sending a half-built report.
- **Adding a metric.** Add the calculation in *Compute Metrics*, add the field to the
  tool schema in *Write Narrative*, render it in *Build Email*. Three edits, always
  the same three.
- **Changing the period.** The 7-day windows in *Compute Metrics* are two constants.
  Monthly reporting is a one-line change.

---

## Privacy

Your aggregated weekly figures are sent to the Anthropic API so the commentary can be
written — not your raw customer rows. Nothing is stored by this workflow outside your
own Google Sheet and your own n8n execution history. Set n8n's execution data
retention to match your policy before going live.
