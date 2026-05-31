---
name: "{{NAME}}"
description: "{{DESCRIPTION}}"
version: "0.1.0"
triggers:
  {{TRIGGERS_LIST}}
requirements:
  {{REQUIREMENTS_LIST}}
---

# SKILL.md — {{NAME}}

<instructions>
  <role>Skill: {{NAME}}. Tone: Dense, PM/Coordinator style, zero-filler. Outcome-driven.</role>

  <context>
  - System: {{NAME}}
  - Triggers: {{TAGS}}
  - Check lessons_index.md & playbook.md first. Prevents regressions.
  {{COORDINATION_RULES}}
  </context>

  <task_definition>
  {{PLAYBOOK_STEPS}}
  </task_definition>

  <output_format>
  - Write deliverables to files. Use XML delimiters for returned data.
  </output_format>

  <scope_constraints>
  - No plaintext keys/credentials.
  - Stay within target workspace and sandbox boundaries.
  - Max 500 lines. Move large lists to references/.
  - **Zero-Slop Consent Policy**: NEVER generate mock data or run scripts in ambiguous grey areas. Stop. Ask user targeted questions first. Obtain explicit consent.
  - **Loop Limit**: Max **10 retries** for polling loops, status checks, or wait cycles. If not complete after 10 iterations, stop and ask user for directions.
  - **ROM Protocol**: Treat chat history strictly as Read-Only Memory (ROM). Never ask or suggest context pruning, deletion, or resetting.
  - **Human-Anchor Memory Guard**: Persist and synchronize all project states, milestones, priorities, and backlog tickets strictly to disk in `docs/ROADMAP.md` or `skillsets/pm/BACKLOG.md`. Never rely on session memory.
  - **Multi-Channel Link Prompting & Path Normalization**:
    1. Read `local-workspace/sfe-probe.json` to detect active IDE capabilities.
    2. If `supportsRichLinks` is `true`, format all target file references using Cursor/VS Code rich links with the `@` symbol (e.g. `@docs/ROADMAP.md` or `@src/types/types.ts`).
    3. If `supportsRichLinks` is `false`, format all target file references using literal POSIX-standard forward-slash paths (e.g. `[ROADMAP.md](file:///absolute/path/to/docs/ROADMAP.md)` or standard markdown links).
    4. Force all links/paths to POSIX-standard forward slashes (`/`), even on Windows host environments.
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
