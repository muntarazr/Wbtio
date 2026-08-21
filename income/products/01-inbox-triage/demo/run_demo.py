#!/usr/bin/env python3
"""Run the triage logic outside n8n — same model, same schema, same routing rules.

Purpose: demo it live on a sales call in under a minute, with no n8n instance,
no client credentials, and nothing to install.

    export ANTHROPIC_API_KEY=sk-ant-...
    python3 demo/run_demo.py                    # runs the bundled samples
    python3 demo/run_demo.py path/to/other.json # runs the client's own messages
"""

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-haiku-4-5-20251001"

HERE = Path(__file__).resolve().parent

SYSTEM = """You are the front-desk assistant for the business described below.

<business>
Name: Northline Supply
What they do: Wholesale coffee equipment and consumables for cafes.
Working hours: Sun-Thu, 9:00-17:00
Response promise: within one business day
Languages the business replies in: Arabic, English
Facts you may state: Free shipping on orders above 500 USD. Standard delivery 3-5
business days. Returns accepted within 14 days of delivery for unused items.
</business>

Rules:
1. Reply in the SAME language the customer wrote in, matching their register.
2. Never state a price, date, stock level, or policy not listed in <business>.
   If the answer needs information you do not have, set needs_human = true.
3. Set needs_human = true whenever a wrong answer would cost money or trust.
4. Set urgency = high only for things that get worse by waiting.
5. category = spam only for mass marketing blasts, never for a badly written
   message from a real person.
6. summary is one factual English sentence for the team's log.
7. reply must be sendable as-is: no placeholders, no square brackets.

Call the triage tool exactly once."""

TOOL = {
    "name": "triage",
    "description": "Classify the customer message and draft a reply.",
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "enum": ["sales", "support", "complaint", "billing", "spam", "other"],
            },
            "urgency": {"type": "string", "enum": ["low", "normal", "high"]},
            "language": {"type": "string"},
            "summary": {"type": "string"},
            "needs_human": {"type": "boolean"},
            "reply": {"type": "string"},
        },
        "required": [
            "category", "urgency", "language", "summary", "needs_human", "reply",
        ],
    },
}


def triage(message, api_key):
    body = {
        "model": MODEL,
        "max_tokens": 1024,
        "system": SYSTEM,
        "tools": [TOOL],
        "tool_choice": {"type": "tool", "name": "triage"},
        "messages": [{
            "role": "user",
            "content": (
                f"Channel: {message.get('channel', 'email')}\n"
                f"From: {message.get('from_name', '')} <{message.get('from', '')}>\n"
                f"Subject: {message.get('subject', '')}\n\n"
                f"{message['text']}"
            ),
        }],
    }

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode(),
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        payload = json.load(resp)

    block = next((c for c in payload["content"] if c["type"] == "tool_use"), None)
    if block is None:
        raise RuntimeError("No tool_use block in response")

    result = dict(block["input"])
    result["usage"] = payload.get("usage", {})
    return result


def route_of(t):
    """Same rule the n8n 'Parse + Route' node applies. Keep the two in sync."""
    if t["category"] == "spam":
        return "drop"
    if t["needs_human"] or t["urgency"] == "high" or t["category"] == "complaint":
        return "human"
    return "auto"


ROUTE_LABEL = {
    "auto": "AUTO-REPLIED",
    "human": "ESCALATED TO HUMAN",
    "drop": "DROPPED (spam)",
}


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("ANTHROPIC_API_KEY is not set.")

    path = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "sample-messages.json"
    messages = json.loads(path.read_text(encoding="utf-8"))

    handled = 0
    for msg in messages:
        print("=" * 72)
        print(f"FROM    {msg.get('from_name', '')} <{msg.get('from', '')}>  "
              f"[{msg.get('channel', 'email')}]")
        print(f"SUBJECT {msg.get('subject') or '(none)'}")
        print(f"BODY    {msg['text'][:160]}")
        print("-" * 72)

        try:
            t = triage(msg, api_key)
        except urllib.error.HTTPError as e:
            print(f"  API error {e.code}: {e.read().decode()[:200]}")
            continue

        route = route_of(t)
        if route == "auto":
            handled += 1

        print(f"  category  {t['category']}   urgency {t['urgency']}   "
              f"lang {t['language']}")
        print(f"  summary   {t['summary']}")
        print(f"  ACTION    {ROUTE_LABEL[route]}")
        print(f"  reply     {t['reply']}")
        print(f"  tokens    in {t['usage'].get('input_tokens', 0)} / "
              f"out {t['usage'].get('output_tokens', 0)}")
        print()

    total = len(messages)
    if total:
        print("=" * 72)
        print(f"{handled} of {total} messages closed with no human involved "
              f"({handled * 100 // total}%).")


if __name__ == "__main__":
    main()
