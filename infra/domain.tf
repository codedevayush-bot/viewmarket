# Route53 Hosted Zone for the domain
resource "aws_route53_zone" "main" {
  name = "viewmarket.in"
}

output "name_servers" {
  description = "The Name Servers for the domain. You MUST configure these at your domain registrar (e.g., GoDaddy, Namecheap)."
  value       = aws_route53_zone.main.name_servers
}

# We create the certificate, but we DO NOT use aws_acm_certificate_validation 
# here because Terraform will hang indefinitely if the user hasn't updated their NS records yet.
# Once NS records propagate, AWS will validate it automatically.
resource "aws_acm_certificate" "main" {
  domain_name               = "viewmarket.in"
  validation_method         = "DNS"
  subject_alternative_names = ["*.viewmarket.in"]
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# Point root domain to the Application Load Balancer
resource "aws_route53_record" "alb" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "viewmarket.in"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
