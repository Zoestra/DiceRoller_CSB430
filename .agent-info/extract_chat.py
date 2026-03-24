#!/usr/bin/env python3
"""
extract_chat.py — Extract and report on all Copilot chat sessions for this project.

Usage:
    python3 .agent-info/extract_chat.py
    python3 .agent-info/extract_chat.py --output .agent-info/chat-report.md
    python3 .agent-info/extract_chat.py --full   # include full transcripts
"""

import json
import os
import sys
import argparse
from datetime import datetime, timezone

SESSION_DIR = os.path.expanduser(
    "~/.config/Code/User/workspaceStorage"
    "/be8fdba53ac932027b0e4b8842a3d371/chatSessions"
)

SKIP_RESPONSE_KINDS = {
    "mcpServersStarting",
    "progressMessage",
    "agentUsedContext",
    "toolCall",
    "toolResult",
    "toolInvocationSerialized",
    "inlineReference",
    "markdownVuln",
    "confirmation",
    "command",
}


def ts_to_str(ms):
    """Convert millisecond timestamp to readable UTC string."""
    if not ms:
        return "unknown"
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime(
        "%Y-%m-%d %H:%M UTC"
    )


def extract_text_from_response_array(response_list):
    """
    Pull AI response text from the embedded-response format:
    response is a list where text chunks are dicts with no 'kind' (or kind=None)
    and a 'value' string field.
    """
    parts = []
    for r in response_list:
        if not isinstance(r, dict):
            continue
        if r.get("kind") in SKIP_RESPONSE_KINDS:
            continue
        if r.get("kind") is None and isinstance(r.get("value"), str):
            parts.append(r["value"])
    return "".join(parts).strip()


def is_standalone_text_chunk(item):
    """Standalone text chunks appear as top-level kind=2 list items with 'value'
    and 'supportThemeIcons' keys (but no 'requestId')."""
    return (
        isinstance(item, dict)
        and "value" in item
        and "supportThemeIcons" in item
        and "requestId" not in item
    )


def count_tool_calls(response_list):
    """Count how many tool/MCP calls were made in this exchange."""
    return sum(
        1
        for r in response_list
        if isinstance(r, dict) and r.get("kind") == "toolInvocationSerialized"
    )


def parse_session(filepath):
    """
    Parse a single .jsonl session file.
    Returns a dict with:
        session_id, title, created_at, exchanges, model
    Each exchange: { user, ai, timestamp, model, tool_calls }
    """
    try:
        lines = open(filepath, encoding="utf-8").readlines()
    except Exception as e:
        return None

    session = {
        "session_id": os.path.splitext(os.path.basename(filepath))[0],
        "title": None,
        "created_at": None,
        "model": None,
        "exchanges": [],
    }

    # We need to track requests in order, then match standalone response text
    # to the request that precedes them.
    pending_request = None  # last seen request item that may lack embedded text
    last_request_had_text = False

    for raw in lines:
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            continue

        kind = obj.get("kind")
        v = obj.get("v")

        # ── kind=0: session header ──────────────────────────────────────────
        if kind == 0 and isinstance(v, dict):
            session["created_at"] = v.get("creationDate")
            # Grab model from inputState if present
            try:
                model_name = v["inputState"]["selectedModel"]["metadata"]["name"]
                session["model"] = model_name
            except (KeyError, TypeError):
                pass

        # ── kind=1 str: session title ───────────────────────────────────────
        elif kind == 1 and isinstance(v, str) and v.strip():
            if session["title"] is None:
                session["title"] = v.strip()

        # ── kind=2 list: exchanges or standalone response chunks ────────────
        elif kind == 2 and isinstance(v, list):
            for item in v:
                if not isinstance(item, dict):
                    continue

                # Request item (has requestId + message)
                if "requestId" in item and "message" in item:
                    msg = item.get("message", {})
                    user_text = (
                        msg.get("text", "").strip()
                        if isinstance(msg, dict)
                        else str(msg).strip()
                    )

                    response_list = item.get("response", [])
                    ai_text = extract_text_from_response_array(response_list)
                    tool_calls = count_tool_calls(response_list)

                    # Grab model override if present
                    model = item.get("modelId") or session["model"]

                    exchange = {
                        "user": user_text,
                        "ai": ai_text,
                        "timestamp": item.get("timestamp"),
                        "model": model,
                        "tool_calls": tool_calls,
                        "request_id": item.get("requestId"),
                    }
                    session["exchanges"].append(exchange)

                    # Track whether this request embedded its own AI text
                    pending_request = exchange
                    last_request_had_text = bool(ai_text)

                # Standalone text chunk (response text from the alternate format)
                elif is_standalone_text_chunk(item):
                    if pending_request is not None and not last_request_had_text:
                        pending_request["ai"] = (
                            pending_request["ai"] + item["value"]
                        ).strip()
                    # After we've picked up one or more chunks, mark as having text
                    if pending_request:
                        last_request_had_text = bool(pending_request["ai"])

    if not session["title"]:
        session["title"] = "(untitled)"

    return session


def word_count(text):
    return len(text.split()) if text else 0


def build_report(sessions, full_transcripts=False):
    lines = []

    # ── Global stats ────────────────────────────────────────────────────────
    total_exchanges = sum(len(s["exchanges"]) for s in sessions)
    total_user_words = sum(
        word_count(e["user"]) for s in sessions for e in s["exchanges"]
    )
    total_ai_words = sum(
        word_count(e["ai"]) for s in sessions for e in s["exchanges"]
    )
    total_tool_calls = sum(
        e["tool_calls"] for s in sessions for e in s["exchanges"]
    )
    all_dates = [
        s["created_at"] for s in sessions if s["created_at"]
    ]
    date_range = (
        f"{ts_to_str(min(all_dates))} → {ts_to_str(max(all_dates))}"
        if all_dates
        else "unknown"
    )
    models_used = sorted(
        set(
            e["model"]
            for s in sessions
            for e in s["exchanges"]
            if e.get("model")
        )
    )

    lines += [
        "# Copilot Chat Report — DiceRoller_CSB430",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "## Summary",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Sessions | {len(sessions)} |",
        f"| Total exchanges | {total_exchanges} |",
        f"| User words | {total_user_words:,} |",
        f"| AI words | {total_ai_words:,} |",
        f"| Tool/MCP calls | {total_tool_calls} |",
        f"| Date range | {date_range} |",
        f"| Models used | {', '.join(models_used) if models_used else 'unknown'} |",
        "",
    ]

    # ── Per-session index ────────────────────────────────────────────────────
    lines += ["## Sessions", ""]
    for i, s in enumerate(sessions, 1):
        ex = s["exchanges"]
        s_user_words = sum(word_count(e["user"]) for e in ex)
        s_ai_words = sum(word_count(e["ai"]) for e in ex)
        s_tool_calls = sum(e["tool_calls"] for e in ex)
        lines += [
            f"### {i}. {s['title']}",
            "",
            f"- **Date:** {ts_to_str(s['created_at'])}",
            f"- **Session ID:** `{s['session_id']}`",
            f"- **Exchanges:** {len(ex)}",
            f"- **User words:** {s_user_words:,}",
            f"- **AI words:** {s_ai_words:,}",
            f"- **Tool calls:** {s_tool_calls}",
            "",
        ]
        if ex:
            lines += ["**Exchange list:**", ""]
            for j, e in enumerate(ex, 1):
                user_preview = e["user"][:80].replace("\n", " ")
                if len(e["user"]) > 80:
                    user_preview += "…"
                lines.append(f"{j}. *{user_preview}*")
            lines.append("")

        if full_transcripts and ex:
            lines += ["**Full transcript:**", ""]
            for j, e in enumerate(ex, 1):
                lines += [
                    f"---",
                    f"**[{j}] User** _{ts_to_str(e['timestamp'])}_",
                    "",
                    e["user"],
                    "",
                ]
                if e["ai"]:
                    lines += [
                        f"**[{j}] AI** _(model: {e.get('model','unknown')}, tool calls: {e['tool_calls']})_",
                        "",
                        e["ai"],
                        "",
                    ]
            lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Extract Copilot chat session report.")
    parser.add_argument(
        "--output", "-o", default=None,
        help="Write report to this file (default: stdout)"
    )
    parser.add_argument(
        "--full", action="store_true",
        help="Include full transcripts in the report"
    )
    args = parser.parse_args()

    if not os.path.isdir(SESSION_DIR):
        print(f"ERROR: Session directory not found: {SESSION_DIR}", file=sys.stderr)
        sys.exit(1)

    files = sorted(
        [f for f in os.listdir(SESSION_DIR) if f.endswith(".jsonl")],
        key=lambda f: os.path.getmtime(os.path.join(SESSION_DIR, f)),
    )

    sessions = []
    for fname in files:
        s = parse_session(os.path.join(SESSION_DIR, fname))
        if s and s["exchanges"]:
            sessions.append(s)

    # Sort sessions by creation date
    sessions.sort(key=lambda s: s["created_at"] or 0)

    report = build_report(sessions, full_transcripts=args.full)

    if args.output:
        out_path = os.path.abspath(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"Report written to: {out_path}")
    else:
        print(report)


if __name__ == "__main__":
    main()
