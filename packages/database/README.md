# Database

Database operations inherit environment configuration from the root project.

## Usage

### Push Schema
```bash
# From root directory
bun db:push       # uses .env.local (default)
bun db:push dev   # uses .env.dev  
bun db:push prev  # uses .env.prev
bun db:push prod  # uses .env.prod
```

### Generate Client
```bash
# From root directory
bun db:gen        # uses .env.local (default)
bun db:gen dev    # uses .env.dev
```

### Studio
```bash
# From root directory
bun db:std        # uses .env.local (default)
bun db:std dev    # uses .env.dev
```
