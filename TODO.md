# TODO.md — Future Milestones (Caveman Style)

> [!NOTE]
> Completed and future roadmap for Antigravity 2.0 Generator. Releases 0.2.0 through 0.4.2 are fully implemented and verified on the master branch.

---

## 🚀 Release 0.2.0: Installation UX & Agent Guiding [COMPLETED]

### Goal
Make generator installation fast, secure, and friendly for both humans (even non-technical users) and AI agents.

### Tasks
- `[x]` **NPX Scaffolder Execution**:
  - Enable running generator directly via `npx` from github:
    ```bash
    npx -y github:JuliusBrussee/antigravity-generator --help
    ```
- `[x]` **PowerShell / Bash One-Liners**:
  - Support one-line installers (e.g. `irm` / `curl` scripts) to download and install globally in 10 seconds.
- `[x]` **Agent Onboarding Manifest**:
  - Write explicit rules in `SKILL.md`/`generate.md` for AI agents.
  - If user pastes github repo link -> agent must intercept, recognize generator, and guide user step-by-step through the installation process.
- `[x]` **Non-Technical User Playbook**:
  - Write simple, jargon-free instructions for less technical users (e.g. explaining "npm", "terminal", "powershell" with gentle definitions).

---

## 📦 Release 0.3.0: Centralized Skill Index & Reuse [COMPLETED]

### Goal
Prevent token waste and coding duplication. Allow agents to discover and reuse existing local skills across different project folders.

### Tasks
- `[x]` **Central Index Database**:
  - Create a global catalog file (`C:\Users\Daniel\.gemini\config\skills_index.json`).
  - Track all generated local skills, folders, triggers, and capabilities in one spot.
- `[x]` **Auto-Register on Scaffolding**:
  - When CLI `generate.js` creates a local skill, automatically append its metadata and absolute path to the global index.
- `[x]` **Discovery Tooling**:
  - Build a search/discovery command (e.g. `/generate-search [term]` or `/skills-list`).
  - Allows AI agents to read the index first, check if a python auditor already exists locally, and load/import it instead of writing a new one.

---

## 🆕 Release 0.4.0: Interactive Agentic Skill Creation [COMPLETED]

### Goal
Introduce guided quick-vs-advanced modes with custom requirements, triggers, tasks, reviews, and hardened shebang multi-language verification engines (Node.js & Python).

### Tasks
- `[x]` **Quick vs. Advanced Mode Selection CLI**: Choose quick scaffolding (standard templates) or advanced customization inside the interactive prompt loop.
- `[x]` **Hardened Verification Stack**: Node.js ESM verifier (`security_check.js`) and cross-platform shebang-hardened Python verifier (`security_check.py`) with silent path searches.
- `[x]` **Advanced Custom Metadata Frontmatter**: Seamlessly capture custom triggers, tasks, reviews, and dependencies from user CLI input and hydrate the playbook templates.

---

## 🔒 Release 0.4.1: Scaffolder Hardening & UPA Future-Proofing [COMPLETED]

### Goal
Implement dynamic runtime environment baselining, clean semantic description routers, and active test-driven developer playbooks targeting host capabilities.

### Tasks
- `[x]` **Dynamic Host Baselining**: Probes the host system's running engine versions (`process.versions.node` and dynamic CLI checking for Python) during scaffolding, writing tailored requirements.
- `[x]` **Active Test-Driven Development (TDD) Playbooks**: Replaces comment-based inspection with active test executions inside generated playbooks (JUnit, Jest, Pytest, Catch2).
- `[x]` **Clean Semantic Descriptions**: Separates prompt-routing trigger parameters from descriptions in frontmatter to prevent router confusion.

---

## 👥 Release 0.4.2: Dual-Mode Coordination Protocol (DMCP) & 6 DevTeam Archetypes [COMPLETED]

### Goal
Eradicate technology cross-mixing ("AI slop") and Greenfield empty directory conflicts through structural role isolation and self-coordinating playbooks.

### Tasks
- `[x]` **6 DevTeam Archetype Profiles**: Implemented dedicated registries (`pm`, `architect`, `devops`, `developer`, `qa`, `auditor`) with perfectly decoupled tasks, review checklists, and environment configurations.
- `[x]` **Dynamic Archetype Classifier**: Automatically detects the skill's archetype based on semantic name/description keywords (`detectArchetype`).
- `[x]` **Dual-Mode Coordination Protocol (DMCP)**: Empowers skills to self-coordinate in empty directory contexts, yielding execution to prerequisite blueprint skills (e.g. Developer yields to Architect specs) in the absence of a central orchestrator.
- `[x]` **E2E Sandbox Multi-Archetype Verification**: Embedded Step 9 in sandbox tests asserting strict playbook separation and DMCP choreographed fallback rules.

---

## 📂 Release 0.4.3: Dynamic Telemetry Registries & Safe Fallback Cascade [COMPLETED]

### Goal
Eradicate technology cross-mixing ("AI slop") in telemetry files and optimize prompt token density under UPA.

### Tasks
- `[x]` **Dynamic Telemetry Registry**: Map specialized templates (`developer:js`, `developer:py`, `architect`, etc.) platform-compatibly, isolating environment guidelines.
- `[x]` **Three-Tiered Fallback Resolution Chain**: Cascade searches (`targetStack` -> `archetype` -> `default`) to guarantee 100% compiler stability on future technology additions.
- `[x]` **Prompt Token Density Optimization**: Delete redundant playbooks XML blocks to conserve context window allocations.

---

## 🛡️ Release 0.5.0: Defense-in-Depth Security & Layer 3 CI/CD Workflows [COMPLETED]

### Goal
Implement premium multi-layer security guardrails and automated remote pipeline scans to block hardcoded plaintext keys.

### Tasks
- `[x]` **Hardened Client Verification**: Configure non-zero exit codes (`process.exit(1)`) on JS security violations, and safe ASCII logging status tags in Python.
- `[x]` **Layer 3 CI/CD GitHub Actions Scanners**: Automatically scaffold pre-configured `.github/workflows/security_scan.yml` pipelines tailored to Node/Python targets to block local pre-commit hook bypasses.
- `[x]` **CLI Options Parser Abstraction**: Abstract arguments routing into an isolated `parseCliArgs()` helper to easily accommodate administrative flag expansions.

---

## 🤖 Release 0.6.0: Agentic Interviewing & Conversational Scaffolding [COMPLETED]

### Goal
Lower the barrier of entry for beginners and less technical users by replacing rigid technical CLI prompts with a dynamic, conversational agent-mediated interview.

### Tasks
- `[x]` **The Agentic Interview Protocol (`/interview`):** Design an agentic workflow where the LLM agent interviews the user using simple product/business questions rather than technical variables (e.g. scoping project scale, tech familiarity, and operational needs).
- `[x]` **Algorithmic Blueprint Synthesizer:** Empower the agent to programmatically analyze interview dialog, determine necessary DevTeam archetypes, and auto-generate a coordinated system architecture blueprint.
- `[x]` **Non-Interactive Scaffolding API:** Expose a non-interactive CLI scaffolding hook in the generator engine, allowing the agent to compile the synthesized blueprint and write the folder structure autonomously without requiring manual user terminal inputs.

---

## ⚡ Release 0.7.0: Compact Multi-Skill Agents & Blueprint Upgrades [COMPLETED]

### Goal
Natively support grouping multiple distinct skills under a single, highly capable agent profile instead of defaulting to a verbose 1-to-1 setup, significantly streamlining coordinated workspaces.

### Tasks
- `[x]` **Declarative `agents` Blueprint Schema:** Add a custom `agents` definition block to the blueprint JSON format mapping agent names to multiple `allowedSkills` (e.g. `["python-ui", "python-ai"]`).
- `[x]` **Multi-Skill Agent Scaffolder:** Upgrade `scaffoldFromBlueprint` to parse this block and write corresponding whitelisted `AGENT.md` profiles and the orchestrating `SYSTEM.md` file.
- `[x]` **Dynamic Density & Cohesive Grouping Rules:** Upgraded both `/interview` and `/grill-blueprint` playbooks to completely automate agent-skill layouts using Language Cohesion, Functional Boundaries, and a Strict Grouping Firewall, eliminating the specialized-vs-compact team questions.

---

## 👥 Release 0.7.1: Agentic-Native Orchestration & Multi-Archetype Gating [IN PROGRESS]

### Goal
Replace traditional, human-centric management overhead with an Agentic-Native PM validation pipeline (GIST hypothesis steps, token budgeting, and topological interface gating) and map the 5 remaining archetypes to native agentic validation standards.

### Tasks
- `[ ]` **GIST-Driven Agentic Validation (`pm`):** Force PM blueprints to output `ROADMAP.md` as milestone flows and `BACKLOG.md` as hypothesis-validation steps instead of flat task outputs.
- `[ ]` **Programmatic Token Budgeting:** Implement strict execution loop limit controls in playbook prompts to act as quantitative agent "appetites".
- `[ ]` **Topological Interface Gating:** Force dev archetypes to compile and assert against locked DDL/API schemas output by the `architect` prior to writing business logic.
- `[ ]` **5-Archetype Agentic-Native Specs:** Formulate and document standard playbook triggers, validations, and bounds for Architect, DevOps, Developer, QA, and Auditor.

### Architecture Consensus
* **Hybrid Approach Locked:** The core engine codebase structurally hardcodes and enforces all safety boundaries (e.g., standard `sfe-mock.env` / `sfe-mock.example` credentials firewalls, absolute directory layouts, and UPA XML prompt wrappers), while the LLM blueprint dynamically hydrates specific tech-stack files, types, compile validators, and chaos test harnesses.

---

## 🤖 Release 0.7.2: PM Orchestrator & Hub-and-Spoke Execution

### Goal
Mitigate context window decay, attention degradation, and token bloat by transitioning the PM from a flat-context manager into an autonomous central routing Hub that spawns, manages, and prunes isolated worker subagents.

### Tasks
- `[ ]` **Dynamic Subagent Spawning:** Configure the PM to spawn targeted Developer, DevOps, and QA subagents programmatically with strict workspace isolation.
- `[ ]` **Telemetry Context Pruning:** Implement aggressive context reduction rules where the PM purges raw terminal outputs and aggregates only high-density, Caveman-styled outcomes.
- `[ ]` **Token-Appetite Guardrails:** Set strict API call limits per subagent invocation to prevent infinite diagnostic feedback loops.

---

## 🎨 Release 0.7.3: Ecosystem Expansion & Specialist Agents

### Goal
Expand the Senfide Engine ecosystem with specialized, stack-constrained visualizers, deep sandbox crawlers, and isolated package migrators.

### Tasks
- `[ ]` **UI/UX Stack Previewer (`ui-advisor`):** Scaffold a visualizer agent that reads stack constraints and generates mock layouts restricted to that stack's syntax (e.g. WPF XAML vs. JSX Tailwind) and compiles a local `sfe-mock-preview.html` file.
- `[ ]` **External Knowledge Crawlers (`researcher`):** Establish a researcher agent that crawls external documentations and local legacy codebases, outputting a high-density, AST-accurate "API Cheat-Sheet" to inject directly into developer contexts.
- `[ ]` **Isolated Package Migrator (`migrator`):** Introduce a dependency updater that scans package locks, executes security audits, resolves version conflicts, and refactors imports in isolation.



