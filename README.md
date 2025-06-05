# MVP

## Environment Setup

This project supports multiple environments through environment files:
- `.env.local` (default)
- `.env.dev`
- `.env.prev` 
- `.env.prod`

## Usage

All scripts accept an environment parameter. If no environment is specified, `local` is used by default.

### Development
```bash
bun dev           # uses .env.local
bun dev dev       # uses .env.dev
bun dev prod      # uses .env.prod
```

### Building
```bash
bun build         # uses .env.local
bun build dev     # uses .env.dev
bun build prod    # uses .env.prod
```

### Database Operations
```bash
bun db:push       # uses .env.local
bun db:push dev   # uses .env.dev
bun db:push prod  # uses .env.prod

bun db:gen        # uses .env.local
bun db:gen dev    # uses .env.dev

bun db:std        # uses .env.local
bun db:std dev    # uses .env.dev
```

### Other Commands
```bash
bun lint
bun typecheck
bun test
bun format
```
