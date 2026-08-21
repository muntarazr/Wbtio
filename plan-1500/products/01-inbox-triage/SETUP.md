# AI Inbox Triage — Setup Guide

Automated classification, routing, and first-response for inbound customer
messages. Runs on n8n; the language model is Claude.

---

## What it does

Every incoming message — email, WhatsApp, or a web form — goes through one path:

1. **Normalize.** All channels are flattened into a single message shape, so the
   rest of the workflow is channel-agnostic.
2. **Classify and draft.** Claude returns six fields under a forced tool schema:
   category, urgency, language, a one-line internal summary, a `needs_human`
   flag, and a ready-to-send reply in the customer's own language.
3. **Route.** Straightforward messages get an automatic reply. Anything the model
   flags — plus every complaint and every high-urgency message — goes to a human
   with the draft attached as a suggestion. Marketing blasts are dropped.
4. **Log.** Every message lands in a Google Sheet with its category, routing
   decision, and token cost, so the impact is measurable from week one.

Nothing is auto-sent on refunds, complaints, billing disputes, or anything the
model was not given the facts to answer. Those escalate by rule, not by judgement.

---

## Requirements

| | |
|---|---|
| n8n | 1.40 or newer (self-hosted or Cloud) |
| Anthropic API key | from console.anthropic.com |
| Email account | Gmail/Google Workspace, or SMTP+IMAP |
| Team notification channel | Slack, or email — optional but recommended |
| Google Sheet | one blank sheet for the log |

---

## Installation

**1. Import the workflow**

n8n → *Workflows* → *Import from File* → `workflow.json`.

**2. Add the Anthropic credential**

*Credentials* → *New* → **Header Auth**
- Name: `Anthropic API (x-api-key)`
- Header name: `x-api-key`
- Header value: your API key

**3. Set the system prompt**

*Settings* → *Variables* → new variable `TRIAGE_SYSTEM_PROMPT`.
Paste the prompt from `prompts/classifier.md` and fill in the `<business>` block:
company name, what you do, hours, response promise, reply languages, and the
facts the assistant is allowed to state (prices, policies, delivery times).

**Everything the assistant is allowed to say lives in that block.** If a fact is
not there, it will not be stated — the message escalates instead.

**4. Connect the accounts**

Open each node marked `REPLACE_ME` and attach the client credential:
*Send Auto Reply* (Gmail) · *Escalate to Team* (Slack) · *Log Row* (Google Sheets).

**5. Prepare the log sheet**

Create a sheet named `log` with these headers in row 1:

```
received_at | channel | from | category | urgency | language | route | summary | input_tokens | output_tokens
```

Paste its ID from the URL into the *Log Row* node.

**6. Connect your inbox**

The entry point is a webhook at `POST /webhook/inbox-triage`, accepting:

```json
{
  "id": "msg-123",
  "channel": "email",
  "from_name": "Sarah Mitchell",
  "from": "s.mitchell@example.com",
  "subject": "Question about bulk pricing",
  "text": "..."
}
```

Point a Gmail trigger, a WhatsApp Business webhook, or your website form at it.
Add channels by pointing them at the same URL — the *Normalize* node absorbs the
shape differences, so no other node changes.

---

## Recommended rollout

Do not put this in front of live customers on day one.

- **Week 1 — shadow mode.** Disconnect *Send Auto Reply*. Everything routes to the
  team with a suggested draft. Read the log daily.
- **Week 2 — tune.** Every wrong call is a missing fact or an unclear rule in the
  `<business>` block. Fix it there, not in the workflow.
- **Week 3 — go live on the safe categories.** Enable auto-reply once the sales and
  general-inquiry drafts are consistently sendable without edits.

This sequence is also the honest one to sell: the client sees exactly what the
system would have done before it does anything at all.

---

## Trying it without n8n

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python3 demo/run_demo.py
```

Runs the same classification and the same routing rules against the bundled
samples, using only the Python standard library. Pass a path to a JSON file to run
it against your own messages.

---

## Operating notes

- **Cost.** A typical message is roughly 400 input and 200 output tokens on
  `claude-haiku-4-5`. Even at a thousand messages a month, API spend stays in the
  low single-dollar range. `input_tokens` and `output_tokens` are logged per
  message, so the real figure is always visible.
- **Failures.** The Claude call retries three times, two seconds apart. If it still
  fails, the execution errors rather than sending anything — silence is the safe
  failure mode here, never a wrong auto-reply.
- **Adding a category.** Extend the `enum` in the tool schema in the *Classify +
  Draft* node, add a matching rule in the *Route* switch, and describe the new
  category in the system prompt. Three edits, always the same three.
- **Model tier.** Upgrade to `claude-sonnet-5` only for genuinely hard inboxes —
  long technical threads, heavy jargon, mixed languages in one message.

---

## Privacy

Message content is sent to the Anthropic API for classification. No customer data
is stored by this workflow outside the client's own Google Sheet and their own n8n
execution history. Set n8n's execution data retention to match the client's policy
before going live, and confirm the arrangement with them in writing.
