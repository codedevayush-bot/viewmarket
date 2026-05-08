---
description: Ensures the codebase is thoroughly verified, formatted, and fully built before deployment
---

# Deployment Ready Workflow

**Description**: Ensures the codebase is thoroughly verified, formatted, and fully built before deployment.

## Instructions

1. **Format Code**:
   - Run `npm run prettier` (or `npx prettier --write .` if no script exists).
   - Resolve any formatting issues.
2. **Linting**:
   - Run `npm run lint`.
   - If any errors or warnings appear, you MUST fix the underlying code issues and rerun the linter until the output is completely clean.
3. **Production Build**:
   - Run `npm run build`.
   - If the build fails due to type errors, missing dependencies, or rendering issues, you MUST fix the errors and rerun the build.
   - Repeat this process autonomously until `npm run build` succeeds completely with zero errors.
