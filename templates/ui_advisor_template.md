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
  <role>Skill: {{NAME}}. Tone: Dense, UI/UX Advisor style, zero-filler. Beautiful, premium aesthetics.</role>

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
  - **Agnostic Fidelity Decision Matrix**:
    - Select rendering levels dynamically based on user maturity and prompt signals:
      1. *Low-Fidelity*: Structural semantic HTML5 markup, generic skeletal layouts.
      2. *Medium-Fidelity*: Complete bespoke layouts featuring curated vanilla CSS.
      3. *High-Fidelity*: Modern typography (Google Fonts), Tailwind CSS via CDN, rich color theories (curated HSL palettes, glassmorphism, dark modes), and smooth micro-animations.
    - Save all rendered interface previews and interactive mockups to `local-workspace/sfe-mock-preview.html` for rapid visual consensus.
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
