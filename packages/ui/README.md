# @mvp/ui

Shared UI components and theming for the mvp project.

## 🎨 Modular Theming System

This package provides a powerful modular theming system that combines base themes (light/dark) with style modifiers.

### Quick Start

1. **Wrap your app** with both providers in your root layout:

```tsx
import { ThemeProvider, ThemeModifierProvider } from "@mvp/ui/theme"

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
          <ThemeModifierProvider>
            {children}
          </ThemeModifierProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

2. **Add the theme switcher** anywhere in your app:

```tsx
import { ThemeSwitcher } from "@mvp/ui/theme"

export function Header() {
  return (
    <header>
      <ThemeSwitcher />
    </header>
  )
}
```

### Theme Modifiers

Choose from 5 distinct style modifiers that work with both light and dark themes:

- **Default** - Clean, standard design
- **Condensed** - Compact spacing and typography
- **Minimal** - Sharp edges, no shadows, clean lines
- **Elegant** - Serif fonts, sophisticated spacing
- **Natural** - Organic colors, soft rounded elements
- **Cyberpunk** - Neon colors, futuristic monospace

### Components

- `ThemeProvider` - Base theme provider (light/dark)
- `ThemeModifierProvider` - Modifier provider (condensed, minimal, etc.)
- `ThemeSwitcher` - Combined theme + modifier selector

- `ThemeDemo` - Showcase component

### Hooks

```tsx
import { useTheme, useThemeModifier } from "@mvp/ui/theme"

function MyComponent() {
  const { theme, setTheme } = useTheme()
  const { modifier, setModifier } = useThemeModifier()
  
  return (
    <div>
      Current: {theme}-{modifier}
    </div>
  )
}
```

### How it Works

- Uses CSS variables and `data-modifier` attributes
- Automatically respects system preferences
- Persists choices in localStorage
- Modular CSS files for each modifier
- Zero runtime overhead

### Customizing

Each modifier is defined in its own CSS file:
- `src/components/theme/modifiers/condensed.css`
- `src/components/theme/modifiers/minimal.css`
- etc.

Edit these files to customize the modifiers or create new ones.
