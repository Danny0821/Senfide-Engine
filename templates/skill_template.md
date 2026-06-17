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
  <role>Skill: {{NAME}}. Tone: Dense, Caveman, zero-filler. Maximum accuracy.</role>

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
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
