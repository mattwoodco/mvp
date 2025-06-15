# @mvp/auth

Authentication package using Better Auth for the mvp monorepo.

## Features

- Social authentication (Google)
- Magic link authentication
- Session management
- Next.js integration

## Usage

### Server-side (API Route)

Create an API route at `app/api/auth/[...all]/route.ts`:

```typescript
import { createAuth } from '@mvp/auth/server'
import { toNextJsHandler } from 'better-auth/next-js'
import { sendMagicLinkEmail } from '@/lib/email/magic-link'

const auth = createAuth({
  sendMagicLink: sendMagicLinkEmail,
})

export const { POST, GET } = toNextJsHandler(auth)
```

### Client-side

```typescript
import { authClient } from '@mvp/auth/client'

// Sign in with Google
await authClient.signIn.social({ provider: 'google' })

// Sign in with magic link
await authClient.signIn.magicLink({ email: 'user@example.com' })

// Get session
const session = await authClient.getSession()

// Sign out
await authClient.signOut()
```

### Middleware

Protect routes using Next.js middleware:

```typescript
import { getSessionFromRequest } from '@mvp/auth/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionFromRequest(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/protected/:path*'],
}
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SITE_URL` - The URL of your site (used for auth callbacks)
- `BETTER_AUTH_SECRET` - Secret key for auth (generate with `openssl rand -base64 32`)
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret

## Schema

The auth package exports database schemas for:
- `users` - User accounts
- `sessions` - Active sessions  
- `accounts` - OAuth provider accounts
- `verifications` - Email verification tokens
