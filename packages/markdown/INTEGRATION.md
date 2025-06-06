# Markdown Package Integration Guide

This guide explains how the `@mvp/markdown` package has been integrated into the MVP monorepo.

## What We've Created

### 1. Package Structure

```
packages/markdown/
├── package.json
├── tsconfig.json
├── README.md
├── INTEGRATION.md (this file)
└── src/
    ├── index.ts
    ├── components/
    │   ├── index.ts
    │   ├── mdx-content.tsx    # Wrapper for MDX content with prose styling
    │   ├── mdx-layout.tsx     # Full-page layout for MDX articles
    │   └── mdx-card.tsx       # Card component for highlighting content
    └── utils/
        ├── index.ts
        ├── mdx-components.ts  # Pre-styled MDX component mappings
        └── mdx-config.ts      # MDX configuration utility
```

### 2. Website Integration

We've configured the website app to use MDX:

- **Updated `package.json`**: Added `@mvp/markdown` and MDX dependencies
- **Updated `next.config.ts`**: Wrapped config with MDX support
- **Created `mdx-components.tsx`**: Uses shared components from `@mvp/markdown`
- **Created example MDX page**: `/hello` route with interactive components

### 3. Key Features

- **Minimal imports**: Following the pattern of `@mvp/storage`
- **Shared components**: Reusable across all apps in the monorepo
- **TypeScript support**: Full type safety for MDX
- **Tailwind v4 + Typography**: Modern styling with prose classes
- **Next.js 15 + React 19**: Using latest best practices

## Using the Package

### Basic MDX Page

```mdx
import { MdxLayout, MdxCard } from "@mvp/markdown";
import { Button } from "@mvp/ui/button";

export default function Layout({ children }) {
  return (
    <MdxLayout title="My Article" description="Article description">
      {children}
    </MdxLayout>
  );
}

# Hello World

This is MDX content with **bold** text.

<MdxCard title="Feature">
  <Button>Interactive Button</Button>
</MdxCard>
```

### TypeScript Page Using MDX Components

```tsx
import { MdxContent, MdxCard } from "@mvp/markdown";

export default function Page() {
  return (
    <MdxContent>
      <h1>Title</h1>
      <MdxCard title="Example">
        Content here
      </MdxCard>
    </MdxContent>
  );
}
```

## Installation Steps

When the proper package manager is available:

1. Run `bun install` (or the appropriate package manager)
2. Navigate to `/hello` or `/mdx-demo` to see the examples
3. Create your own MDX content in any app directory

## Best Practices

1. **Use shared components**: Import from `@mvp/markdown` for consistency
2. **Follow naming conventions**: Use `.mdx` extension for MDX files
3. **Leverage TypeScript**: All components are fully typed
4. **Dark mode aware**: All components support dark mode automatically

## Dependencies

The package includes:
- `@mdx-js/loader`: MDX loader for webpack
- `@mdx-js/react`: React components for MDX
- `@next/mdx`: Next.js MDX integration
- `@tailwindcss/typography`: Prose styling

All dependencies are managed at the package level for better isolation.
