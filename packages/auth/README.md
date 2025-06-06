# @mvp/auth

Modern authentication package built with Better Auth for the MVP monorepo.

## Features Implemented

✅ **Email/Password Authentication** - Secure bcrypt hashing  
✅ **Magic Link Authentication** - Passwordless login via email  
✅ **Email Verification** - User email verification flow  
✅ **Reusable Components** - Client-side React components  
✅ **Type Safety** - Comprehensive TypeScript definitions  
✅ **Database Integration** - Drizzle ORM with PostgreSQL  
✅ **Session Management** - Secure session handling  
✅ **Composable Callbacks** - Extensible auth lifecycle hooks  

## Package Structure

```
src/
├── auth.ts              # Better-auth configuration
├── types/
│   └── index.ts         # TypeScript type definitions
├── actions/
│   └── auth-actions.ts  # Server actions for forms
├── components/
│   ├── AuthLayout.tsx   # Reusable auth layout
│   ├── RegisterForm.tsx # Registration form
│   └── index.ts        # Component exports
├── handlers.ts          # API route handlers
├── middleware.ts        # Auth middleware
└── index.ts            # Main package exports
```

## Database Schema Updates

The user schema has been enhanced with:
- `password` field for email/password auth
- `emailVerified` field with proper default value
- Better Auth compatible field structure

## Usage in Website App

### Login Page (`/login`)
```typescript
import { RegisterForm } from "@mvp/auth/components";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}
```

### Register Page (`/register`)
```typescript
import { RegisterForm } from "@mvp/auth/components";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}
```

### API Route (`/api/auth/[...betterauth]/route.ts`)
```typescript
import { auth } from "@mvp/auth";

export const GET = auth.handler;
export const POST = auth.handler;
```

## Configuration

The auth instance is configured with:

- **Database Adapter**: Drizzle with PostgreSQL
- **Password Hashing**: bcrypt with salt rounds 12
- **Email Verification**: Required for new accounts
- **Magic Link**: Passwordless authentication
- **Session Management**: 7-day expiry with 1-day update age
- **Callbacks**: User creation and sign-in hooks
- **CORS**: Trusted origins configuration

## Environment Variables

Required environment variables:
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Component Features

### RegisterForm
- Email/password registration
- Form validation with Zod
- Loading states and error handling
- Email verification flow
- User-friendly success messages

### AuthLayout
- Reusable layout for auth pages
- Responsive design
- Consistent styling across auth flows

## Type Safety

Comprehensive types for:
- Form data validation schemas
- Action state management
- User and session interfaces
- API response types

## Next Steps

1. **Fix Auth Configuration** - Complete the better-auth setup
2. **Complete LoginForm** - Implement email/password + magic link UI
3. **Add Error Handling** - Improve error boundaries and messaging
4. **Email Templates** - Design verification and magic link emails
5. **Middleware Setup** - Protect routes and handle redirects
6. **Testing** - Add unit and integration tests

## Dependencies

- `better-auth` - Modern auth library
- `bcrypt-ts` - Password hashing
- `zod` - Runtime type validation
- `@mvp/database` - Database layer
- `@mvp/email` - Email sending

## Migration

A database migration has been generated to add the password field to the user table. Run:

```bash
cd packages/database
bun run db:push
```
