"use client";

import {
  ChevronDown,
  Leaf,
  Minus,
  Moon,
  Sparkles,
  Square,
  Sun,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { useThemeModifier } from "./combined-provider";

const modifierConfig = {
  none: { icon: Square, label: "Default" },
  condensed: { icon: Minus, label: "Condensed" },
  minimal: { icon: Square, label: "Minimal" },
  elegant: { icon: Sparkles, label: "Elegant" },
  natural: { icon: Leaf, label: "Natural" },
  cyberpunk: { icon: Zap, label: "Cyberpunk" },
} as const;

export function OptimizedThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { modifier, setModifier } = useThemeModifier();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex">
        <Button variant="outline" size="sm" className="rounded-r-none px-3">
          <Sun className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-l-none border-l-0 px-2"
        >
          <ChevronDown className="size-3" />
        </Button>
      </div>
    );
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const ModifierIcon = modifierConfig[modifier].icon;
  const isDark = theme === "dark";

  return (
    <div className="flex">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="rounded-r-none px-3"
      >
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        {modifier !== "none" && (
          <ModifierIcon className="ml-1 size-3 opacity-60" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none border-l-0 px-2"
          >
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme Modifiers</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(modifierConfig).map(
            ([key, { icon: Icon, label }]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setModifier(key as any)}
                className="flex items-center"
              >
                <Icon className="mr-2 size-4" />
                {label}
                {modifier === key && (
                  <span className="ml-auto size-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
