# Senfide Engine (`sfe`)

> Premium, zero-dependency security-first scaffolder for the Senfide Engine. Converts natural language developer intents into production-ready, isolated Skills, Agent Hooks, standalone Agent Profiles, and Coordinated Skill Systems.

> [!WARNING]
> **Active Development (Alpha Status)**: This repository represents an early version under active, rapid development. Architectural specifications, templates, CLI flags, and coordinate playbooks are subject to major breaking changes in future releases.

## 💡 What is the `Senfide Engine`?

**Senfide Engine (`sfe`)** is a professional-grade, zero-dependency, security-first command-line engine designed to automate the scaffolding and lifecycle management of isolated **AI Agent Skills, Hook Rules, Standalone Agent Profiles, and Coordinated Agent Systems** in localized developer workspaces.

Rather than writing unstructured playbooks that lead to "AI slop" or context contamination, `sfe` programmatically structures your agent environments with strict execution boundaries, stack-specific telemetry indices, and automated guardrails.

---

## 🚀 1. Installation & Quick Start

Run instantly system-wide via a global installation, or clone the repository to run interactive setups locally.

### Option A: Global Installation (Recommended)
Install the generator globally directly from GitHub to configure both the system-wide CLI and native slash commands instantly:
```bash
# Install system-wide CLI & register all native slash commands globally
npm install -g github:Danny0821/Senfide-Engine#master
```
> [!NOTE]
> This command automatically triggers a `postinstall` synchronization, linking `/sfe-gen`, `/sfe-interview`, and `/sfe-blueprint` native slash commands directly into your AI Agent chat environment configuration directories, delivering a zero-keyboard setup experience.

### Option B: Local Setup & Development
If you plan to customize templates or contribute to the `Senfide Engine`, clone the repository and run interactive setups locally:
```bash
# 1. Clone the repository
git clone https://github.com/Danny0821/Senfide-Engine.git
cd Senfide-Engine

# 2. Run setup
npm install

# 3. Launch the programmatic CLI locally
node cli_bin/cli.js --help

# 4. (Optional) Sync slash commands globally from your local clone
npm run install-sfe

# 5. (Optional) Purge global commands cleanly
npm run uninstall-sfe

# 6. Run the unit and E2E verification tests
npm run test
```

---

## 🤖 2. How to Use in Agentic Mode

`sfe` is natively designed to be utilized and triggered by **AI Coding Agents** (such as Gemini, or other advanced coding assistants) operating in your local development workspace.

### 1. Intercepting a Shared Skill Workspace
When a user pastes a GitHub repository link or points an AI Agent to a folder containing a skill scaffolded by the `Senfide Engine`, the primary `SKILL.md` file contains UPA-aligned onboarding manifests.
* The Agent automatically recognizes the generator directory layout.
* It will immediately initiate a concise, direct, and jargon-free onboarding sequence to guide you through workspace commands.

### 2. Prompting the Agent to Scaffold new Skills
You can directly command your active coding agent to create custom skill profiles, pre-commit hook rules, or DevTeam systems for you.
* **Via Slash Command:** Simply type `/sfe-gen` in your chat interface. The active agent will capture the slash command manifest, execute the underlying generator globally, and guide you through the creation steps programmatically.
* **Via Conversational Onboarding:** Type `/sfe-interview` or `/sfe-blueprint` in your chat interface. The dedicated `sfe-interview` or `sfe-blueprint` skill will boot up, lead you through a direct, concise, and jargon-free interview about your project requirements, synthesize a team blueprint JSON, and scaffold it automatically inside your local `./skillsets/` workspace.
* **Via Prompting:** Send a clear text directive to your agent to invoke `sfe` under the hood:
  > **Prompt Directive Example:**
  > *"Create a new local-only Security Auditor skill named 'secret-scanner' using sfe. Setup advanced Python scanning requirements."*

### 3. The Self-Improving Telemetry Loop (Autolearner Protocol)
When an agent is performing software creation or infrastructure tasks under a `Senfide Engine` skill, it is bound to a closed-loop learning protocol:
1. **Regression Prevention:** Before beginning any code write or build action, the agent's XML instructions mandate that it reads `lessons_index.md` (Telemetry Index) and `playbook.md` (Telemetry Playbook) inside the skill folder to check for historical bugs or OS workarounds.
2. **Failure Logging:** If a sandbox run, build test, or security pre-commit validation fails, the agent writes the detailed failure context and fix criteria directly into the playbook, making it dynamically smarter for all future tasks.

---

## ⚙️ 3. CLI Command & Parameters Reference

`sfe` operates as an interactive guided wizard or via direct query command-line parameters:

```bash
# 1. List all globally cataloged skills across projects
sfe --list

# 2. Fuzzy search registry index by keyword or tag
sfe --search <term>

# 3. Recursively crawl a folder to discover and index existing skills
sfe --scan <directory-path>

# 4. Scaffolding with global-index bypass (bypasses registerSkill indexer)
sfe --local-only

# 5. Unregister skill from global registry database
sfe --remove <skill-name>

# 6. Unregister skill AND physically purge its folders from disk
# (purges are restricted strictly to files inside global ~/.gemini/config/ skills path)
sfe --remove <skill-name> --purge

# 7. Declaratively scaffold a complete coordinated multi-skill team from a JSON blueprint file
sfe --blueprint <blueprint-json-path>

# 8. Force override/overwrite existing directories during blueprint scaffolding
sfe --blueprint <blueprint-json-path> --force
```

---

## 👥 4. The 6 DevTeam Archetypes

To eradicate technology stack mixing ("AI slop") and Greenfield empty directory conflicts, all generated playbooks are partitioned into **6 specialized organizational profiles**:

| Archetype Profile | Core Responsibility | Key Deliverables | Tech Stack Limits |
| :--- | :--- | :--- | :--- |
| **`pm`** (Product Manager) | Roadmaps & Scrum priority backlog | `ROADMAP.md`, `BACKLOG.md` | Zero application code. |
| **`architect`** (Designer) | normalized schemas & UX wireframes | `docs/architecture/schema.sql`, `wireframes.md` | Zero application code. |
| **`devops`** (Infrastructure) | virtualization, CI/CD pipeline scripts | `Dockerfile`, `docker-compose.yml`, GitHub actions | Zero business logic. |
| **`developer`** (Creator) | Compiler standard coding, unit TDD | C#, C++, Rust, Node runtime source codes, `tests/` | Native compilation. |
| **`qa`** (Tester) | E2E automation tests, mock fixtures | Playwright, Cypress test suites in `tests/` | Zero developer bootstrap. |
| **`auditor`** (Security) | Threat models, OWASP security scans | Semgrep scanners rules, threat logs | Zero wireframe designs. |

---

## 🔄 5. Dual-Mode Coordination Protocol (DMCP)

Generated playbooks contain a dynamic, decentralized execution protocol inside their XML instructions:

* **Orchestrated Mode**: Active parent coordinator governs execution via direct parent-agent directives.
* **Choreographed Fallback**: Self-organizing execution flow for multi-agent greenfield projects:
  * **PM & Architect** assume execution priority in empty folders, bootstrapping roadmap manifests and DB schemas inside `docs/architecture/` to unblock engineers.
  * **Developer, DevOps, QA, and Auditor** identify empty workspaces, save initial configurations, and gracefully **yield execution** to prerequisite blueprint skills, preventing code creation without specifications.

### Greenfield Pipeline Flow:
```mermaid
graph TD
    EmptyDir[Empty Workspace] --> PM[PM: ROADMAP.md & Backlog]
    PM --> Arch[Architect: schema.sql & wireframes.md]
    Arch --> DevOpt[DevOps: virtualization Dockerfiles & CI configs]
    Arch --> Dev[Developer: Environment Bootstrap npm init, cargo init]
    Dev --> Code[Core Business Logic & Unit tests TDD]
    Code --> QA[QA: E2E Playwright tests]
    Code --> Audit[Auditor: Static scan exclusions & security audit]
```

---

## 📂 6. Dynamic Telemetry Registries & safe Fallback

Every generated skill receives an isolated telemetry index (`lessons_index.md`) and playbook (`playbook.md`) database aligned with its **Archetype** and **Language/Technology** environment:

* **Developer JS (`developer:js`)**: Telemetries regarding Node platform checks (`os.platform()`), path concatenate (`path.join`), environment variables (`process.env`), and readline streams (`rl.close()`).
* **Developer Python (`developer:py`)**: Telemetries regarding Python `pathlib.Path`, secure variables loads (`os.getenv`), secure subprocess parameters, and `pytest` module testing checks.
* **Designer / Architect (`architect`)**: Telemetries regarding Foreign Key topologically sorted DDL SQL statements.
* **Three-Tiered Fallback Resolution**: When scaffolding future/unsupported stacks (e.g. `C++`, `Go`, `Rust`), the engine resolves templates using a safe cascade resolver chain: `registryKey` (`archetype:lang`) $\rightarrow$ `archetype` $\rightarrow$ `default` (A safe, technology-agnostic playbook covering general platform paths, standard safety checks, and generic verification scripts), preventing system crashes.

---

## 📝 7. Unified Prompt Architecture (UPA)

Scaffolded skills conform strictly to the **Unified Prompt Architecture (UPA)**, maximizing semantic density and prefix-caching efficiencies across frontier models:

```xml
<instructions>
  <role>Specialized agent persona/casing.</role>
  <context>Target system dependencies, DMCP lifecycle coordination tags.</context>
  <task_definition>Lint/compilation commands, active unit test TDD parameters.</task_definition>
  <output_format>Output delimiters and exit code standards.</output_format>
  <scope_constraints>
    - Sandboxed boundary constraints, credentials firewall rules.
    - Zero-Slop Consent Policy: Stop and ask user clarification on grey areas. No slop.
    - Loop Limit: Max 10 retries for polling loops/wait cycles.
  </scope_constraints>
</instructions>

<review_checks>
- Verification assertions.
</review_checks>
```

---

## 🛡️ 8. Core Security Guardrails

1. **Credentials Firewall**: Plain-text passwords, tokens, or keys are scanned and completely banned. All templates default securely to env variables.
2. **Directory Purge Shield**: The `--purge` command deletes physical directories *only* if they reside inside the global user configuration path (`~/.gemini/config/`). Local developer project workspaces are structurally protected from accidental deletions.
3. **Atomic Registry Writes**: Central database indexes are written to temporary files first (`.tmp`) and then renamed, eliminating registry corruption.
4. **Cross-Platform Resilient Verification**: Scaffolded script engines (`security_check.js` / `security_check.py`) feature platform-agnostic environment fallbacks (e.g. searching Node `os.platform()` paths or executing `python3` $\rightarrow$ `python` $\rightarrow$ `py -3` fallback checks on Windows) to prevent environment execution crashes.

---

## ⚡ 9. Performance, Zero-Slop & Optimization (Release 0.7.4)

High-performance, token-optimized updates designed to streamline agent execution and eliminate resource waste:

*   **Declarative Tool Permissions (RBAC):** Restricts agent tools to a strictly scoped least-privilege model (`toolGroups` array within agent blueprint mappings). Abstract tool groups map directly to client-native tools based on checked IDE profiles (`sfe-probe.json`), dynamically outputting native client instructions (e.g. `bash` vs `run_command`).
*   **Structured Planning Directories (SFE UPA):** Phase plans are compiled into a nested folder structure (`.planning/wave-{W}/plan-{P}/`) containing local `PLAN.md` and `RESEARCH.md` files. This isolates plan contexts, avoiding project root clutter and context rot.
*   **Path Virtualization:** Translates workspace absolute paths into portable `file:///{{WORKSPACE_ROOT}}/...` placeholders dynamically expanded by the client execution runner.
*   **Context Density Firewall:** Estimates file sizing prior to execution and triggers compile-time warnings if target files exceed a 2,000-line safety threshold, advising plan splitting.
*   **Automated Capability Mocks:** Scaffolds process execution interceptors and web mocks inside `evals/mocks/` automatically for QA and Developer agent profiles.
*   **Renamed Scaffold Folder**: Local scaffolding target directories now default to `./skillsets/` (was `./output/`), avoiding environment locking conflicts.
*   **Zero-Slop Consent Policy**: Generated playbook prompts strictly require agents to stop and clarify specifications in ambiguous areas instead of creating mock data/code.
*   **Loop Retry Limiters**: Quarantined loops to a hard maximum of **10 iterations** to prevent infinite token-draining runs.
*   **Telegraphic Casing**: Templates and instructions are written in dense, filler-free "Telegraphic Casing", yielding a **>50% reduction in playbook token size** and maximizing prefix-caching efficiency.
*   **Quiet Telemetry Logging**: Scaffold creation CLI outputs concise, single-line telemetry summaries, reducing terminal token footprint by **>80%**.
*   **Smart Registry Exclusions**: Recursively ignores compiled/coverage folders (`dist`, `build`, `skillsets`, `coverage`, `tool_tests`) from crawler indexes.
*   **Optimized NPM Package**: Direct exclusion of development and E2E mock suites from packaging via explicit `"files"` configuration inside `package.json`.
