# Website

## Development

The website inherits environment configuration from the root project.

### Local Development
```bash
# From root directory
bun dev           # starts website with .env.local
bun dev dev       # starts website with .env.dev
```

### Building
```bash
# From root directory  
bun build         # builds website with .env.local
bun build prod    # builds website with .env.prod
```

### Direct Commands
```bash
# From apps/website directory
bun dev           # uses root .env.local
bun build         # uses root .env.local
bun start         # starts production build
```

### Environment Sync
```bash
# From root directory
bun sync-envs
```
