# @mvp/types

Centralized, future-proof type definitions for the MVP application.

## Architecture

This package consolidates all TypeScript types into a single, well-organized system that's easy to maintain and extend.

### Type Categories

- **Database Types** (`./database`) - Inferred from Drizzle schemas for type safety
- **Auth Types** (`./auth`) - Authentication, forms, and user session types  
- **UI Types** (`./ui`) - React components and UI-related types
- **API Types** (`./api`) - Request/response and API endpoint types

### Key Benefits

- **Database-first types** - Types are inferred from actual database schemas
- **Single source of truth** - No duplicate type definitions
- **Modular exports** - Import only what you need
- **Easy extension** - Add new type files without breaking existing code
- **Future-proof** - Designed for scalability

## Usage

### Import everything
```typescript
import { User, AuthFormData, ApiResponse } from "@mvp/types";
```

### Import specific modules
```typescript
import { User, Listing } from "@mvp/types/database";
import { AuthFormData, LoginActionState } from "@mvp/types/auth";
import { ComponentSize, WithChildren } from "@mvp/types/ui";
import { ApiResponse, PaginatedResponse } from "@mvp/types/api";
```

## Database Types

All database types are inferred from Drizzle schemas, ensuring they stay in sync with your actual database structure:

```typescript
import { User, NewUser, Listing, UserWithListings } from "@mvp/types/database";

// User type matches the database schema exactly
const user: User = {
  id: "123",
  name: "John Doe", 
  email: "john@example.com",
  // ... all other fields are typed
};

// NewUser type for inserts (omits auto-generated fields)
const newUser: NewUser = {
  name: "Jane Doe",
  email: "jane@example.com",
  // id, createdAt, updatedAt are optional
};
```

## Adding New Types

### 1. Create a new type file
```typescript
// packages/types/src/analytics.ts
export type AnalyticsEvent = {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
};
```

### 2. Export from index
```typescript
// packages/types/src/index.ts
export * from "./analytics";
```

### 3. Add to package.json exports (optional)
```json
{
  "exports": {
    "./analytics": "./src/analytics.ts"
  }
}
```

## Migration Guide

Replace old imports:

```typescript
// Before
import { User, Session } from "@mvp/auth/types";
import { AuthFormData } from "@mvp/auth/types";

// After  
import { User, AuthFormData, AuthSession } from "@mvp/types";
```

The `tw` prop and image imports are automatically available through module augmentation. 
