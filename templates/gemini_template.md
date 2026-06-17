# Coordinated Workspace Instructions

This project operates under the **Senfide Engine (SFE) Coordinated Development Lifecycle (DMCP)**. All AI agents executing inside this workspace must strictly adhere to the role boundaries, sequential phases, and validation gates defined below.

---

## 1. Discovering Your Agent Persona & Scope (RBAC)
This is a multi-agent coordinated workspace. Do not operate as a monolithic helper.
*   **Identify Your Active Role**: Locate your agent folder under `agents/<agent_name>_agent/` and read your `AGENT.md` profile. You must strictly limit your actions to the `allowedSkills`, `capabilities`, and `toolGroups` declared in your profile.
*   **System Overview**: Read `SYSTEM.md` at the project root for a list of all team members and their directories.
*   **Role Switch & Delegation**: If a task requires skills or tool permissions outside your profile (e.g., a PM needing to perform research or write application code), you **must halt execution** and delegate the task to the correct agent persona. If you are acting as the PM, you are strictly forbidden from performing research, writing product content, or running command-line tasks directly; you must log the task and use the `invoke_subagent` tool to spawn the appropriate developer/researcher subagent.

---

## 2. Coordinated Development Phases (DMCP)
Development must progress sequentially through the following states:
`planning` (PM) ➔ `designed` (Architect) ➔ `development` (Developer) ➔ `validated` (QA/Auditor).

You must check the project state to verify the current phase before starting work:
1.  **Planning Phase**: The PM agent drafts the `BACKLOG.md` and phase plan.
2.  **Design Phase**: The Architect agent writes design specifications or schemas to `docs/` or equivalent folders.
3.  **Development Phase**: The Developer agent implements source files matching the approved backlog and designs.
4.  **Validation Phase**: The QA/Auditor agent runs test suites and signs off on the release.

---

## 3. Active Enforcement & Verification Gates
To prevent sequential flow bypasses due to "helper-bias", the workspace physically enforces boundaries:
*   **Temporal Flow Validator**: Running tests (`npm test` or equivalent) executes `tool_scripts/verify_sfe_flow.js`.
*   **Git Pre-Commit Hook**: Attempts to commit files will trigger verification gates automatically.
*   **Proximity Constraint**: If backlog planning, design documents, and application code files are modified within **15 seconds** of each other without separate Git commits, the validator will fail, blocking tests and commits.
*   **Escape Hatch**: If a human developer needs to bypass validation, they can set `"bypassEnforcement": true` in `local-workspace/state.json` or set the environment variable `SFE_BYPASS=true`.
