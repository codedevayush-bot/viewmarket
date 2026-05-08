module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "viewmarket-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Tags for ALB and general resources
  public_subnet_tags = {
    "Tier" = "Public"
  }
  
  private_subnet_tags = {
    "Tier" = "Private"
  }
}

# Output NAT IPs for Broker Whitelisting
output "nat_public_ips" {
  description = "List of public Elastic IPs created for AWS NAT Gateway. Provide these to the 30+ brokers for allowlisting."
  value       = module.vpc.nat_public_ips
}
