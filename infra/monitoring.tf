# CloudWatch Log Group for ECS App
resource "aws_cloudwatch_log_group" "ecs_app" {
  name              = "/ecs/viewmarket-app-${var.environment}"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.main.arn
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alarms" {
  name              = "viewmarket-alarms-${var.environment}"
  kms_master_key_id = aws_kms_key.main.id
}

# High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "viewmarket-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.app.name
  }
}

# High 5xx Errors Alarm
resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "viewmarket-high-5xx-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "This metric monitors ALB 5xx errors"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}
