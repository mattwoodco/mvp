import { useMDXComponents as getMDXComponents } from "@chatmtv/markdown/components";

export function useMDXComponents(components: any = {}): any {
  return getMDXComponents(components);
}
