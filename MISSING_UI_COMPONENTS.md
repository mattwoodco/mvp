# Missing UI Components for Agent Implementation

The agent implementation requires several UI components that are not yet in the `@mvp/ui` package. These components are commonly available in component libraries like shadcn/ui.

## Required Components

### 1. Card Component
Used for content containers throughout the agent UI.
```tsx
// packages/ui/src/components/card.tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
}
```

### 2. Label Component
Used for form field labels.
```tsx
// packages/ui/src/components/label.tsx
export const Label = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<"label">>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium leading-none", className)} {...props} />
  )
)
```

### 3. Textarea Component
Used for multi-line text input.
```tsx
// packages/ui/src/components/textarea.tsx
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn("flex min-h-[80px] w-full rounded-md border", className)} {...props} />
  )
)
```

### 4. Checkbox Component
Used for boolean attribute selection.
```tsx
// packages/ui/src/components/checkbox.tsx
// Requires @radix-ui/react-checkbox
```

### 5. Tabs Components
Used for organizing the UI into setup/progress/results sections.
```tsx
// packages/ui/src/components/tabs.tsx
// Requires @radix-ui/react-tabs
export { Tabs, TabsContent, TabsList, TabsTrigger }
```

### 6. Badge Component
Used for displaying counts and status indicators.
```tsx
// packages/ui/src/components/badge.tsx
export function Badge({ className, variant = "default", ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
```

### 7. Tooltip Components
Used for displaying helpful information on hover.
```tsx
// packages/ui/src/components/tooltip.tsx
// Requires @radix-ui/react-tooltip
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
```

### 8. Progress Component
Used for showing generation progress.
```tsx
// packages/ui/src/components/progress.tsx
// Requires @radix-ui/react-progress
export function Progress({ value, className, ...props }) {
  return <div className={cn("relative h-4 w-full", className)} {...props}>...</div>
}
```

### 9. Dialog Components
Used for the save template modal.
```tsx
// packages/ui/src/components/dialog.tsx
// Requires @radix-ui/react-dialog
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
```

## Installation Options

### Option 1: Use shadcn/ui CLI (Recommended)
```bash
npx shadcn@latest add card label textarea checkbox tabs badge tooltip progress dialog
```

### Option 2: Install Radix UI primitives
```bash
npm install @radix-ui/react-checkbox @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-progress @radix-ui/react-dialog
```

### Option 3: Create simplified versions
For quick prototyping, create simplified HTML-based versions without the full Radix UI functionality.

## Update package.json exports
After adding components, update `packages/ui/package.json`:
```json
"exports": {
  "./card": "./src/components/card.tsx",
  "./label": "./src/components/label.tsx",
  "./textarea": "./src/components/textarea.tsx",
  "./checkbox": "./src/components/checkbox.tsx",
  "./tabs": "./src/components/tabs.tsx",
  "./badge": "./src/components/badge.tsx",
  "./tooltip": "./src/components/tooltip.tsx",
  "./progress": "./src/components/progress.tsx",
  "./dialog": "./src/components/dialog.tsx",
  // ... existing exports
}
```