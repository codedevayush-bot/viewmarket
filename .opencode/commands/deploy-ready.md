---
description: Prepare codebase for deployment (format, lint, build)
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

Run the full deployment-ready workflow:

## Step 1 — Format Code

Run the formatter:

!`npm run prettier 2>&1 || npx prettier --write . 2>&1`

If there are formatting issues, fix them automatically by re-running prettier until clean.

## Step 2 — Linting

Run the linter:

!`npm run lint 2>&1`

If any errors or warnings appear, identify the underlying code issues, fix them directly in the source files, and re-run the linter. Repeat this loop autonomously until the linter output is completely clean with zero errors and zero warnings.

## Step 3 — Production Build

Run the production build:

!`npm run build 2>&1`

If the build fails due to type errors, missing dependencies, or rendering issues:

1. Identify the exact error from the output above
2. Fix the root cause in the source code
3. Re-run `npm run build`

Repeat this loop autonomously until `npm run build` succeeds completely with zero errors.

After all three steps pass, provide a final summary of:

- Any files that were modified
- Issues that were found and fixed
- Confirmation that the codebase is deployment-ready
