## Planning Methodology

This project uses **planning-with-files**, a file-based planning approach for complex multi-step work.

### Planning Context

Review these files at session start or before major decisions:

- `{{PLANNING_DIR}}/task_plan.md`
- `{{PLANNING_DIR}}/findings.md`
- `{{PLANNING_DIR}}/progress.md`
- `{{PLANNING_DIR}}/planning-rules.md`

### Overview

Planning-with-files uses three interconnected files as external memory:

- **task_plan.md** - Phase tracking, decisions, errors
- **findings.md** - Research discoveries, visual findings
- **progress.md** - Session log, test results

These files can work alongside the agent's built-in task tracker when available:

- Files track project phases and high-level progress
- The task tracker manages individual action items within each phase

### When to Use

Use planning-with-files for:

- Complex tasks requiring >5 tool calls
- Multi-session projects
- Work requiring research and exploration
- Projects with multiple phases or dependencies
- Situations where you need to maintain context across sessions

For simple, single-step tasks, use the agent's normal task workflow directly.

### Core Rules

See `{{PLANNING_DIR}}/planning-rules.md` for the operating rules:

- Create plan first (for complex tasks)
- 2-Action Rule (save findings after browser/search)
- Read before decide (refresh goals before major decisions)
- Log all errors (track and mutate approach)
