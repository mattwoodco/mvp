"use client";

import { Button } from "../components/button";
import { useThemeModifier } from "./combined-provider";
import { OptimizedThemeSwitcher } from "./optimized-switcher";

export function ThemeDemo() {
  const { modifier } = useThemeModifier();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme Demo</h1>
          <p className="text-muted-foreground">
            Current modifier:{" "}
            <strong>{modifier === "none" ? "Default" : modifier}</strong>
          </p>
        </div>
        <OptimizedThemeSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Typography Card */}
        <div className="border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Typography</h2>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Heading Level 3</h3>
            <p className="text-base">
              This is a paragraph with normal text that demonstrates the current
              typography settings.
            </p>
            <p className="text-sm text-muted-foreground">
              Secondary text in muted colors for less important information.
            </p>
          </div>
        </div>

        {/* Buttons Card */}
        <div className="border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm">Primary</Button>
              <Button variant="secondary" size="sm">
                Secondary
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Outline
              </Button>
              <Button variant="destructive" size="sm">
                Destructive
              </Button>
            </div>
          </div>
        </div>

        {/* Colors Card */}
        <div className="border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Colors</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 bg-primary rounded" title="Primary" />
            <div className="h-12 bg-secondary rounded" title="Secondary" />
            <div className="h-12 bg-accent rounded" title="Accent" />
            <div className="h-12 bg-muted rounded" title="Muted" />
            <div className="h-12 bg-destructive rounded" title="Destructive" />
            <div className="h-12 bg-border rounded" title="Border" />
          </div>
        </div>

        {/* Form Elements Card */}
        <div className="border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Form Elements</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Text input"
              className="w-full px-3 py-2 border rounded-md bg-input focus:ring-2 focus:ring-ring focus:outline-none"
            />
            <textarea
              placeholder="Textarea"
              rows={3}
              className="w-full px-3 py-2 border rounded-md bg-input focus:ring-2 focus:ring-ring focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Spacing & Layout Card */}
        <div className="border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Spacing & Layout</h2>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded" />
              <div className="w-8 h-8 bg-secondary rounded" />
              <div className="w-8 h-8 bg-accent rounded" />
            </div>
            <div className="p-4 bg-muted rounded">
              Muted background container
            </div>
          </div>
        </div>

        {/* Interactive Elements Card */}
        <div className="border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Interactive</h2>
          <div className="space-y-3">
            <button
              type="button"
              className="w-full p-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              Hover Me
            </button>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="checkbox" className="rounded" />
              <label htmlFor="checkbox" className="text-sm">
                Checkbox
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="radio"
                name="demo"
                className="rounded-full"
              />
              <label htmlFor="radio" className="text-sm">
                Radio
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Modifier Information */}
      <div className="border rounded-lg p-6 bg-card text-card-foreground">
        <h2 className="text-xl font-semibold mb-4">
          Current Theme Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Modifier:</strong>{" "}
            {modifier === "none" ? "Default" : modifier}
          </div>
          <div>
            <strong>CSS Variables:</strong> Applied via data-modifier attribute
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">
          Switch between different theme modifiers using the switcher above to
          see how the design adapts with different typography, spacing, and
          visual treatments.
        </p>
      </div>
    </div>
  );
}
