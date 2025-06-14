import { useMDXComponents as getMDXComponents } from "@money/markdown/components";

export function useMDXComponents(components: any = {}): any {
  return getMDXComponents(components);
}
