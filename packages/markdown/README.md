# @money/markdown

A minimal MDX components package for consistent markdown rendering across the Money platform.

## Features

- Pre-styled MDX components using Tailwind CSS
- Consistent typography following shadcn/ui design system
- Easy integration with Next.js apps
- Shared layout component for markdown pages

## Installation

This package is designed to be used as a workspace dependency:

```json
{
  "dependencies": {
    "@money/markdown": "workspace:*"
  }
}
```

## Usage

### 1. Configure MDX in your Next.js app

Add to your `next.config.ts`:

```typescript
import createMDX from '@next/mdx'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // ... other config
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
```

### 2. Set up MDX components

Create `src/mdx-components.tsx` in your app:

```typescript
import { useMDXComponents as getMDXComponents } from '@money/markdown/components'

export function useMDXComponents(components: any = {}) {
  return getMDXComponents(components)
}
```

### 3. Use the layout component

```typescript
import { MarkdownLayout } from '@money/markdown/layout'

export default function Layout({ children }) {
  return (
    <MarkdownLayout title="Page Title" description="Page description">
      {children}
    </MarkdownLayout>
  )
}
```

### 4. Create MDX pages

Create `.mdx` files in your app directory:

```markdown
# My Heading

This is a paragraph with **bold text** and *italic text*.

- List item 1
- List item 2

[Link example](https://example.com)
```

## Components Included

- Headings (h1-h6) with consistent sizing and spacing
- Paragraphs with proper line height
- Lists (ul, ol) with appropriate margins
- Links with hover effects
- Code blocks with background styling
- Tables with borders and alternating row colors
- Blockquotes with left border
- Horizontal rules

## Styling

The components use Tailwind CSS classes and follow the shadcn/ui design system patterns. They automatically adapt to light/dark themes when used with `next-themes`.
