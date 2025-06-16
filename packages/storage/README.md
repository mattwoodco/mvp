# @mvp/storage

Beautiful, terse Vercel Blob storage wrapper for React & Next.js.

---

## Overview
This package provides a unified storage API that works with both Vercel Blob Storage (production) and MinIO (local development).

## Architecture

### File Structure
- `index.ts` - Main exports (client-side focused)
- `client.ts` - Unified client/server operations with automatic backend selection
- `server.ts` - Server-only operations with explicit backend selection
- `utils.ts` - Shared utilities (environment detection, path creation, etc.)
- `types.ts` - TypeScript interfaces
- `minio-local.ts` - Server-side MinIO implementation
- `minio-browser.ts` - Browser-side MinIO upload (via API route)

### Key Design Decisions
1. **Unified API**: Same function names work in both environments
2. **Smart Detection**: Automatically uses MinIO in local dev, Vercel Blob in production
3. **Context Awareness**: Functions detect if they're running in browser vs server
4. **No Breaking Changes**: All existing imports and APIs remain unchanged

---

## Quick Start

```ts
// Client uploads (React components)
import { upload } from "@mvp/storage";
const url = await upload("photo.jpg", file);

// Server uploads (API routes)
import { put } from "@mvp/storage";
const url = await put("avatar.jpg", buffer);

// Handle client uploads (API routes)
import { handleUpload } from "@mvp/storage";
return NextResponse.json(await handleUpload(body, request));
```

---

## Full API

```ts
// 📤 Upload from client (browser)
await upload("file.jpg", fileObject);

// 🚀 Upload from server (Node.js)
await put("file.jpg", buffer);

// 🔧 Handle uploads in API routes
await handleUpload(body, request);

// 🗑️ Delete files
await remove("old-file.jpg");

// 🔍 Check existence
if (await exists("file.jpg")) { /* ... */ }

// 📁 List files
const files = await list("folder/");

// 📄 Copy files
await copy("original.jpg", "backup.jpg");
```

---

## Usage Patterns

### Client-Side (Browser)
```ts
import { upload } from "@mvp/storage";
const url = await upload("file.jpg", file);
```

### Server-Side
```ts
import { putServer } from "@mvp/storage/server";
const url = await putServer("file.jpg", buffer);
```

### Mixed Context (Next.js)
```ts
import { put, upload } from "@mvp/storage";
// Automatically handles both contexts
```

---

## Environment

- `NEXT_PUBLIC_APP_ENV=local` - Enables local mode
- `NEXT_PUBLIC_USE_MINIO=true` - Uses MinIO in local mode
- `BLOB_READ_WRITE_TOKEN` - Required for Vercel Blob (production)

**Local**: All operations return `null` (no actual uploads)  
**Production**: Requires `BLOB_READ_WRITE_TOKEN` environment variable

---

## Why This Package?

✅ **Beginner-friendly** - Simple functions, great TypeScript support  
✅ **Terse** - Clean API, no ceremony  
✅ **Smart** - Handles client vs server automatically  
✅ **Safe** - No tokens needed on client-side
