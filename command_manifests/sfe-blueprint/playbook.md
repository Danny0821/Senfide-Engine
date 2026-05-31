# playbook.md — Agentic Interviewer Playbook

> Conversational onboarding and blueprint synthesis knowledge base.

---

## [INTERVIEW_COLLISION_01] Overwrite conflicts on duplicate scaffolding runs
- **Issue**: Executing the scaffolding engine fails if the target directory already exists.
- **Cause**: Overwrite Protection (Safety Protocol) aborts scaffolding with Exit Code 1.
- **Fix**: The agent must explicitly check if the directory exists and ask the user for permission to overwrite it. If yes, it executes with `--force` flag. If no, it must request a new project/directory name.
