# Senfide Engine (`sfe`)

> Premium, zero-dependency security-first scaffolder for the Senfide Engine. Converts natural language developer intents into production-ready, isolated Skills, Agent Hooks, standalone Agent Profiles, and Coordinated Skill Systems.

> [!WARNING]
> **Active Development (Alpha Status)**: This repository represents an early version under active, rapid development. Architectural specifications, templates, CLI flags, and coordinate playbooks are subject to major breaking changes in future releases.

## 💡 What is the `Senfide Engine`?

**Senfide Engine (`sfe`)** is a professional-grade, zero-dependency, security-first command-line engine designed to automate the scaffolding and lifecycle management of isolated **AI Agent Skills, Hook Rules, Standalone Agent Profiles, and Coordinated Agent Systems** in localized developer workspaces.

Rather than writing unstructured playbooks that lead to "AI slop" or context contamination, `sfe` programmatically structures your agent environments with strict execution boundaries, stack-specific telemetry indices, and automated validation guardrails.

---

## 🚀 1. Installation & 3-Step Onboarding Tutorial

### Installation

Install the generator globally directly from GitHub:
```bash
npm install -g github:Danny0821/Senfide-Engine#master
```
> [!NOTE]
> This command automatically triggers a `postinstall` synchronization, linking `/sfe-gen`, `/sfe-interview`, and `/sfe-blueprint` native slash commands directly into your AI Agent chat environment configuration directories.

### 3-Step Quickstart Onboarding

Once installed, follow these three steps to bootstrap and verify an agentic team workspace:

1.  **Initialize Project & Onboard**:
    Run the interactive onboarding interview to design your agent system:
    ```bash
    # Open your agent interface and type the slash command:
    /sfe-interview
    ```
    Alternatively, design a coordinated system from a template:
    ```bash
    /sfe-blueprint
    ```
    This guides you through a concise, jargon-free interview about your tech stack and team roles, outputting a compiled `scratch/blueprint.json` mapping your team structure.

2.  **Scaffold the Team Skills**:
    Compile the blueprint JSON into active workspace code and playbooks:
    ```bash
    sfe --blueprint scratch/blueprint.json
    ```
    To scaffold a single, standalone skill programmatically, you can also use `/sfe-gen` or call the command line directly:
    ```bash
    # Scaffold a single, standalone skill
    /sfe-gen
    ```

3.  **Run & Verify the Environment**:
    Verify that your workspace executes and compiles cleanly:
    ```bash
    # Run the full test and verification pipeline
    npm run test
    ```

---

## 🛠️ 2. Core Functional Pillars

The engine's capabilities are built upon three core functional pillars:

### A. Scaffolding & Compilation
*   Compiles declarative blueprints (`blueprint.json`) into active files, directories, playbooks, and verification script files.
*   Auto-detects host machine runtimes (Node.js/Python) to bootstrap precise, shebang-hardened execution check scripts (`security_check.js` / `security_check.py`).

### B. Registry Discovery & Crawling
*   Natively indexes and tracks all active skills globally across your projects in a central catalog (`senfide_index.json`).
*   Dynamic command flags allow fuzzy searching (`--search`), registering (`--scan`), and unregistering (`--remove`) skills seamlessly.

### C. Multi-Agent Coordination (DMCP)
*   Integrates the **Dual-Mode Coordination Protocol (DMCP)** inside XML playbooks.
*   Enables agent systems to self-organize or gracefully yield execution when prerequisite design specs or database schemas are missing (greenfield safety).

---

## 👥 3. The 6 DevTeam Archetypes & Validation Gating

Playbooks are partitioned into **6 specialized organizational profiles** to prevent cross-stack context contamination:

| Archetype Profile | Core Responsibility | Key Deliverables | Tech Stack Limits |
| :--- | :--- | :--- | :--- |
| **`pm`** (Product Manager) | Roadmaps & Scrum priority backlog | `ROADMAP.md`, `BACKLOG.md` | Zero application code. |
| **`architect`** (Designer) | normalized schemas & UX wireframes | `docs/architecture/schema.sql`, `wireframes.md` | Zero application code. |
| **`devops`** (Infrastructure) | virtualization, CI/CD pipeline scripts | `Dockerfile`, `docker-compose.yml`, GitHub actions | Zero business logic. |
| **`developer`** (Creator) | Compiler standard coding, unit TDD | C#, C++, Rust, Node runtime source codes, `tests/` | Native compilation. |
| **`qa`** (Tester) | E2E automation tests, mock fixtures | E2E and integration tests in `tests/` | Zero developer bootstrap. |
| **`auditor`** (Security) | Threat models, OWASP security scans | Semgrep scanners rules, threat logs | Zero wireframe designs. |

### Validation Gating (Quality & Security Firewall)
To ensure code quality and safety before signing off on developer tasks, a hard gating flow is enforced:
1.  **Developer Gate**: The `developer` playbook executes code, but is structurally blocked from completing tasks until both the `"qa"` and `"auditor"` approval status keys are set to `true` inside `local-workspace/approval.json`.
2.  **QA Sign-off**: The `qa` playbook runs tests and writes `"qa": true` to `approval.json` upon successful E2E validation.
3.  **Auditor Sign-off**: The `auditor` playbook runs static checks and writes `"auditor": true` to `approval.json` upon successful security scans.

---

## 🤖 4. Agentic Mode & Autolearner Protocol

`sfe` is designed to be parsed and executed programmatically by AI coding assistants.

### Unified Prompt Architecture (UPA)
Every play matches UPA rules to maximize semantic density and prefix-caching:
*   **XML Tags**: All instruction parameters, roles, targets, and constraints are structured within clean XML tags (e.g. `<instructions>`, `<role>`, `<scope_constraints>`).
*   **Zero-Slop Consent Policy**: Prompts strictly forbid agents from creating fictitious placeholders or resume slop. Agents must pause and ask clarifying questions on ambiguity.
*   **Loop Retry Limiters**: Quarantines loops to a hard maximum of **10 iterations** for polling or wait tasks to avoid runaway token charges.

### The Autolearner Protocol (Self-Improving Telemetry)
*   **Regressions Prevention**: Before any write/compile, the agent reads `lessons_index.md` (Telemetry Index) and `playbook.md` (Telemetry Playbook) in the skill folder to check historical bug records.
*   **Dynamic Learning**: If execution fails, the agent appends details of the failure and Tested Code Workarounds to the playbook, improving system intelligence automatically.

---

## ⚙️ 5. CLI Command & Parameters Reference

```bash
# List all globally cataloged skills
sfe --list

# Fuzzy search registry index by keyword or tag
sfe --search <term>

# Recursively crawl and index skills in a folder
sfe --scan <directory-path>

# Scaffold with global-index registry bypass
sfe --local-only

# Unregister a skill from index
sfe --remove <skill-name>

# Unregister and purge configured files from disk (global config folder only)
sfe --remove <skill-name> --purge

# Scaffold a coordinated agent team from a JSON blueprint
sfe --blueprint <blueprint-json-path>

# Force overwrite existing folders during blueprint scaffolding
sfe --blueprint <blueprint-json-path> --force
```

---

## 🛡️ 6. Core Security Guardrails

1.  **Credentials Firewall**: Plain-text passwords, tokens, or keys are scanned and completely banned. All templates default securely to env variables.
2.  **Directory Purge Shield**: The `--purge` command deletes physical directories *only* if they reside inside the global user configuration path (`~/.gemini/config/`). Local developer project workspaces are structurally protected from accidental deletions.
3.  **Atomic Registry Writes**: Central database indexes are written to temporary files first (`.tmp`) and then renamed, eliminating registry corruption.
4.  **Cross-Platform Resilient Verification**: Scaffolded script engines (`security_check.js` / `security_check.py`) feature platform-agnostic environment fallbacks (e.g. searching Node `os.platform()` paths or executing `python3` $\rightarrow$ `python` $\rightarrow$ `py -3` fallback checks on Windows) to prevent environment execution crashes.

---

## ⚡ 7. Performance & Token Optimization

*   **Declarative Tool Permissions (RBAC):** Restricts agent tools to a strictly scoped least-privilege model (`toolGroups` array within agent blueprint mappings). Abstract tool groups map directly to client-native tools based on checked IDE profiles (`sfe-probe.json`), dynamically outputting native client instructions (e.g. `bash` vs `run_command`).
*   **Structured Planning Directories (SFE UPA):** Phase plans are compiled into a nested folder structure (`.planning/wave-{W}/plan-{P}/`) containing local `PLAN.md` and `RESEARCH.md` files. This isolates plan contexts, avoiding project root clutter and context rot.
*   **Path Virtualization**: Translates workspace absolute paths into portable `file:///{{WORKSPACE_ROOT}}/...` placeholders.
*   **Context Density Firewall**: Triggers warnings if target files exceed a 2,000-line safety threshold, advising plan splitting.
*   **Telegraphic Casing**: Prompt templates use dense, filler-free Telegraphic Casing to yield a **>50% reduction in playbook token size** and maximize prefix-caching efficiency.
*   **Quiet Telemetry Logging**: CLI outputs concise, single-line telemetry summaries, reducing terminal token footprint by **>80%**.
*   **Smart Registry Exclusions**: Excludes compiled/coverage folders (`dist`, `build`, `skillsets`, `coverage`, `tool_tests`) from crawls.
*   **Optimized NPM Package**: Direct exclusion of development and E2E mock suites from packaging via explicit `"files"` configuration inside `package.json`.

