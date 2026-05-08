# KMS Key for encrypting Secrets and S3
resource "aws_kms_key" "main" {
  description             = "KMS key for ViewMarket ${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_kms_alias" "main" {
  name          = "alias/viewmarket-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}

# Provide access to ECS Task Role to use KMS Key
resource "aws_kms_key_policy" "main" {
  key_id = aws_kms_key.main.id
  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "key-default-1"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow use of the key for ECS Tasks"
        Effect = "Allow"
        Principal = {
          AWS = [
            aws_iam_role.ecs_task_role.arn,
            aws_iam_role.ecs_task_execution_role.arn
          ]
        }
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow CloudWatch Logs to use the key"
        Effect = "Allow"
        Principal = {
          Service = "logs.${var.aws_region}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt*",
          "kms:Decrypt*",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:Describe*"
        ]
        Resource = "*"
        Condition = {
          ArnEquals = {
            "kms:EncryptionContext:aws:logs:arn": "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/ecs/viewmarket-app-${var.environment}"
          }
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

# AWS Secrets Manager Skeleton for Database URL
resource "aws_secretsmanager_secret" "database_url" {
  name        = "/viewmarket/${var.environment}/DATABASE_URL"
  description = "Neon Postgres Connection String"
  kms_key_id  = aws_kms_key.main.id
}

# AWS Secrets Manager Skeleton for NextAuth Secret
resource "aws_secretsmanager_secret" "auth_secret" {
  name        = "/viewmarket/${var.environment}/AUTH_SECRET"
  description = "NextAuth Secret Key"
  kms_key_id  = aws_kms_key.main.id
}

# Grant ECS Task Execution Role read access to Secrets Manager
resource "aws_iam_policy" "ecs_secrets_policy" {
  name        = "viewmarket-ecs-secrets-policy-${var.environment}"
  description = "Allow ECS tasks to read secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.database_url.arn,
          aws_secretsmanager_secret.auth_secret.arn,
          "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/viewmarket/${var.environment}/brokers/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_policy.arn
}
