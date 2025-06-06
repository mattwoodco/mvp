# Dark Mode Implementation

This project now includes a comprehensive dark mode implementation using `next-themes` and Tailwind CSS.

## Features

- **Automatic theme detection** - Respects system preferences by default
- **Manual theme switching** - Users can override system preference
- **Persistent theme preference** - Theme choice is saved in localStorage
- **No flash of unstyled content** - Theme is applied before render
- **Smooth transitions** - CSS transitions between themes (disabled on change to prevent flashing)

## Architecture

### 1. Type Definitions (`packages/types/src/ui.ts`)
Added theme-related types:
- `Theme` - "light" | "dark" | "system"
- `ThemeProviderProps` - Props for the theme provider component
- `UseThemeProps` - Return type for the useTheme hook

### 2. Shared UI Components (`packages/ui`)
Created reusable theme components:
- `ThemeProvider` - Wrapper around next-themes provider
- `ModeToggle` - Button to switch between light/dark themes

### 3. CSS Variables (`packages/ui/src/globals.css`)
Comprehensive color system with CSS variables:
- Light mode variables in `:root`
- Dark mode variables in `.dark` class
- Semantic color names (background, foreground, primary, etc.)

### 4. Website Integration (`apps/website`)
- Added `next-themes` dependency
- Wrapped app in `ThemeProvider` 
- Added `suppressHydrationWarning` to `<html>` tag
- Updated CSS to use class-based dark mode

## Usage

### In any component:
```tsx
import { ModeToggle } from "@mvp/ui/mode-toggle";

// Add the toggle button anywhere
<ModeToggle />
```

### Access theme programmatically:
```tsx
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
```

### Style with Tailwind:
```tsx
<div className="bg-background text-foreground dark:bg-gray-900">
  Content adapts to theme
</div>
```

## Color System

The implementation uses semantic color names that automatically adapt:
- `background` / `foreground` - Main page colors
- `card` / `card-foreground` - Card component colors
- `primary` / `primary-foreground` - Primary action colors
- `secondary` / `secondary-foreground` - Secondary action colors
- `muted` / `muted-foreground` - Subdued content colors
- `accent` / `accent-foreground` - Accent colors
- `destructive` / `destructive-foreground` - Error/danger colors
- `border`, `input`, `ring` - Form and border colors

## Next Steps

To use dark mode in other apps:
1. Add `next-themes` to the app's dependencies
2. Import and use `ThemeProvider` from `@mvp/ui/theme-provider`
3. Import and use `ModeToggle` from `@mvp/ui/mode-toggle`
4. Ensure the app imports `@mvp/ui/globals.css` for the color system