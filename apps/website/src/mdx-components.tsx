import { useMDXComponents as getMDXComponents } from "@mvp/markdown/components";

export function useMDXComponents(components: any = {}) {
  return getMDXComponents(components);
}
