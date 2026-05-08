terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Note: The backend will need to be configured after the bootstrap phase
  backend "s3" {
    bucket         = "viewmarket-tf-state-prod-19f8494e"
    key            = "foundation/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "viewmarket-tf-lock-prod"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "ViewMarket"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
