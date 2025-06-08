# MVP Monorepo

A modern monorepo setup with Next.js apps and shared packages using Bun and Turbo.

## Environment Files

Environment-specific configuration files:
- `.env.local` (default)
- `.env.dev`
- `.env.prev`
- `.env.prod`

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up your environment files from the example:
   ```bash
   cp env.example .env.local
   ```

3. **Set up Stripe (fully automated):**
   ```bash
   bun run stripe:setup
   ```
   This interactive script will:
   - Guide you to get API keys from Stripe Dashboard
   - Handle Stripe CLI authentication automatically
   - Create test products and prices automatically
   - **Capture webhook secret automatically**
   - Update your environment files with everything configured
   - Configure test/production Stripe environments

4. Start development:
   ```bash
   bun dev           # uses .env.local
   bun dev dev       # uses .env.dev
   bun dev prod      # uses .env.prod
   ```

## Scripts

### Build
```bash
bun build         # uses .env.local
bun build dev     # uses .env.dev
bun build prod    # uses .env.prod
```

### Database
```bash
bun db:push       # uses .env.local
bun db:push dev   # uses .env.dev
bun db:push prod  # uses .env.prod

bun db:gen        # uses .env.local
bun db:gen dev    # uses .env.dev

bun db:std        # uses .env.local
bun db:std dev    # uses .env.dev
```

### Stripe Management
```bash
bun run stripe:setup     # Interactive setup wizard (one-time)
bun run stripe:refresh   # Refresh webhook secret (daily development)
bun run stripe:nuke      # Delete ALL test products and prices (development cleanup)
bun run stripe:listen    # Manual webhook listener
bun run stripe:products  # List Stripe products
bun run stripe:prices    # List Stripe prices
bun run stripe:customers # List Stripe customers
bun run stripe:dashboard # Open Stripe dashboard
```

## Stripe Configuration

### **Automated Setup Flow**
The `stripe:setup` script handles **everything automatically**:
- ✅ **Authentication** - Prompts for Stripe CLI login if needed
- ✅ **API Keys** - Guides you to copy from dashboard
- ✅ **Products & Prices** - Creates via CLI automatically  
- ✅ **Webhook Secret** - Captures live webhook secret automatically
- ✅ **Environment Files** - Updates all environment files

### **Daily Development**
When you return to development, webhook secrets may expire. Simply run:
```bash
bun run stripe:refresh
```
This will:
- ✅ **Capture new webhook secret** automatically
- ✅ **Update environment files** with fresh webhook secret
- ✅ **Ready to develop** - No manual copying needed

### Environment Variables
- `USE_LIVE_STRIPE=false` - Controls test vs live Stripe mode
- Test keys are used in `.env.local`, `.env.dev`, `.env.prev`
- Production `.env.prod` supports both test and live keys
- Set `USE_LIVE_STRIPE=true` in production to use live Stripe

### Test vs Live Mode
```bash
# Development (always test mode)
USE_LIVE_STRIPE=false
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...    # Auto-captured!

# Production (configurable)
USE_LIVE_STRIPE=true  # or false for test mode in prod
STRIPE_SECRET_KEY=sk_test_...              # Test keys
STRIPE_LIVE_SECRET_KEY=sk_live_...         # Live keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...            # Auto-captured!
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...       # Live webhook secret
```

## Infrastructure

```bash
bun run up        # Start all services (database + storage)
bun run down      # Stop all services
bun run db:up     # Start database only
bun run storage:up # Start storage only
```

## Development Tools

```bash
bun run format   # Format code with Biome
bun run lint     # Lint code
bun run typecheck # Type checking
bun run test     # Run tests
```
