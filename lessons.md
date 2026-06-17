# lessons.md — Antigravity Generator Rules

## Rules
- **No Heavy Deps**: Keep scripts zero-dependency. Node `fs`, `path`, `readline` only. No heavy packages.
- **Caveman Markdown**: All docs/templates in telegraph-speak. No fluff. Cuts 70% tokens. Keep precise paths.
- **Firewall Code Quality**: JS/TS code MUST be high-quality. Full comments, robust types, complete error checking. Never caveman code.
- **Security Guardrails**: Always enforce sandbox, credentials safety, no plaintext keys, shell safety wrappers.
- **Release Documentation Firewall**: Every release version bump (e.g. 0.3.0 -> 0.3.1 -> 0.4.0) MANDATORILY requires updating `Senfide-documentation.md` to reflect all architectural changes, CLI flags, and schemas before closing.

## Lessons
- `lessons_index.md` & `playbook.md` key for self-improvement. Always scaffold them in child skills.
- Windows path vs Linux: Node `path.join` or `path.resolve` mandatory. Avoid raw slashes.
- Readline block: readline needs standard close cleanup. Keep streams clean.
- Unified Prompt Architecture (UPA): Use stable XML tags (`<role>`, `<context>`, `<scope_constraints>`) at top. Isolates rules. Future-proofs models. Elevates performance on both frontier and non-frontier models.
- Registry Test Isolation: Always assign `process.env.SENFIDE_TEST_DIR` at top of test scripts (e.g. `test_generator.js`, `verify_index_sandbox.js`) before importing scaffolding utilities. Prevents test functions polluting user's real global registry.
- Slash Commands Folder Alignment: Antigravity 2.0 requires global slash command manifests to be placed inside a structured subfolder containing a `SKILL.md` file (e.g., `~/.gemini/skills/{skill_name}/SKILL.md`) instead of flat files to trigger system-wide client discovery.
- Single-Trigger Directory Limit: The client parser only registers the first trigger declared in the UPA frontmatter of a folder's `SKILL.md`. Active triggers (e.g., `/interview` vs. `/grill-blueprint`) must have separate directory structures to coexist in autocomplete menus.
- Hidden Folder npm Packaging Constraints: Avoid storing active command templates inside hidden directories (like `.agent/skills/`) inside the npm package registry. Windows environments throw `lstat` unpack warning errors and directory lock contentions. Always relocate them to accessible top-level folders (such as `command_manifests/`).
- Loop Limit Safeguard: Restrict wait loops and status checks inside playbooks to a maximum of 10 retries to prevent infinite agent execution loops and token depletion.
- Zero-Slop Consent: Generated prompts must strictly require agents to stop and clarify specifications in ambiguous areas instead of generating fake placeholder content.
- Crawler Registry Exclusions: Exclude temporary, coverage, and build directories (`build`, `dist`, `skillsets`, `coverage`, `tool_tests`) from crawler indexes to prevent global catalog pollution.
- CLI Programmatic Simplification: Purging human-facing terminal wizards in favor of a silent, programmatic API (`--blueprint`) reduces codebase complexity (shredding `generate.js` code size by >40%) and delegates user UX entirely to high-reasoning conversational playbooks.
- YAML Frontmatter Double-Hydration: To prevent formatting conflicts between strict YAML list structures and markdown prose, use separate placeholders (`{{ALLOWED_SKILLS_YAML}}` and `{{ALLOWED_SKILLS_HUMAN}}`) inside the templates and map them individually during hydration.
- Model-Agnostic UPA Purification: Remove all hardcoded model attributes (like `recommended_model` or `- Model: ...` prompt contexts) from metadata and instruction templates to ensure playbooks are fully future-proof and model-agnostic.
- PowerShell Statement Separators: Windows PowerShell throws syntax parsing errors on double ampersands (`&&`). Command-line sequences targeting Windows hosts must strictly join statements using semicolons (`;`) or run as separate command executions.
- Safe Self-Cleaning Defaults vs Force Fallback: Scaffolding and compilation processes must perform a safe, self-cleaning incremental merge by default, dynamically purging orphaned agents and skills. Reserve the `--force` flag strictly as a fallback option for complete clean-slate purges.
- Language Alignment and Anti-Bloviating Tone Constraints: Instruct agent roles to dynamically detect and match the user's preferred language, and strictly forbid pleasantries, polite filler, or conversational bloviating in favor of high-density bullet points or minimal direct sentences.
- Interviewer Tone Manifest Purging: To completely eliminate conversational bloviating and pleasantries during onboarding, command manifests (such as sfe-interview and sfe-blueprint) must be strictly purged of soft tone descriptors (e.g., 'friendly', 'warm', 'enthusiastic') and bound to concise, direct, language-adaptive role instructions.
- Agnostic Workspace Path Isolation: Playbook commands and target path definitions inside global onboarding skills must strictly avoid references to internal package files (like `bin/cli.js` or `scripts/generate.js`) that are not present in empty user project folders. Execute commands via the globally registered `sfe` CLI executable instead of `node bin/cli.js` to completely prevent panic search loops and out-of-bounds directory crawling.
- Local Blueprint Isolation: The `blueprint.json` configuration file is purely local to the specific project being scaffolded (written to `scratch/blueprint.json`). Playbook scope constraints must explicitly declare this local boundary and forbid the agent from crawling hidden, global, or system paths (such as the global `.gemini` directory) in search of blueprints, references, or schemas.
- Global CLI Launcher Fallback: During npm global installs (`npm install -g`), postinstall scripts run inside a temporary cache folder that is later deleted. To prevent broken absolute paths to `cli_bin/cli.js`, write the target path to `sfe_cli.target` and configure launchers (`sfe.cmd`/`sfe.ps1`) to check path existence, falling back to `npx --no-install sfe` when invalid.
- Onboarding Abstract Project Translation: When user prompts describe non-coding, editorial, business, or creative tasks during /sfe-interview, the agent must avoid refusing or skipping team generation. Instead, dynamically translate the abstract roles onto SFE compiler-native archetypes (e.g., Planner -> pm, Writer -> developer, Proofreader -> auditor) and default environment stacks to compile a functional agentic workspace.
- Sandbox Tool Mounting & Pathing: Avoid using web-dependent package installers (like `winget`) inside Windows Sandbox (WSB) as they are missing from base VM images. Instead, mount host tool directories (e.g. `C:\Program Files\nodejs`) as read-only and register them directly to the sandbox environment `Path`.
- Test Workspace Directory Assertions: Unit tests generating output inside temporary folders must dynamically assert and recursively create directories (such as `scratch/`) before file write operations to avoid `ENOENT` errors on clean-slate unpacked packages.
- PowerShell Native Stream Redirection: Native Go CLI helper commands writing usage or help logs to stderr by default will raise PowerShell native command errors unless output streams are merged using stderr redirection (`2>&1`).
- Autolearner Telemetry Alignment Checkers: Integrates a cross-file synchronization checker (`verify_autolearner_integrity.js`) into the test harness to audit coordinate line mapping errors between `lessons_index.md` and `playbook.md`. Standardizes template coordinates to prevent code drift and allows coordinate-less one-liner index tags for token-efficient telemetry.
- Global Onboarding Design Specialists: Adds a `/sfe-ui` global slash command to trigger conversational UI/UX brainstorming sessions. Integrates sfe-ui into global installation and teardown suites. Directs the PM to invoke the ui_advisor subagent at any time to generate rapid interface previews directly to `local-workspace/sfe-mock-preview.html`.
- Project Mapping Directory Exclusions: Strictly exclude SFE-generated directories containing automation scripts and configuration files (`tool_scripts`, `agents`, `.agents`, `.planning`) from the codebase stack analyzer (`project_mapper.js`) to prevent false-positive coding stack classification (e.g., mapping prose/documentation workspaces as JavaScript).







