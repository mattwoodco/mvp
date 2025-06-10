# @chatmtv/storage

Beautiful, terse Vercel Blob storage wrapper for React & Next.js.

## Quick Start

```ts
// Client uploads (React components)
import { upload } from "@chatmtv/storage";
const url = await upload("photo.jpg", file);

// Server uploads (API routes)
import { put } from "@chatmtv/storage";
const url = await put("avatar.jpg", buffer);

// Handle client uploads (API routes)
import { handleUpload } from "@chatmtv/storage";
return NextResponse.json(await handleUpload(body, request));
```

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

## Environment

**Local**: All operations return `null` (no actual uploads)  
**Production**: Requires `BLOB_READ_WRITE_TOKEN` environment variable

## Why This Package?

✅ **Beginner-friendly** - Simple functions, great TypeScript support  
✅ **Terse** - Clean API, no ceremony  
✅ **Smart** - Handles client vs server automatically  
✅ **Safe** - No tokens needed on client-side
