# ----------------------------------------------------------------------------------------------------------------------
# REQUIRE A SPECIFIC TERRAFORM VERSION OR HIGHER
# This module has been updated with 0.12 syntax, which means it is no longer compatible with any versions below 0.12.
# ----------------------------------------------------------------------------------------------------------------------

terraform {
  required_version = ">= 0.12"
}

# ------------------------------------------------------------------------------
# CONFIGURE OUR AWS CONNECTION
# ------------------------------------------------------------------------------

provider "aws" {
  region = "us-east-1"
  profile = "playpower"
}

# ------------------------------------------------------------------------------
# CONFIGURE OUR AWS CONNECTION
# ------------------------------------------------------------------------------

module "aws_lambda_function" {

  source = "../../aws-lambda"

  environment          = "staging"
  prefix               = "upgrade"
  app_version          = "1.0.0"
  lambda_iam_role_name = "schedular-lambda-iam" // will be prefixed by environment-prefix-
  s3_bucket            = "schedular" // will be prefixed by environment-prefix
  lambda_zip           = "schedular.zip"
  lambda_path          = "../../packages/Schedular" //Path of the lambda function folder
  output_path          = "../environments/dev/.terraform"
  function_name        = "Schedule" // will be prefixed by environment-prefix
  function_handler     = "schedule.schedule"
  runtime              = "nodejs10.x"
}


module "aws-state-machine" {

  source = "../../aws-step-fn"

  environment                = "staging"  
  prefix                     = "upgrade"
  app_version                = "1.0.0"
  aws_sfn_state_machine_name = "experiment-schedular" // will be prefixed by environment-prefix
  lambda_arn                 = module.aws_lambda_function.lambda-arn[0]
  sfn_iam_role_name          = "iam_for_sfn" // will be prefixed by environment-prefix
}



output "step" {
  value = module.aws-state-machine.step_function_arn
}


module "aws-ebs-app" {

  source = "../../aws-ebs-with-rds"

  environment                = "staging"  
  prefix                     = "upgrade"
  allocated_storage          = 100
  identifier                 = "staging-postgres"
  instance_class             = "db.t2.small"
  storage_type               = "gp2"
  app_instance_type          = "t2.micro"
  SCHEDULER_STEP_FUNCTION = module.aws-state-machine.step_function_arn
  PATH_TO_PRIVATE_KEY     = "mykey"
  PATH_TO_PUBLIC_KEY      = "mykey.pub"
}

output "eb" {
  value = module.aws-ebs-app.ebs
}
