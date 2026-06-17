---
name: "sfe-map-project"
description: "Scan the target directory recursively to auto-detect codebase stack and suggest optimized SFE blueprint."
compatibility: "Requires node"
metadata:
  version: "0.1.0"
  triggers: "/sfe-map-project"
---

# SKILL.md — sfe-map-project

<instructions>
  <role>Skill: sfe-map-project. Tone: Senior Principal Engineer, zero-filler. Precise, exact, analytical.</role>

  <context>
  - System: sfe-map-project
  - Triggers: /sfe-map-project
  - Check lessons_index.md & playbook.md first. Prevents regressions.
  - Execute project scan to detect stack signature files (package.json, requirements.txt, go.mod, Cargo.toml, prose/docs, etc.).
  </context>

  <task_definition>
  - Crawl the workspace recursively to analyze target path.
  - Propose custom multi-agent SFE dev team layout and permissions based on detected tech stack.
  - Write output suggestion blueprint payload to `scratch/blueprint.json` after two-step verification loop confirmation with the user.
  - Translate non-coding/prose folders to Editorial/Proofreader templates dynamically.
  </task_definition>

  <output_format>
  - First, execute scan using `sfe --map <path>` to get report.
  - Print the project analysis report in chat, detailing detected features and recommended archetypes.
  - Ask user for confirmation before writing layout blueprint.
  - On approval, write blueprint to `scratch/blueprint.json` and inform user.
  </output_format>

  <scope_constraints>
  - Avoid compiling or running untested commands.
  - Keep commands constrained to standard project folders.
  - Non-coding fallback: Use Editorial templates (Planner -> pm, Writer -> developer, Proofreader -> qa/auditor) and deny command execute tool permissions.
  - Cascade code fallback: Preserve write/command groups but use default agnostic playbook templates.
  </scope_constraints>
</instructions>

<review_checks>
- Verify that permissions mapped in blueprint are correct (no command permissions for prose/non-coding stacks).
- Verify that blueprint.json resides only in the local project's scratch/ folder.
</review_checks>
