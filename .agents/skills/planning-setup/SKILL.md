---
name: planning-setup
description: Sets up planning-with-files infrastructure for complex projects. Creates task_plan.md, findings.md, progress.md, a reusable planning-rules.md, and a snippet for the project's agent instructions file or files. Use when starting work that will span many tool calls, multiple sessions, or several implementation phases.
---

# Planning Setup

I scaffold persistent planning files for complex work:

- Three planning files (task_plan.md, findings.md, progress.md)
- A planning rules document the project can reference
- A snippet for the repo's agent instructions file or files

This skill is written to stay portable across Codex, Claude Code, and OpenCode. Prefer capability-based behavior over product-specific commands or file names.

## When To Use This

- Use this skill when the work needs durable context across restarts, handoffs, or long multi-step implementation.
- For short single-session tasks, prefer the agent's built-in planner or task list if one exists.
- If the repo already has planning files, update them instead of creating duplicates.

## Setup Intake

Collect setup inputs with structured choice prompts when the client supports them. If it does not, ask concise inline questions using the exact defaults and options below.

Ask for:

1. **Project name**: Free text.
2. **Goal**: One sentence describing the outcome.
3. **Phase strategy**:
   - **Suggest phases from the goal (Recommended)**: Fastest start, good when the user has not preplanned.
   - **User provides phases**: Best when the workflow is already known.
   - **Hybrid**: Agent drafts phases, user edits.
4. **Key questions**: 3-5 free-text questions. Offer to draft them from the goal if the user does not have them.
5. **Constraints**: Free text for non-negotiables, deadlines, tooling, or approval limits.
6. **Planning file location**:
   - **`planning/` (Recommended)**: Keeps the root clean and is easy to discover.
   - **Project root**: Fine for small repos.
   - **`docs/planning/`**: Best when project docs already live under `docs/`.
7. **Instruction file target**:
   - **Existing `AGENTS.md` and `CLAUDE.md` (Recommended if both exist)**: Keep both standards aligned by applying the same planning section to both files.
   - **Existing `AGENTS.md` only**: Most portable default when only one shared instructions file exists.
   - **Existing product-native instruction file only**: Use when the repo relies on `CLAUDE.md` or another established file and no shared file exists.
   - **Create new `AGENTS.md`**: Use when no instruction file exists yet.
8. **UI Standard (Mandatory)**:
   - **Clean & Compact (ViewMarket Monochrome Layer System)**: Mandatory for all ViewMarket projects.
   - **Planning files plus built-in task tracking when available (Recommended)**: Best for phase plus action-item visibility.
   - **Planning files only**: Use when the client has no task tracker or the user wants everything in Markdown.
9. **Rules placement**:
   - **Inside the planning directory as `planning-rules.md` (Recommended)**: Portable across clients.
   - **Existing local rules directory**: Use only if the repo already has a client-specific rules setup.

If the user does not care, choose the recommended option and state the assumption. If both `AGENTS.md` and `CLAUDE.md` already exist, update both unless the user asks for one canonical file only.

## What Gets Created

### Planning Files (Customized from Templates)

**task_plan.md** - Phase tracking, decisions, errors

- Goal and current phase
- Phase checklist with status
- Key questions to answer
- Decisions made table
- Errors encountered table

**findings.md** - Research discoveries, visual findings

- Requirements section
- Research findings
- Technical decisions table
- Issues encountered
- Visual/browser findings (with 2-Action Rule reminder)

**progress.md** - Session log, test results

- Session-by-session log format
- Test results table
- Error log
- 5-Question Reboot Check

### Agent Instruction Update

Create or append a planning methodology section from [templates/agent-instructions-additions.md](templates/agent-instructions-additions.md):

- High-level overview
- When to use planning-with-files
- References to the planning files and rules document
- Apply the same section to every selected instruction file so guidance stays in sync

### Planning Rules

Create a reusable rules document from [templates/planning-rules.md](templates/planning-rules.md):

- **Create plan first** - For complex tasks requiring >5 tool calls
- **2-Action Rule** - Save findings after browser/search ops
- **Read before decide** - Refresh goals before major decisions
- **Log all errors** - Track and mutate approach

## Workflow

After gathering answers or applying defaults:

1. Create the planning directory if needed
2. Generate customized task_plan.md with your goal, phases, and questions
3. Generate findings.md with initial structure
4. Generate progress.md with session log template
5. Generate planning-rules.md in the chosen location
6. Update the chosen instruction file or files with the planning methodology snippet
7. Summarize what was created, where it lives, which instruction files were updated, and which defaults were assumed

## Integration With Built-In Task Tracking

Planning-with-files can work alongside any built-in task tracker:

- **task_plan.md** tracks project phases (high-level)
- The task tracker handles individual action items within each phase

This hybrid approach gives you:

- Big-picture phase tracking in files
- Detailed task management in the client, when available
- Full context preserved across sessions

## After Setup

Once setup is complete, see [references/usage-guide.md](references/usage-guide.md) for:

- Daily workflow
- When to update each file
- The 5-Question Reboot Test
- Working with the 4 core rules

For the principles behind this system, see [references/manus-principles.md](references/manus-principles.md).

## Templates

All templates are linked directly from this file and customized during setup:

- [templates/task_plan.md](templates/task_plan.md) (Includes ViewMarket UI Standard: Clean & Compact)
- [templates/findings.md](templates/findings.md)
- [templates/progress.md](templates/progress.md)
- [templates/agent-instructions-additions.md](templates/agent-instructions-additions.md)
- [templates/planning-rules.md](templates/planning-rules.md)
