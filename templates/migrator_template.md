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
  <role>Skill: {{NAME}}. Tone: Dense, Systems Migrator style, zero-filler. Extreme dependency isolation.</role>

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
  - **Isolated Dependency Sandbox Upgrader**:
    - Execute all third-party package modifications, framework updates, or major library migrations (e.g. npm, pip, composer, go mod) strictly in isolated subfolders or offline dry-run environments first.
    - Run structural type checks and unit test runs on the dependency trees before updating root configuration files (such as `package.json` or `requirements.txt`).
    - Audit lockfiles recursively to assert zero transitive dependency bloating before final approval.
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
