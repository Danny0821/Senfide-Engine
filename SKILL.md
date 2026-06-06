---
name: "senfide-engine"
description: "Scaffold security-first, Caveman-styled skills, hooks, agents, or multi-agent systems for the Senfide Engine."
version: "0.1.0"
triggers:
  - "/sfe-gen"
requirements:
  - "node: >=18"
---

# SKILL.md — Senfide Engine (Caveman Style)

> [!NOTE]
> Dense playbook for turning ideas into sandboxed Skills, Hooks, Agents, or coordinated systems.

## 🔴 Safety Restraints (Non-Negotiable)
- **No plaintext credentials**: Scanned & blocked from all generated templates.
- **Sandboxed Execution**: Escaped arguments, path validation, absolute paths only.
- **Pristine Code Firewall**: Code generated inside scripts MUST be production-grade, highly readable, fully commented. Caveman style restricted purely to markdown rules & log messages.

## 🟢 Playbook Steps

### 1. Identify Need & Suggest Architecture
- Receive idea. Check scope complexity.
- **If scope has >1 distinct domain of responsibility** (e.g. "Python dev + security auditor + reviewer"):
  - **Recommend coordinated Skill System**.
  - Group into parent folder. Manifest in `SYSTEM.md`.
- **If scope is event-driven task automation** (e.g. check on save, scan keys before commit):
  - **Suggest Agent Hook** (place in `.agents/rules/`).
- **If scope is custom persona or dedicated interface**:
  - **Suggest Agent Profile** (`AGENT.md`).
- **Otherwise**:
  - **Suggest standard Skill** (folder with `SKILL.md`).

### 2. Scaffold using CLI
- Direct user to execute:
  ```bash
  sfe --blueprint <blueprint-json-path>
  ```
- Or run the tool scripts directly:
  ```bash
  node cli_bin/cli.js --blueprint <blueprint-json-path>
  ```

### 3. Autolearner Protocol Integration
- Every scaffolded system/skill MUST contain:
  1. `lessons_index.md`: high-level bullet issue log + exact coordinate pointer (`playbook.md#L[num]`).
  2. `playbook.md`: deep-dive technical solution context, code workarounds.
- Instruct user to document platform specific quirks (e.g. Windows slashes, command mismatches) into these files to prevent regression.

### 4. Apply 2026 Frontier Models Guidelines
- When writing generated skill playbooks/instructions:
  - **Outcome-First (Reasoning-Class Models)**: Define concrete destination success criteria, drop rigid process constraints.
  - **Extreme Literalism (Instruction-Following Models)**: Avoid vague verbs like "review" or "improve". Write exact execution parameters.
  - **Prompt Caching (Prefix-Caching Models)**: Place static rules first, dynamic variables last. Keep formatting character-stable.

### 5. Prompt Enhancement & Elaboration Rule (CRITICAL)
- **Do not copy-paste raw user ideas** into the generated templates.
- Act as an Expert Prompt and Workflow Architect.
- When generating, **elaborate the task dynamically**:
  - Invent highly descriptive, expert-level sub-tasks and outcomes matching the domain.
  - Formulate concrete edge cases (e.g. rate limits, platform-specific command differences, timeout flags).
  - Draft precise, safe terminal commands and regex validation rules.
  - Expand `{{PLAYBOOK_STEPS}}` into full, production-grade instructions structured cleanly under XML nodes (<role>, <context>, <task_definition>, <output_format>, <scope_constraints>).

### 6. Agent Onboarding & Non-Technical User Playbook (CRITICAL)
- **Trigger**: If user pastes the generator GitHub repo, or is confused about terminal setups.
- **Jargon-Free Explanations**: Stop using raw terminal/npm jargon. Explain concepts using easy analogies:
  - *NPM / NPX*: "An App Store for developer tools. Runs commands instantly with no manual downloads."
  - *Terminal / Shell*: "A direct text line to your computer's system."
  - *Global slash command*: "A custom shortcut button in your chat box, active in any folder."
- **Auto-Install Offer**: Explicitly ask: *"Would you like me to install this globally for you right now? Zero typing required."*
- **Execution**: If approved, immediately run command: `npm install -g github:Danny0821/Senfide-Engine#master` using your run_command tool to automate their setup.

## ⚠️ Review Loops (Devil's Advocate)
- Before presenting generated scaffold to user, inspect generated output files.
- Double-check:
  - Is `SYSTEM.md` or `SKILL.md` written in Caveman format (no filler words, high-density)?
  - Is generated javascript/typescript code of high quality, complete, and properly commented?
  - Are all credential and command safety guidelines present?
