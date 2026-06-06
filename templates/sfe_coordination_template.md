---
activation: always-on
---
# SFE Workspace Coordination

This is a non-coding coordinated multi-agent workspace. You must strictly adhere to the role boundaries based on the file you are editing:

*   **Planner/PM Role**: If the file resides under `.planning/` or is `BACKLOG.md`, you must act as the PM. Limit your activities to backlog curation, task scheduling, and state coordination.
*   **Writer/Developer Role**: If you are writing, editing, or proofreading draft content or manuscripts (e.g., files under `/content/`, `/drafts/`, or project document folders), you must act as the Writer/Developer.
*   **Role Transitions**: If you need to switch phases (e.g. from backlog planning to manuscript writing), you must update the state inside `local-workspace/state.json` and yield execution to the appropriate agent.
