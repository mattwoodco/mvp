# @mvp/markdown

A shared markdown/MDX package for the MVP monorepo, providing components and utilities for rendering MDX content with consistent styling.

## Features

- 🎨 Pre-styled MDX components with Tailwind CSS
- 📝 Tailwind Typography plugin integration
- 🧩 Reusable layout and card components
- ⚡ Optimized for Next.js 15
- 🌗 Dark mode support

## Installation

This package is already available in the monorepo. To use it in your app:

```typescript
import { MdxLayout, MdxCard, mdxComponents } from "@mvp/markdown";
```

## Usage

### Basic MDX Setup

1. Create an `mdx-components.tsx` file in your app:

```typescript
import { mdxComponents } from "@mvp/markdown";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
```

2. Use the layout component in your MDX files:

```mdx
import { MdxLayout } from "@mvp/markdown";

export default function Layout({ children }) {
  return (
    <MdxLayout title="My Article" description="A description">
      {children}
    </MdxLayout>
  );
}

# Hello World

This is my MDX content with **bold** and *italic* text.
```

### Components

#### MdxLayout

A full-page layout for MDX content:

```typescript
<MdxLayout title="Article Title" description="Optional description">
  {/* MDX content */}
</MdxLayout>
```

#### MdxCard

A card component for highlighting content:

```typescript
<MdxCard title="Feature" className="mt-4">
  This is highlighted content inside a card.
</MdxCard>
```

#### MdxContent

A wrapper for rendering MDX with prose styling:

```typescript
<MdxContent>
  {/* MDX content */}
</MdxContent>
```

## Styling

The package uses Tailwind CSS with the Typography plugin for consistent styling. All components support dark mode out of the box.

## Next.js Configuration

To enable MDX in your Next.js app, update your `next.config.js`:

```javascript
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX({
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
```
