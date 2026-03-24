#!/usr/bin/env python3
"""
generate_usage_log.py — Build an incremental agent usage log for academic reporting.

Outputs a human-readable Markdown log of all your Copilot conversations,
with your requests shown verbatim and AI responses summarized.

The log is append-only: each run adds only exchanges newer than the last
checkpoint, so you can run this at any point to bring the log up to date.

Usage:
    python3 .agent-info/generate_usage_log.py

Output files (both in .agent-info/):
    agent-usage-log.md          — the human-readable log (append-only)
    chat-log-checkpoint.json    — tracks where the last run left off
"""

import json
import os
from datetime import datetime, timezone

SESSION_DIR = os.path.expanduser(
    "~/.config/Code/User/workspaceStorage"
    "/be8fdba53ac932027b0e4b8842a3d371/chatSessions"
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "agent-usage-log.md")
CHECKPOINT_FILE = os.path.join(SCRIPT_DIR, "chat-log-checkpoint.json")

# Response item kinds that contain no readable text
SKIP_RESPONSE_KINDS = {
    "mcpServersStarting",
    "progressMessage",
    "agentUsedContext",
    "toolCall",
    "toolResult",
    "inlineReference",
    "markdownVuln",
    "confirmation",
    "command",
}


# ── Parsing helpers ────────────────────────────────────────────────────────────

def ts_to_str(ms):
    if not ms:
        return "unknown"
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime(
        "%Y-%m-%d %H:%M UTC"
    )


def extract_response_text(response_list):
    """Concatenate all plain-text value chunks from the AI response array."""
    parts = []
    for r in response_list:
        if not isinstance(r, dict):
            continue
        if r.get("kind") in SKIP_RESPONSE_KINDS:
            continue
        if r.get("kind") is None and isinstance(r.get("value"), str):
            parts.append(r["value"])
    return "".join(parts).strip()


def extract_tool_actions(response_list):
    """
    Return readable descriptions of each tool/MCP call made.
    toolInvocationSerialized items carry an invocationMessage with a human-
    readable 'value' string (e.g. 'Reading src/db.js, lines 1-40').
    """
    actions = []
    for r in response_list:
        if not isinstance(r, dict):
            continue
        if r.get("kind") == "toolInvocationSerialized":
            msg = r.get("invocationMessage", {})
            if isinstance(msg, dict):
                val = msg.get("value", "").strip()
                if val:
                    actions.append(val)
    return actions


def is_standalone_text_chunk(item):
    """
    In some sessions the AI response text is stored as separate list items
    (with 'value' and 'supportThemeIcons' but no 'requestId') rather than
    inside the request item's 'response' array.
    """
    return (
        isinstance(item, dict)
        and "value" in item
        and "supportThemeIcons" in item
        and "requestId" not in item
    )


def parse_session(filepath):
    """
    Parse one .jsonl session file.
    Returns a dict: { session_id, title, created_at, exchanges }
    Each exchange: { request_id, timestamp, user, ai, tool_count, tool_actions }
    """
    try:
        lines = open(filepath, encoding="utf-8").readlines()
    except Exception:
        return None

    session = {
        "session_id": os.path.splitext(os.path.basename(filepath))[0],
        "title": None,
        "created_at": None,
        "exchanges": [],
    }

    pending_request = None
    last_request_had_text = False

    for raw in lines:
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            continue

        kind = obj.get("kind")
        v = obj.get("v")

        if kind == 0 and isinstance(v, dict):
            session["created_at"] = v.get("creationDate")

        elif kind == 1 and isinstance(v, str) and v.strip():
            if session["title"] is None:
                session["title"] = v.strip()

        elif kind == 2 and isinstance(v, list):
            for item in v:
                if not isinstance(item, dict):
                    continue

                if "requestId" in item and "message" in item:
                    msg = item.get("message", {})
                    user_text = (
                        msg.get("text", "").strip()
                        if isinstance(msg, dict)
                        else str(msg).strip()
                    )
                    response_list = item.get("response", [])
                    ai_text = extract_response_text(response_list)
                    tool_actions = extract_tool_actions(response_list)

                    exchange = {
                        "request_id": item.get("requestId"),
                        "timestamp": item.get("timestamp"),
                        "user": user_text,
                        "ai": ai_text,
                        "tool_count": len(tool_actions),
                        "tool_actions": tool_actions,
                    }
                    session["exchanges"].append(exchange)
                    pending_request = exchange
                    last_request_had_text = bool(ai_text)

                elif is_standalone_text_chunk(item):
                    if pending_request is not None and not last_request_had_text:
                        pending_request["ai"] = (
                            pending_request["ai"] + item["value"]
                        ).strip()
                    if pending_request:
                        last_request_had_text = bool(pending_request["ai"])

    if not session["title"]:
        session["title"] = "(untitled)"

    return session


# ── Checkpoint ─────────────────────────────────────────────────────────────────

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, encoding="utf-8") as f:
            return json.load(f)
    return None


def save_checkpoint(last_timestamp, last_request_id, total_sessions, total_exchanges):
    data = {
        "_note": (
            "This file tracks where generate_usage_log.py last left off. "
            "On the next run, only exchanges with a timestamp strictly greater than "
            "'last_processed_timestamp' will be appended to agent-usage-log.md. "
            "Do not edit last_processed_timestamp manually unless you want to re-process history."
        ),
        "generated_at": datetime.now(tz=timezone.utc).isoformat(),
        "last_processed_timestamp": last_timestamp,
        "last_processed_request_id": last_request_id,
        "total_sessions_in_store": total_sessions,
        "total_exchanges_in_store": total_exchanges,
    }
    with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ── Formatting ─────────────────────────────────────────────────────────────────

def format_ai_block(exchange):
    """
    Format the AI response portion of a log entry.
    Shows tool actions (if any) then the first ~200 words of the response text.
    """
    tool_count = exchange["tool_count"]
    tool_actions = exchange["tool_actions"]
    ai_text = exchange["ai"]

    lines = [
        f"**Copilot** _({tool_count} tool call{'s' if tool_count != 1 else ''})_",
        "",
    ]

    if tool_actions:
        lines.append("*Tools used:*")
        for action in tool_actions[:10]:
            clean = action.strip().replace("\n", " ")
            if len(clean) > 120:
                clean = clean[:120] + "…"
            lines.append(f"- {clean}")
        if len(tool_actions) > 10:
            lines.append(f"- _(…and {len(tool_actions) - 10} more)_")
        lines.append("")

    if ai_text:
        words = ai_text.split()
        if len(words) > 200:
            summary = " ".join(words[:200]) + "…"
        else:
            summary = ai_text
        lines.append("*Summary:*")
        lines.append("")
        lines.append(summary)
    else:
        lines.append("_(No text response captured)_")

    return "\n".join(lines)


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    if not os.path.isdir(SESSION_DIR):
        print(f"ERROR: Session directory not found:\n  {SESSION_DIR}")
        return

    checkpoint = load_checkpoint()
    cutoff_ts = checkpoint["last_processed_timestamp"] if checkpoint else 0
    is_first_run = checkpoint is None

    # Parse and sort all sessions chronologically
    files = sorted(
        [f for f in os.listdir(SESSION_DIR) if f.endswith(".jsonl")],
        key=lambda f: os.path.getmtime(os.path.join(SESSION_DIR, f)),
    )
    sessions = []
    for fname in files:
        s = parse_session(os.path.join(SESSION_DIR, fname))
        if s and s["exchanges"]:
            sessions.append(s)
    sessions.sort(key=lambda s: s["created_at"] or 0)

    # Collect only exchanges newer than the checkpoint cutoff
    new_entries = [
        (session, ex)
        for session in sessions
        for ex in session["exchanges"]
        if (ex.get("timestamp") or 0) > cutoff_ts
    ]

    if not new_entries:
        print("No new exchanges since last checkpoint. Log is up to date.")
        print(f"  Checkpoint: {ts_to_str(cutoff_ts)}")
        return

    # Group entries by session, preserving order
    session_groups = {}
    ordered_sessions = []
    for session, ex in new_entries:
        sid = session["session_id"]
        if sid not in session_groups:
            session_groups[sid] = {"session": session, "exchanges": []}
            ordered_sessions.append(sid)
        session_groups[sid]["exchanges"].append(ex)

    # Build output text
    out = []

    if is_first_run:
        out += [
            "# Agent Usage Log — DiceRoller_CSB430",
            "",
            "_Generated by `.agent-info/generate_usage_log.py` · Append-only, incremental._  ",
            "_User messages are verbatim. AI responses show tool actions + first ~200 words._",
            "",
            "---",
            "",
        ]

    run_ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    out += [f"## Run: {run_ts}", ""]

    for sid in ordered_sessions:
        group = session_groups[sid]
        session = group["session"]
        exchanges = group["exchanges"]

        out += [
            f"### Session: \"{session['title']}\"",
            f"_{ts_to_str(session['created_at'])} · `{session['session_id']}`_",
            "",
        ]

        all_request_ids = [e["request_id"] for e in session["exchanges"]]

        for ex in exchanges:
            try:
                ex_num = all_request_ids.index(ex["request_id"]) + 1
            except ValueError:
                ex_num = "?"

            out += [
                f"#### Exchange {ex_num} — {ts_to_str(ex.get('timestamp'))}",
                "",
                "**You:**",
                "",
                ex["user"],
                "",
                format_ai_block(ex),
                "",
                "---",
                "",
            ]

    # Update checkpoint to the latest timestamp seen
    last_ts = max((ex.get("timestamp") or 0) for _, ex in new_entries)
    last_req_id = next(
        (ex.get("request_id") for _, ex in reversed(new_entries)
         if (ex.get("timestamp") or 0) == last_ts),
        None,
    )

    total_sessions = len(sessions)
    total_exchanges = sum(len(s["exchanges"]) for s in sessions)

    mode = "w" if is_first_run else "a"
    with open(LOG_FILE, mode, encoding="utf-8") as f:
        f.write("\n".join(out))
        f.write("\n")

    save_checkpoint(last_ts, last_req_id, total_sessions, total_exchanges)

    print(
        f"Logged {len(new_entries)} exchange(s) across "
        f"{len(ordered_sessions)} session(s)."
    )
    print(f"  Log:        {LOG_FILE}")
    print(f"  Checkpoint: {CHECKPOINT_FILE}")


if __name__ == "__main__":
    main()
