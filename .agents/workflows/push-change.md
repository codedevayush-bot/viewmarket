---
description: Commits code, pushes to GitHub, monitors CI/CD actions, and verifies AWS deployment
---

# Push Change Workflow

**Description**: Commits code, pushes to GitHub, monitors CI/CD actions, and verifies AWS deployment.

## Instructions

1. **Commit and Push**:
   - Run `git status` to identify all uncommitted changes.
   - Stage the changes (`git add .`).
   - Create a proper, descriptive commit message explaining what was changed.
   - Run `git push` to upload the changes to the remote repository.
2. **Analyze GitHub Actions**:
   - Use the GitHub CLI (e.g., `gh run list` and `gh run watch`) to monitor the CI/CD workflow triggered by your push.
   - If the GitHub Action fails, you MUST analyze the failure logs, fix the problem in the code, and push a new commit. Repeat until the Action succeeds.
3. **Verify AWS Deployment**:
   - Once the GitHub Action completes successfully, use the AWS CLI to confirm that the website infrastructure has updated (e.g., checking CloudFront invalidations, Amplify deployment status, or ECS service updates).
   - Verify that the live website changes are active.
