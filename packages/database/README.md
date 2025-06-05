# Local (default)
bun db:push

# Preview
APP_ENV=preview bun db:push

# Production  
APP_ENV=prod bun db:push

# Development
APP_ENV=dev bun db:push
