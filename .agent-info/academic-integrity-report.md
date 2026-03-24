# Academic Integrity Report: AI Agent Usage (DiceRoller_CSB430)

**Student:** Zoe  
**Course:** CSB430 — Software Design  
**Project:** DiceRoller  
**Last updated:** 2026-03-24

## Purpose

This report documents how Zoe used GitHub Copilot (agent mode) during development of the DiceRoller project. It is intended to accompany assignment submission materials as an academic integrity disclosure of AI-assisted workflow.

## Usage Summary (Current Snapshot)

Source: `.agent-info/chat-report.md`

| Metric | Value |
|--------|-------|
| Sessions | 20 |
| Total exchanges | 432 |
| User words | 11,289 |
| AI words | 36,217 |
| Tool/MCP calls | 800 |
| Date range | 2026-03-15 17:06 UTC → 2026-03-24 21:41 UTC |
| Models used | copilot/auto, copilot/gpt-4.1, copilot/gpt-5-mini, copilot/gpt-5.4 |

## How Zoe Used the Agent

1. **Implementation support**  
   Zoe used Copilot to draft and revise code in context/state modules, database logic, testing files, and gameplay logic. Generated code was reviewed and iterated before being accepted.

2. **Debugging assistance**  
   Zoe regularly supplied raw terminal output and CI logs for diagnosis. Copilot was used to identify failure causes and propose targeted fixes.

3. **Learning and explanation**  
   Zoe frequently requested detailed code walkthroughs to understand generated changes, design choices, and test behavior, indicating active learning rather than blind adoption.

4. **Code review and PR preparation**  
   Copilot was used for pre-PR review passes, issue alignment checks, and drafting PR/commit message text. Zoe retained manual control over staging and committing.

5. **Style and standards enforcement**  
   Zoe maintained a project instruction file (`.agent-info/agent-reference.md`) and repeatedly enforced conventions (e.g., simpler code paths, fail-fast behavior, reduced unnecessary abstraction).

6. **Architectural reasoning**  
   Beyond implementation, Zoe used Copilot to discuss architecture and rationale (including course-relevant pattern justification), then made final judgment calls on direction.

## Authorship and Decision Ownership

Copilot acted as an assistant under Zoe’s direction. Zoe selected tasks, constrained implementation style, requested revisions, and made final acceptance decisions for project code. AI output was part of a supervised, human-in-the-loop workflow, not an unsupervised replacement for authorship.

Note: Recent activity included additional Copilot model variants (copilot/gpt-4.1, copilot/gpt-5-mini, copilot/gpt-5.4); all AI outputs were reviewed and accepted by the student.

## Evidence Files

- `.agent-info/agent-usage-log.md` — chronological usage log with user prompts and AI response summaries
- `.agent-info/chat-log-checkpoint.json` — incremental processing checkpoint
- `.agent-info/chat-report.md` — generated aggregate metrics and per-session breakdown

## Maintenance Note

This file is intentionally separate from `.agent-info/chat-report.md` so generated report refreshes do not overwrite the professor-facing narrative. When logs are refreshed, only the metric table above may need quick updating if totals changed.
