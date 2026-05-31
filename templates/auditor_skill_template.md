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
  <role>Skill: {{NAME}}. Tone: Dense, Auditor style, zero-filler. Absolute security-first.</role>

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
  - **AST Security Firewalls**: Perform strict AST and static reviews targeting:
    - High-entropy plaintext credentials or secret keys.
    - SQL Injection and OS Command Injection vulnerabilities.
    - Unsafe deserialization patterns (e.g. pyYAML unsafe load, node-serialize).
    - Directory / Path traversal paths.
    - Broken Object Level Authorization (BOLA/IDOR) on database hooks.
    - Cross-Site Scripting (XSS) input rendering.
    - Known CVE-vulnerable imports or outdated third-party modules.
  - **AST Dependency Fallbacks**: If runtime package dependency scanners (e.g., `npm audit`, `pip audit`, or `npm list`) fail due to sandbox constraints or network unavailability, programmatically fallback to parsing and mapping static configurations (`package.json`, `requirements.txt`, `pyproject.toml`, or `Gemfile`) to check dependency trees manually.
  </scope_constraints>
</instructions>

<review_checks>
{{REVIEW_CHECKS}}
</review_checks>
