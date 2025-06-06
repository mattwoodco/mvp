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
  children?: React.ReactNode;
};

export type PropsWithClassName<T = Record<string, never>> = T & {
  className?: string;
};
