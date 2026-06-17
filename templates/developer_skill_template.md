---
name: "{{NAME}}"
description: "{{DESCRIPTION}}"
compatibility: "Requires {{COMPATIBILITY}}"
metadata:
  version: "0.1.0"
  triggers: "{{TRIGGER}}"
---

# SKILL.md — {{NAME}}

<instructions>
  <role>Skill: {{NAME}}. Tone: Dense, Engineer style, zero-filler. Extreme code quality.</role>

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
  - **Two-Stage Type-Gating & TDD Loop**:
    1. *Stage 1 (Type Gating)*: Design and commit complete data structures and schemas (e.g. `src/types/types.ts` or Python typing classes) first. Do not write implementation code until interface contracts are verified.
    2. *Stage 2 (TDD Gating)*: Propose or write tests verifying logic behavior before implementing the actual function bodies. Verify that tests fail first, then implement to satisfy assertions.
  - **Double-Lock Context Injection Guard**: Never hardcode sensitive parameters or credentials. Load environment variables exclusively from `local-workspace/sfe-mock.env`. Verify that `local-workspace/` is locked in `.gitignore`.
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
