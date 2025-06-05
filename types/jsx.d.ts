import "react";

declare module "react" {
  // Allow for the use of tw prop in React components
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    tw?: string;
  }
}
