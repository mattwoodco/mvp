# @mvp/ui

Shared UI components and theming for the MVP project.

## Dark Mode

This package provides dark mode support using `next-themes` and Tailwind CSS.

### Quick Start

1. **Wrap your app** with `ThemeProvider` in your root layout:

```tsx
import { ThemeProvider } from "@mvp/ui/theme"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

2. **Add the mode toggle** anywhere in your app:

```tsx
import { ModeToggle } from "@mvp/ui/theme"

export function Header() {
  return (
    <header>
      <ModeToggle />
    </header>
  )
}
```

### How it Works

- Uses CSS variables defined in `src/globals.css`
- Automatically respects system preferences
- Persists user choice in localStorage
- Applies `.dark` class to `<html>` element
- All UI components automatically adapt to the theme

### Customizing Colors

Edit the CSS variables in `src/globals.css` to customize your theme colors.