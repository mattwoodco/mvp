# @mvp/auth

Authentication package wrapping Better Auth with Google OAuth and magic link support.

## Usage

### In your Next.js app routes

```typescript
// app/api/auth/[...all]/route.ts
import { GET, POST } from '@mvp/auth'

export { GET, POST }
```

### In your middleware

```typescript
// middleware.ts
import { authMiddleware } from '@mvp/auth'

export async function middleware(request: NextRequest) {
  // Add your custom logic here
  return authMiddleware(request)
}

export const config = {
  matcher: ['/dashboard'],
}
```

### Using the auth instance

```typescript
import { auth } from '@mvp/auth'

// Get session in server components
const session = await auth.api.getSession({
  headers: headers()
})
```

## Environment Variables

Required in your `.env` files:
- `BETTER_AUTH_SECRET` - 32+ character secret key
- `BETTER_AUTH_URL` - Your app URL
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Public app URL  
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `DATABASE_URL` - PostgreSQL connection string 
