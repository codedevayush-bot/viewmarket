# AWS Deployment Resources - ViewMarket

This document provides a comprehensive list of all AWS resources and configurations currently used for the ViewMarket production environment in the `us-east-1` region (Account ID: `145023138936`).

## 1. Compute (ECS Fargate)

| Resource                   | Name / Detail                                             | Description                                                 |
| :------------------------- | :-------------------------------------------------------- | :---------------------------------------------------------- |
| **ECS Cluster**            | `viewmarket-prod-cluster`                                 | Managed cluster for containerized services.                 |
| **ECS Service**            | `viewmarket-prod-service`                                 | Fargate service running the application.                    |
| **Task Definition Family** | `viewmarket-prod`                                         | Defines container images, resources, and environment.       |
| **Auto Scaling Target**    | `service/viewmarket-prod-cluster/viewmarket-prod-service` | Scalable target for the ECS service.                        |
| **Auto Scaling Policy**    | `viewmarket-prod-cpu-scaling`                             | Target Tracking (60% Avg CPU Utilization). Min: 1, Max: 10. |

### Commands to verify:

```bash
aws ecs describe-services --cluster viewmarket-prod-cluster --services viewmarket-prod-service
aws application-autoscaling describe-scalable-targets --service-namespace ecs
aws application-autoscaling describe-scaling-policies --service-namespace ecs
```

## 2. Networking & Load Balancing

| Resource                | Detail                                                       | Description                                         |
| :---------------------- | :----------------------------------------------------------- | :-------------------------------------------------- |
| **VPC**                 | `vpc-0ac12c05fc78a04c8`                                      | Default VPC (172.31.0.0/16).                        |
| **Subnets**             | `subnet-062cbe1b860e549f6`, `subnet-0c455abff820dcb70`       | Public subnets in us-east-1.                        |
| **Load Balancer (ALB)** | `viewmarket-prod-alb`                                        | Application Load Balancer for traffic distribution. |
| **ALB DNS Name**        | `viewmarket-prod-alb-1320071219.us-east-1.elb.amazonaws.com` | Public endpoint for the ALB.                        |
| **Target Group**        | `viewmarket-prod-tg`                                         | Port 3000 (HTTP), Health check at `/api/health`.    |
| **Listeners**           | 80 (HTTP) -> 443 Redirect; 443 (HTTPS) -> Forward to TG.     | Traffic handling rules.                             |

### Commands to verify:

```bash
aws elbv2 describe-load-balancers --names viewmarket-prod-alb
aws elbv2 describe-target-groups --names viewmarket-prod-tg
aws elbv2 describe-listeners --load-balancer-arn [ALB_ARN]
```

## 3. Storage & Registry

| Resource           | Name                            | Description                                           |
| :----------------- | :------------------------------ | :---------------------------------------------------- |
| **ECR Repository** | `viewmarket-prod`               | Private Docker registry for application images.       |
| **S3 Bucket**      | `viewmarket-ticket-attachments` | Storage for user-uploaded support ticket attachments. |

### Commands to verify:

```bash
aws ecr describe-repositories --repository-names viewmarket-prod
aws s3 ls s3://viewmarket-ticket-attachments
```

## 4. Domain & Security

| Resource            | Detail                                       | Description                         |
| :------------------ | :------------------------------------------- | :---------------------------------- |
| **Route 53 Zone**   | `viewmarket.in` (ID: `Z0144903129E0MX7EAND`) | Managed hosted zone for the domain. |
| **ACM Certificate** | `*.viewmarket.in` / `viewmarket.in`          | SSL/TLS certificate for HTTPS.      |

### Commands to verify:

```bash
aws route53 list-resource-record-sets --hosted-zone-id Z0144903129E0MX7EAND
aws acm describe-certificate --certificate-arn [CERT_ARN]
```

## 5. Configuration (SSM Parameters)

The following parameters are stored in AWS Systems Manager (SSM) under the path `/viewmarket/prod/`:

| Parameter Name                  | Type         | Purpose                                  |
| :------------------------------ | :----------- | :--------------------------------------- |
| `APP_BASE_URL`                  | String       | Application public URL.                  |
| `AUTH_SECRET`                   | SecureString | NextAuth secret.                         |
| `DATABASE_URL`                  | SecureString | Neon Postgres connection string.         |
| `NEON_PROJECT_ID`               | String       | External DB project identifier.          |
| `STABLE_TASK_DEFINITION`        | String       | ARN of the last known stable deployment. |
| `AWS_S3_TICKETS_BUCKET`         | String       | S3 bucket name for attachments.          |
| `AUTH_GITHUB_ID` / `_SECRET`    | SecureString | OAuth credentials.                       |
| `AUTH_GOOGLE_ID` / `_SECRET`    | SecureString | OAuth credentials.                       |
| `AWS_ACCESS_KEY_ID` / `_SECRET` | SecureString | IAM credentials for S3 access.           |

### Commands to verify:

```bash
aws ssm get-parameters-by-path --path "/viewmarket/prod/" --recursive
```

## 6. Monitoring & Automation

| Resource                 | Detail                                           | Description                                               |
| :----------------------- | :----------------------------------------------- | :-------------------------------------------------------- |
| **SNS Topic**            | `viewmarket-prod-alerts`                         | Alert notifications and trigger for rollback.             |
| **Lambda Function**      | `viewmarket-prod-rollback`                       | Python script to roll back to stable task def on failure. |
| **CloudWatch Alarms**    | `viewmarket-prod-alb-5xx`, `...-unhealthy-hosts` | Monitoring for health and latency.                        |
| **CloudWatch Log Group** | `/ecs/viewmarket/prod`                           | Centralized logs for the Fargate service.                 |

## 7. IAM Roles

| Role Name                         | Description                                        |
| :-------------------------------- | :------------------------------------------------- |
| `viewmarket-prod-ecs-exec`        | Allows ECS to pull images and write logs.          |
| `viewmarket-prod-ecs-task`        | Permissions for the running application (S3, SSM). |
| `viewmarket-prod-github-actions`  | Role assumed by CI/CD via OIDC for deployments.    |
| `viewmarket-prod-rollback-lambda` | Permissions for the rollback Lambda to update ECS. |

## 8. Deployment Workflow

1. **Build**: GitHub Actions builds Docker image on push to `master`.
2. **Push**: Image is pushed to **ECR** (`viewmarket-prod`).
3. **Task Def**: Actions registers a new **Task Definition** with the new image URI.
4. **Deploy**: **ECS Service** is updated to use the new Task Definition.
5. **Monitor**: Circuit breaker and alarms monitor the rollout.
6. **Rollback**: If alarms trigger, **SNS** invokes **Lambda**, which resets the service to the `STABLE_TASK_DEFINITION` version.

---

_Created by Gemini CLI - 2026-05-08_
