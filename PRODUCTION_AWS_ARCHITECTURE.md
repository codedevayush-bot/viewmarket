# Enterprise Production AWS Architecture & Deployment Plan

## 1. Analysis of Existing `AWS_DEPLOYMENT_OUTLINE.md`

The initial deployment outline provides a basic foundation but contains significant architectural flaws and missing enterprise standards required for a financial/algorithmic trading platform like ViewMarket.

### Critical Gaps Identified:
1. **Security & Networking:** Placing ECS tasks in Public Subnets is a major security risk. Financial platforms must isolate compute resources in Private Subnets.
2. **Broker Integration:** The platform integrates with 30+ brokers. These brokers often require IP allowlisting. The current architecture lacks static egress IPs (NAT Gateways).
3. **Secrets Management:** Using SSM Parameter Store for highly sensitive secrets (`DATABASE_URL`, `AUTH_SECRET`) is insufficient; AWS Secrets Manager is the enterprise standard due to rotation capabilities and finer KMS integration.
4. **Deployment Strategy:** A basic rolling update via ECS is too risky. Zero-downtime Blue/Green deployments with automated rollback are necessary.
5. **Observability:** Basic CloudWatch logs/alarms are not enough for algorithmic trading. Distributed tracing, structured logging, and APM are required to debug latency issues.
6. **WAF & Threat Protection:** Missing Web Application Firewall (WAF) to protect against SQLi, XSS, and DDoS attacks.

---

## 2. Refined Production Architecture

### 2.1. Networking & VPC Design (Highly Available)
*   **VPC:** `10.0.0.0/16`
*   **Availability Zones:** 3 AZs for maximum fault tolerance.
*   **Public Subnets (3):** Host the Application Load Balancer (ALB) and NAT Gateways.
*   **Private Subnets (3):** Host the ECS Fargate tasks. Completely isolated from direct internet access.
*   **NAT Gateways (3):** Deployed in each Public Subnet with **Elastic IPs**. These static IPs will be provided to the 30+ external broker APIs for strict IP allowlisting.
*   **AWS WAF:** Attached to the ALB with managed rules (Core Rule Set, SQLi, Known Bad Inputs) and rate limiting to prevent abuse.

### 2.2. Compute & Orchestration (ECS Fargate)
*   **ECS Fargate:** Serverless compute to eliminate EC2 patching.
*   **Task Definition Architecture:**
    *   **App Container:** Main Next.js/Node.js application.
    *   **Sidecar - Logging (FireLens/FluentBit):** Routes logs to CloudWatch and potentially a centralized SIEM (e.g., Datadog, Splunk).
    *   **Sidecar - APM (AWS Distro for OpenTelemetry):** Traces requests to monitor low-latency trading paths.
*   **Auto Scaling Strategy:**
    *   Target Tracking: CPU @ 60%, Memory @ 70%.
    *   **Scheduled Scaling:** Pre-warm capacity 30 minutes before major market opens (e.g., 09:00 AM EST) to handle traffic spikes.

### 2.3. Secrets & Configuration
*   **AWS Secrets Manager:** Used for all credentials (`DATABASE_URL`, API Keys for 30+ brokers, OAuth secrets).
*   **SSM Parameter Store:** Used only for non-sensitive config (`APP_BASE_URL`, `ENVIRONMENT`).
*   **KMS:** Customer Managed Keys (CMK) used to encrypt S3 buckets and Secrets Manager.

### 2.4. Storage & Artifacts
*   **ECR:** Image scanning on push enabled (AWS Inspector/Trivy). Immutable tags.
*   **S3 (Assets):** Block Public Access enabled. Encrypted at rest with KMS. Accessed via CloudFront for caching and low latency delivery of static assets.

### 2.5. External Database Access (Neon Postgres)
*   Since Neon Serverless Postgres is used, the ECS tasks will connect over the internet via the NAT Gateways.
*   Neon IP Allowlisting will be configured to only accept connections from the 3 NAT Gateway Elastic IPs.

---

## 3. Deployment Pipeline & CI/CD (GitOps Approach)

We will use **Infrastructure as Code (Terraform)** and **GitHub Actions**.

### 3.1. Infrastructure as Code (Terraform)
*   **State Management:** S3 Backend with DynamoDB state locking.
*   **Modules:** Separated into `networking`, `security`, `compute`, and `pipeline`.

### 3.2. CI/CD Workflow (GitHub Actions)
1.  **Code Commit & PR:**
    *   Linting, Type Checking, Unit Tests (Vitest).
    *   Terraform Plan (Output reviewed in PR).
2.  **Merge to `main` (Build Phase):**
    *   Build Docker image.
    *   Trivy container vulnerability scan.
    *   Push to ECR with Git SHA as tag.
3.  **Deployment Phase (AWS CodeDeploy - Blue/Green):**
    *   Update ECS Task Definition with new image URI.
    *   **CodeDeploy** creates a replacement task set ("Green").
    *   Traffic is routed to a Test Listener (Port 8080) pointing to "Green".
    *   Automated Integration/Smoke Tests run against Test Listener.
    *   If tests pass -> ALB shifts 100% production traffic to "Green".
    *   If tests fail -> Automatic rollback, "Green" tasks terminated.
    *   Wait 15 minutes before terminating "Blue" tasks (Bake period).

---

## 4. Phased Execution Plan

To build this architecture from scratch reliably, we will follow a 4-phase rollout:

### Phase 1: Foundation (Networking & Security)
*   Initialize Terraform state bucket & DynamoDB table.
*   Provision VPC, 6 Subnets (3 Public, 3 Private), Internet Gateway.
*   Provision 3 NAT Gateways with Elastic IPs (Share IPs with Broker partners).
*   Set up AWS WAF, Security Groups, and IAM Roles (Least Privilege).
*   Create KMS Keys and AWS Secrets Manager skeletons.

### Phase 2: Data & Storage
*   Configure ECR repositories with scan-on-push policies.
*   Provision S3 buckets for application assets.
*   Configure CloudFront distribution pointing to S3 and ALB.
*   Apply IP allowlisting in Neon Postgres dashboard using NAT IPs.

### Phase 3: Compute & Orchestration
*   Provision ALB and Target Groups (Blue & Green).
*   Provision ECS Cluster.
*   Create baseline ECS Task Definitions (incorporating FireLens/OTel sidecars).
*   Setup CloudWatch Log Groups, Alarms, and SNS notification topics.

### Phase 4: Automation & CI/CD
*   Configure GitHub OIDC Provider in AWS for passwordless CI/CD.
*   Setup AWS CodeDeploy Application and Deployment Group for Blue/Green.
*   Write and test GitHub Actions workflows (`.github/workflows/deploy.yml`).
*   Conduct End-to-End deployment test, including a forced failure to verify automated rollback.