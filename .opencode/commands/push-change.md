---
description: Commit, push, monitor CI/CD, and verify AWS deployment
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

Run the full push and deployment workflow:

## Step 1 — Commit and Push

Check uncommitted changes:

!`git status 2>&1`

Stage all changes:

!`git add . 2>&1`

Commit with a descriptive message:

!`git commit -m "chore: deploy latest changes" 2>&1`

If the commit fails (e.g., empty commit or merge conflicts), fix the issue and retry.

Push to the remote repository:

!`git push 2>&1`

If the push fails (e.g., rejected due to remote changes), pull with rebase (`git pull --rebase`), resolve any conflicts, and push again. Repeat until the push succeeds.

## Step 2 — Monitor GitHub Actions

List recent workflow runs:

!`gh run list --limit 5 --repo $(git remote get-url origin | sed 's/.*\///' | sed 's/\.git//') 2>&1`

Watch the latest run:

!`gh run watch --repo $(git remote get-url origin | sed 's/.*\///' | sed 's/\.git//') 2>&1`

If the GitHub Action fails:

1. Identify the failure from the logs above
2. Fix the underlying code or configuration issue
3. Commit and push a new fix
4. Re-monitor the new workflow run

Repeat until the GitHub Action completes successfully with all jobs passing.

## Step 3 — Verify AWS Deployment

Once CI/CD passes, verify the deployment:

Check CloudFront distributions for recent invalidations:

!`aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status,LastModifiedTime]' --output table 2>&1`

Check Amplify app deployments (if applicable):

!`aws amplify list-apps --query 'apps[*].[appId,name,repository,platform,status]' --output table 2>&1`

Check ECS service status (if applicable):

!`aws ecs list-services --cluster default --query 'serviceArns' --output text 2>&1`

Verify the live website is serving updated content. If any AWS resource shows an error or stale state, investigate and resolve the issue.

After all three steps pass, provide a final summary of:

- The commit message and SHA pushed
- GitHub Actions run URL and status
- AWS deployment verification results
- Confirmation that the deployment is live and healthy
