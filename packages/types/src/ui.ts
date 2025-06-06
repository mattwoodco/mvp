export type ComponentSize = "sm" | "md" | "lg" | "xl";
export type ComponentVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type BaseComponentProps = {
  className?: string;
  size?: ComponentSize;
  variant?: ComponentVariant;
};

export type WithChildren<T = Record<string, never>> = T & {
  children?: any;
};

export type PropsWithClassName<T = Record<string, never>> = T & {
  className?: string;
};

// Theme types
export type Theme = "light" | "dark" | "system";

export type ThemeProviderProps = {
  children: any;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: Theme;
  enableColorScheme?: boolean;
  scriptProps?: any;
  nonce?: string;
};

export type UseThemeProps = {
  theme?: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
  systemTheme?: "light" | "dark";
  resolvedTheme?: "light" | "dark";
};