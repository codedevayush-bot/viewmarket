# Planning-with-Files Usage Guide

How to work with planning-with-files after setup is complete.

## Table of Contents

- [Daily Workflow](#daily-workflow)
- [When to Update Each File](#when-to-update-each-file)
- [The 5-Question Reboot Test](#the-5-question-reboot-test)
- [Integrating with Built-In Task Tracking](#integrating-with-built-in-task-tracking)
- [Common Patterns](#common-patterns)
- [Tips](#tips)
- [Troubleshooting](#troubleshooting)

---

## Daily Workflow

### Starting a Session

1. **Run the 5-Question Reboot Check** (in progress.md):
   - What's the goal? (task_plan.md)
   - What phase are we in? (task_plan.md Current Phase)
   - What have we learned? (findings.md)
   - What errors have we hit? (task_plan.md Errors, progress.md Error Log)
   - What's the next concrete action?

2. **Create task entries for the session**:

   ```
   Add one task entry per specific action item
   Mark tasks in progress as you work
   Mark tasks completed as you finish
   ```

3. **Begin work on the current phase**

### During a Session

**After browser/search operations** (2-Action Rule):

```
1. Navigate/search/screenshot (Action 1)
2. Save findings to findings.md (Action 2)
3. Continue working
```

**Before major decisions** (Read-before-decide):

```
1. Read task_plan.md (goal, decisions, errors)
2. Read findings.md (what you've learned)
3. Make decision
4. Log decision to task_plan.md Decisions table
```

**When errors occur** (Log all errors):

```
1. Log immediately to task_plan.md Errors table
2. Add context (what were you trying to do?)
3. When resolved, add resolution (don't delete the error)
4. If it changes approach, update Current Phase
```

**When completing tasks**:

```
Update the task entry to mark it completed
If findings emerged, add to findings.md
If phase completed, update task_plan.md phase checklist
```

### Ending a Session

1. **Log the session** to progress.md:
   - What was the focus?
   - What actions were taken?
   - What were the outcomes?
   - What are the next steps?

2. **Update task_plan.md Current Phase** if you moved forward

3. **Review open tasks**:
   ```
   Review the task list to see what's pending
   Clean up or update stale tasks
   ```

---

## When to Update Each File

### task_plan.md

**Update when**:

- Starting a new phase → Update Current Phase
- Making a key decision → Add to Decisions Made table
- Encountering an error → Add to Errors Encountered table
- Completing a phase → Mark with ✅ in phases checklist

**Don't update for**:

- Individual task progress (use the task tracker)
- Research findings (use findings.md)
- Session notes (use progress.md)

### findings.md

**Update when**:

- After browser exploration (2-Action Rule)
- After reading documentation
- After web searches
- Making technical decisions → Add to Technical Decisions table
- Finding issues → Add to Issues Encountered table
- Taking screenshots → Link in Visual/Browser Findings

**Don't update for**:

- Errors (those go in task_plan.md)
- Session summaries (use progress.md)
- Phase changes (use task_plan.md)

### progress.md

**Update when**:

- Starting a session → Session Log entry
- Ending a session → Complete session log
- Running tests → Add to Test Results table
- Errors occur → Add to Error Log table

**Don't update for**:

- Research findings (use findings.md)
- Decisions (use task_plan.md)
- Phase tracking (use task_plan.md)

---

## The 5-Question Reboot Test

Use this when:

- Starting a new session
- Resuming after a break
- Feeling stuck or lost
- Before making a major decision

### The Questions

1. **What's the goal?**
   - Read task_plan.md Goal section
   - Recite it in your reasoning

2. **What phase are we in?**
   - Read task_plan.md Current Phase
   - Check the phase checklist

3. **What have we learned?**
   - Read findings.md
   - Scan Research Findings and Technical Decisions

4. **What errors have we hit?**
   - Read task_plan.md Errors Encountered table
   - Read progress.md Error Log
   - Check resolutions and mutations

5. **What's the next concrete action?**
   - Based on current phase + findings + errors
   - Create a task entry if your client supports task tracking

### Why This Works

The 5-Question Reboot:

- Manipulates attention through recitation (Principle 4)
- Uses filesystem as external memory (Principle 3)
- Refreshes context without relying on KV-cache
- Takes ~30 seconds but saves hours of confused work

---

## Integrating with Built-In Task Tracking

Planning-with-files and task tools work together:

### Use task_plan.md for:

- **Project structure**: Phases and high-level organization
- **Key decisions**: Choices that affect the whole project
- **Errors that change approach**: When you need to pivot
- **Cross-session context**: What persists between sessions

### Use the task tracker for:

- **Specific action items**: Concrete things to do right now
- **Task dependencies**: What blocks what
- **Current work tracking**: What's in progress vs pending
- **Granular status**: Individual task completion

### Hybrid Example

```
task_plan.md shows:
  Phase 2: Implementation ⏳

Task list shows:
  1. [in_progress] Implement user auth endpoint
  2. [pending] Write integration tests for auth
  3. [pending] Update API documentation

You complete task 1:
  - Update the task entry → mark completed
  - findings.md → log technical decisions made during implementation
  - Continue to task 2

All tasks complete:
  - task_plan.md → Mark Phase 2 as ✅
  - task_plan.md → Update Current Phase to "Phase 3: Testing"
  - Create new task entries for Phase 3
```

---

## Common Patterns

### Pattern: Research Phase

```
1. Create task_plan.md with research phase
2. Create a task entry: "Research auth libraries"
3. Search/browse (Action 1)
4. Save findings to findings.md (Action 2)
5. Update the task entry: mark completed
6. Repeat for next research task
7. When research complete: Update task_plan.md phase
```

### Pattern: Implementation Phase

```
1. Read task_plan.md (refresh goal and decisions)
2. Read findings.md (what research discovered)
3. Create implementation task entries
4. Work on each task, mark in_progress/completed
5. Log decisions to task_plan.md as you make them
6. Log errors to task_plan.md as they occur
7. End session: Update progress.md with session log
```

### Pattern: Stuck/Debugging

```
1. Run 5-Question Reboot Check
2. Read task_plan.md Errors table (what have we tried?)
3. Read findings.md (what do we know?)
4. Identify what's missing
5. Create task entries to fill gaps
6. Proceed with new approach
7. Log the pivot to task_plan.md Decisions
```

---

## Tips

### Do:

- ✅ Update files as you go (don't batch at the end)
- ✅ Append to tables (mask, don't remove)
- ✅ Vary your documentation format (don't get few-shotted)
- ✅ Log errors immediately (keep wrong stuff in)
- ✅ Reread before major decisions (filesystem = memory)

### Don't:

- ❌ Edit past table entries (append instead)
- ❌ Delete errors (add resolutions)
- ❌ Skip the 2-Action Rule (you'll lose context)
- ❌ Make big decisions without rereading files
- ❌ Use the same rigid format for everything

---

## Troubleshooting

**"I keep forgetting to update files"**
→ Put `planning-rules.md` in the planning directory and reference it from the repo's agent instructions file. If both `AGENTS.md` and `CLAUDE.md` exist, keep the planning section in both.

**"The files are getting too long"**
→ That's okay! Append-only is the pattern. Long files mean rich history.

**"Should I track X in task_plan.md or the task tracker?"**
→ If it's a phase or major decision, task_plan.md. If it's a specific action item, use the task tracker.

**"I lost context between sessions"**
→ Run the 5-Question Reboot Check. That's exactly what it's for.

**"The templates feel rigid"**
→ They're starting points. Adapt the format to what you learn (Principle 6: Don't get few-shotted).

---
