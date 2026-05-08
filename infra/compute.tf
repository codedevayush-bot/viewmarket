# Application Load Balancer
resource "aws_lb" "main" {
  name               = "viewmarket-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = true

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "viewmarket-alb"
    enabled = true
  }
}

# Web ACL Association for ALB
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}

# ALB S3 Bucket for Access Logs
resource "aws_s3_bucket" "alb_logs" {
  bucket = "viewmarket-alb-logs-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::127311923021:root" # ALB Account ID for us-east-1
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/*"
      }
    ]
  })
}

# Blue Target Group (Active)
resource "aws_lb_target_group" "blue" {
  name        = "viewmarket-tg-blue-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }
}

# Green Target Group (Standby/Testing)
resource "aws_lb_target_group" "green" {
  name        = "viewmarket-tg-green-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }
}

# HTTP Listener (Forwards to Blue TG for now, until HTTPS is ready)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.blue.arn
  }
}

# HTTPS Listener (Default to Blue TG, will be managed by CodeDeploy)
# Note: Requires an ACM Certificate
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-2016-08"
#   certificate_arn   = var.acm_certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.blue.arn
#   }
# }

# Test Listener for CodeDeploy Green Validation
# resource "aws_lb_listener" "test" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = "8080"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-2016-08"
#   certificate_arn   = var.acm_certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.green.arn
#   }
# }

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "viewmarket-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
  }
}

# Define the baseline Task Definition
# The actual image tag will be updated by CodeDeploy during CI/CD
resource "aws_ecs_task_definition" "app" {
  family                   = "viewmarket-app-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024 # 1 vCPU
  memory                   = 2048 # 2 GB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "public.ecr.aws/nginx/nginx:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "NEXT_TELEMETRY_DISABLED", value = "1" },
        { name = "S3_BUCKET_NAME", value = aws_s3_bucket.assets_bucket.id }
      ]
      secrets = [
        { name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.database_url.arn },
        { name = "AUTH_SECRET", valueFrom = aws_secretsmanager_secret.auth_secret.arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }
    }
  ])
}

# ECS Service
# Ignores changes to task_definition and load_balancer so CodeDeploy can manage it
resource "aws_ecs_service" "app" {
  name            = "viewmarket-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.blue.arn
    container_name   = "app"
    container_port   = 3000
  }
}
