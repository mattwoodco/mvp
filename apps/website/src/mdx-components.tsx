import { useMDXComponents as getMDXComponents } from "@mvp/markdown/components";

export function useMDXComponents(components: any = {}): any {
  return getMDXComponents(components);
}
