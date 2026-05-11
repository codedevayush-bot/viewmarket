# ViewMarket Infrastructure (Terraform)

This directory contains the Infrastructure-as-Code definitions for the ViewMarket production AWS environment.

## Phase 1: Foundation Rollout

Before applying the main infrastructure, you must bootstrap the Terraform remote state (S3 backend and DynamoDB lock table).

### Step 1: Bootstrap State Management

1. Navigate to the bootstrap directory:
   ```bash
   cd infra/bootstrap
   ```
2. Initialize and apply the bootstrap configuration:
   ```bash
   terraform init
   terraform apply
   ```
3. Note the outputs for `state_bucket_name` and `dynamodb_table_name`.

### Step 2: Configure Main Backend

1. Open `infra/providers.tf`.
2. Uncomment the `backend "s3"` block.
3. Update the `bucket` value with the `state_bucket_name` output from Step 1.
4. Update the `dynamodb_table` value with the `dynamodb_table_name` output from Step 1.

### Step 3: Apply Foundation Infrastructure

1. Navigate back to the main infra directory:
   ```bash
   cd infra
   ```
2. Initialize the main configuration:
   ```bash
   terraform init
   ```
3. Plan and apply the Phase 1 Foundation:
   ```bash
   terraform plan
   terraform apply
   ```

This will provision:

- 1x VPC across 3 Availability Zones
- 3x Public Subnets & 3x Private Subnets
- 3x NAT Gateways with Elastic IPs (for Broker whitelisting)
- Security Groups for ALB and ECS Tasks
- AWS WAF (Web Application Firewall) attached to ALB rules
- IAM Roles for ECS Execution and Task roles
- KMS Key for encryption
- AWS Secrets Manager skeletons for database and auth secrets
