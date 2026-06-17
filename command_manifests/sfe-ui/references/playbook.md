# playbook.md — sfe-ui Playbook

> UI/UX Advisor conversational knowledge base and layout telemetry.

---

## [PREVIEW_LOCK_01] Concurrent UI preview updates collide on disk write access
- **Issue**: Attempting to write parallel UI layout mockups results in write collisions or missing style nodes.
- **Cause**: Spawning multiple parallel tasks modifying `local-workspace/sfe-mock-preview.html` without sequence locks.
- **Fix**: The agent must execute UI updates sequentially or use single atomic file merges.
