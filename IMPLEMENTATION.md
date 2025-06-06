# Auth & Email Packages Implementation Guide

This document shows the complete implementation of `@mvp/auth` and `@mvp/email` packages.

## 📦 Package Structure

```
packages/
├── auth/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts       # Main exports
│       ├── auth.ts        # Better Auth config
│       ├── middleware.ts  # Next.js middleware
│       └── handlers.ts    # Route handlers
└── email/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts       # Main exports
    │   ├── send-email.ts  # Resend wrapper
    │   └── magic-link.ts  # Magic link email
    └── emails/
        └── magic-link.tsx # React Email template
```

## 🚀 Quick Start

### 1. Install dependencies
```bash
bun install
```

### 2. Set up environment variables
Check that your `.env.*` files have all required variables (see env.example).

### 3. Start development servers
```bash
# Start main app (Next.js on port 3000)
bun dev local

# Start email preview server (port 3001)
bun email:dev local
```

## 📧 Email Development

The email package runs on port 3001 to avoid conflicts with Next.js (port 3000).

```bash
# Start email preview
bun email:dev           # uses .env.local
bun email:dev dev       # uses .env.dev  
bun email:dev prod      # uses .env.prod
```

Visit http://localhost:3001 to preview email templates.

## 🔐 Auth Integration Example

### Route Handler
```typescript
// app/api/auth/[...all]/route.ts
import { GET, POST } from '@mvp/auth'

export { GET, POST }
```

### Middleware
```typescript
// middleware.ts
import { authMiddleware } from '@mvp/auth'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return authMiddleware(request)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### Client Usage
```typescript
// In your React components
import { useSession } from 'better-auth/react'

export function LoginButton() {
  const { data: session } = useSession()
  
  if (session) {
    return <div>Welcome, {session.user.email}!</div>
  }
  
  return (
    <button onClick={() => signIn.google()}>
      Sign in with Google
    </button>
  )
}
```

## 📬 Email Usage Examples

### Basic Email
```typescript
import { sendEmail } from '@mvp/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Welcome to our app',
  html: '<h1>Welcome!</h1>'
})
```

### Magic Link (automatically used by auth)
```typescript
import { sendMagicLinkEmail } from '@mvp/email'

await sendMagicLinkEmail({
  email: 'user@example.com', 
  token: 'abc123',
  url: 'https://yourapp.com/auth/verify?token=abc123'
})
```

## 🎨 Creating New Email Templates

1. Create template file:
```tsx
// packages/email/emails/welcome.tsx
import { Html, Button, Text } from '@react-email/components'

export const WelcomeEmail = ({ name }: { name: string }) => (
  <Html>
    <Text>Welcome, {name}!</Text>
    <Button href="https://yourapp.com/dashboard">
      Get Started
    </Button>
  </Html>
)

export default WelcomeEmail
```

2. Use in your code:
```typescript
import { render } from '@react-email/components'
import { WelcomeEmail } from '@mvp/email/emails/welcome'
import { sendEmail } from '@mvp/email'

const html = await render(WelcomeEmail({ name: 'John' }))
await sendEmail({
  to: 'john@example.com',
  subject: 'Welcome to our app!',
  html
})
```

## 🌍 Environment Variables

All required variables are documented in `env.example`. Key ones:

**Shared (.env):**
- `BETTER_AUTH_SECRET` - 32+ char secret
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Sender email

**Environment-specific (.env.local, .env.dev, etc.):**
- `BETTER_AUTH_URL` - Your app URL
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth secret

## 🚢 Deployment

### Email Preview Server
To deploy the email preview server to Vercel:
1. Set Framework Preset to **Next.js**
2. Set Output Directory to **.react-email/.next**
3. Ensure `"next": "*"` is in email package devDependencies

### Main App
The auth package integrates seamlessly with your existing Next.js deployment.

## 🔄 Turbo.json Integration

Added tasks:
- `email:dev` - Start email preview server
- Updated `build` and `dev` tasks with auth environment variables

## ✅ Verification

Test the setup:

```bash
# 1. Install dependencies
bun install

# 2. Start email server  
bun email:dev local

# 3. Visit http://localhost:3001
# 4. Should see magic-link template

# 5. Check auth integration compiles
bun build local
```

## 🎯 Next Steps

1. **Set up Google OAuth**: Add your client ID/secret to environment files
2. **Configure database**: Ensure Better Auth tables are created
3. **Customize templates**: Modify `packages/email/emails/magic-link.tsx`
4. **Add more auth providers**: Extend `packages/auth/src/auth.ts`

The packages are now ready for use with clean imports:
- `import { auth, authMiddleware, GET, POST } from '@mvp/auth'`
- `import { sendEmail, sendMagicLinkEmail } from '@mvp/email'` 
