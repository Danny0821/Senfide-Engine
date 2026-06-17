# playbook.md — sfe-map-project Playbook

> Project Mapping conversational knowledge base and scanner telemetry.

---

## [MAP_LOCK_01] Directory scan blocks on large unexcluded lock files or node_modules
- **Issue**: Recursively scanning target directories containing heavy dependencies or temporary files blocks execution.
- **Cause**: Project crawler traversing into unexcluded directories (e.g. `node_modules` or `.git`).
- **Fix**: The scanner must strictly exclude dependency folders and lockfiles, traversing only user source trees.
