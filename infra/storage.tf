# ECR Repository for the Application Image
resource "aws_ecr_repository" "app_repo" {
  name                 = "viewmarket-app-${var.environment}"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.main.arn
  }
}

# ECR Lifecycle Policy (keep last 30 images)
resource "aws_ecr_lifecycle_policy" "app_repo_policy" {
  repository = aws_ecr_repository.app_repo.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# S3 Bucket for Application Assets (e.g., ticket attachments)
resource "aws_s3_bucket" "assets_bucket" {
  bucket = "viewmarket-assets-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "assets_bucket_versioning" {
  bucket = aws_s3_bucket.assets_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "assets_bucket_encryption" {
  bucket = aws_s3_bucket.assets_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.main.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# S3 Block Public Access
resource "aws_s3_bucket_public_access_block" "assets_bucket_public_access" {
  bucket = aws_s3_bucket.assets_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Grant ECS Task Role read/write access to Assets Bucket
resource "aws_iam_policy" "ecs_s3_policy" {
  name        = "viewmarket-ecs-s3-policy-${var.environment}"
  description = "Allow ECS tasks to access the S3 assets bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.assets_bucket.arn,
          "${aws_s3_bucket.assets_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_s3_access" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_s3_policy.arn
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.app_repo.repository_url
}

output "s3_assets_bucket_name" {
  description = "The name of the S3 assets bucket"
  value       = aws_s3_bucket.assets_bucket.id
}
