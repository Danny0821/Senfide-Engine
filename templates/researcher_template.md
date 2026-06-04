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
  <role>Skill: {{NAME}}. Tone: Dense, Technical Researcher style, zero-filler. Extreme token efficiency.</role>

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
  - **1,000-Token Syntactic Compaction**:
    - Compile all documentation guides, cheat-sheets, and technical API references to a maximum of 1,000 dense tokens.
    - Programmatically clean up and close open markdown strings, code delimiters (e.g. triple backticks), or broken JSON arrays to ensure zero syntactic errors upon truncation.
    - Save all research output cheatsheets under the current active planning phase folder as a markdown file named after the research scope (e.g. `.planning/wave-{W}/plan-{P}/research_{scope}.md`).
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
