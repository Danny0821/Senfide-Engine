# playbook.md — Senfide Importer Playbook

> Declarative team importer knowledge base and issue resolutions.

---

## [IMPORT_FORMAT_ERROR] Parsing errors on malformed YAML or Markdown structures
- **Issue**: The parser fails to convert user-supplied Markdown or YAML to blueprint.json due to syntax errors or typos.
- **Cause**: User formatting variations (e.g. indentation issues, missing keys, typos).
- **Fix**: The agent must not throw raw JSON/parse errors to the user. Instead, use high-reasoning parsing to repair missing or broken syntax structures, dynamically falling back to standard archetypes and assigning required default fields (like default `toolGroups` and archetypes) to make the blueprint.json fully valid before compiling.
